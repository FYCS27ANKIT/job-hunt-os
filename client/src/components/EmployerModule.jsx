import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Briefcase,
  Calendar,
  Building2,
  Plus,
  Search,
  Filter,
  Sparkles,
  Download,
  FileText,
  Clock,
  Video,
  CheckCircle2,
  Trash2,
  Edit,
  DollarSign,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';

export default function EmployerModule({ onRefreshAll }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('applicants'); // 'applicants', 'jobs', 'interviews', 'analytics'
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters for applicants
  const [applicantSearch, setApplicantSearch] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');

  // Modals
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [candidateForInterview, setCandidateForInterview] = useState(null);

  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    department: 'Engineering',
    location: 'Remote',
    workType: 'Remote',
    jobType: 'Full-time',
    salaryMin: 140000,
    salaryMax: 180000,
    experienceLevel: 'Senior Level',
    requiredSkills: '',
    description: '',
    responsibilities: '',
    benefits: ''
  });

  // Interview Form State
  const [interviewForm, setInterviewForm] = useState({
    round: 'Technical Screen',
    date: '',
    time: '14:00',
    durationMinutes: 45,
    meetingLink: '',
    preparationNotes: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes, statsRes] = await Promise.all([
        API.get('/employer/applicants'),
        API.get('/jobs/employer/my-jobs'),
        API.get('/employer/stats')
      ]);

      setApplicants(appsRes.data);
      setJobs(jobsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load employer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await API.patch(`/employer/applicants/${applicantId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update applicant stage.');
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await API.post('/jobs', {
        title: newJob.title,
        department: newJob.department,
        location: newJob.location,
        workType: newJob.workType,
        jobType: newJob.jobType,
        salary: { min: Number(newJob.salaryMin), max: Number(newJob.salaryMax), currency: 'USD' },
        experienceLevel: newJob.experienceLevel,
        requiredSkills: newJob.requiredSkills,
        description: newJob.description,
        responsibilities: newJob.responsibilities ? newJob.responsibilities.split('\n') : [],
        benefits: newJob.benefits ? newJob.benefits.split('\n') : []
      });

      alert('Job opening published successfully!');
      setIsPostJobModalOpen(false);
      setNewJob({
        title: '',
        department: 'Engineering',
        location: 'Remote',
        workType: 'Remote',
        jobType: 'Full-time',
        salaryMin: 140000,
        salaryMax: 180000,
        experienceLevel: 'Senior Level',
        requiredSkills: '',
        description: '',
        responsibilities: '',
        benefits: ''
      });
      fetchData();
    } catch (err) {
      console.error('Error posting job:', err);
      alert('Failed to post job.');
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!candidateForInterview || !interviewForm.date) return;

    try {
      const scheduledAt = new Date(`${interviewForm.date}T${interviewForm.time || '14:00'}`);
      await API.post(`/employer/applicants/${candidateForInterview._id}/schedule-interview`, {
        round: interviewForm.round,
        scheduledAt,
        durationMinutes: Number(interviewForm.durationMinutes),
        meetingLink: interviewForm.meetingLink,
        preparationNotes: interviewForm.preparationNotes
      });

      alert(`Interview invitation scheduled with ${candidateForInterview.candidateName || 'candidate'}!`);
      setIsInterviewModalOpen(false);
      setCandidateForInterview(null);
      fetchData();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      alert('Failed to schedule interview.');
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch =
      (app.candidateName && app.candidateName.toLowerCase().includes(applicantSearch.toLowerCase())) ||
      (app.candidateEmail && app.candidateEmail.toLowerCase().includes(applicantSearch.toLowerCase())) ||
      (app.role && app.role.toLowerCase().includes(applicantSearch.toLowerCase()));

    const matchesJob = selectedJobFilter === 'all' || (app.job && (app.job._id === selectedJobFilter || app.job === selectedJobFilter));
    const matchesStage = selectedStageFilter === 'all' || app.status === selectedStageFilter;

    return matchesSearch && matchesJob && matchesStage;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Employer Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>{user?.companyName || 'TechCorp Labs'} • Hiring Workspace</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Employer Applicant Tracking & Pipeline
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Review incoming candidates, inspect verified resume uploads, track ATS skill matches, and schedule interviews.
            </p>
          </div>

          <button
            onClick={() => setIsPostJobModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-teal-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Post New Job Opening
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('applicants')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'applicants'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Candidate Applicants ({applicants.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            My Job Postings ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Hiring Funnel & Stats
          </button>
        </div>
      </div>

      {/* TAB 1: APPLICANTS PIPELINE */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name or role..."
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 max-w-[200px] truncate"
              >
                <option value="all">All Jobs</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title}</option>
                ))}
              </select>

              <select
                value={selectedStageFilter}
                onChange={(e) => setSelectedStageFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
              >
                <option value="all">All Stages</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Candidates List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredApplicants.map((applicant) => {
              const resumePath = applicant.candidateResumeUrl || applicant.user?.resumeUrl;
              const resumeName = applicant.candidateResumeFileName || applicant.user?.resumeOriginalName || 'Candidate_Resume.pdf';

              return (
                <div
                  key={applicant._id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 transition-all shadow-md"
                >
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Candidate Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-teal-300 font-extrabold text-base flex items-center justify-center shrink-0">
                        {applicant.candidateName ? applicant.candidateName[0] : (applicant.user?.name ? applicant.user.name[0] : 'C')}
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-extrabold text-base text-white">
                            {applicant.candidateName || applicant.user?.name || 'Candidate'}
                          </h3>
                          <div
                            className={`flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${
                              applicant.matchScore >= 80
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : applicant.matchScore >= 60
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-slate-700/30 text-slate-400 border-slate-700'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{applicant.matchScore || 75}% ATS Match</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          Applied for: <span className="text-teal-400 font-bold">{applicant.role}</span>
                          {applicant.location && ` • ${applicant.location}`}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Email: {applicant.candidateEmail || applicant.user?.email}</span>
                          {applicant.candidatePhone && <span>• Phone: {applicant.candidatePhone}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Stage & Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
                      {/* Resume Download / View */}
                      {resumePath ? (
                        <a
                          href={resumePath}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
                          title="Download candidate uploaded resume"
                        >
                          <Download className="w-3.5 h-3.5 text-teal-400" />
                          <span>View Resume</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">No resume file</span>
                      )}

                      {/* Schedule Interview */}
                      <button
                        onClick={() => {
                          setCandidateForInterview(applicant);
                          setIsInterviewModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md active:scale-95"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Schedule Interview
                      </button>

                      {/* Stage Selector */}
                      <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Stage:</span>
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant._id, e.target.value)}
                          className="bg-transparent text-xs font-bold text-white focus:outline-none"
                        >
                          <option value="Applied" className="bg-slate-900">Applied</option>
                          <option value="Screening" className="bg-slate-900">Screening</option>
                          <option value="Interviewing" className="bg-slate-900">Interviewing</option>
                          <option value="Offer" className="bg-slate-900">Offer Extended</option>
                          <option value="Rejected" className="bg-slate-900">Archived / Rejected</option>
                        </select>
                      </div>

                      <button
                        onClick={() => setSelectedCandidate(applicant)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                        title="View profile & cover note"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Skills summary row */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Matched Skills:
                    </span>
                    {(applicant.matchedSkills || []).slice(0, 6).map((sk, i) => (
                      <span key={i} className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {sk}
                      </span>
                    ))}

                    {applicant.missingSkills?.length > 0 && (
                      <>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-2">
                          Missing:
                        </span>
                        {applicant.missingSkills.slice(0, 3).map((sk, i) => (
                          <span key={i} className="text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                            {sk}
                          </span>
                        ))}
                      </>
                    )}

                    {applicant.candidateCoverNote && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 w-full mt-2">
                        Cover Note: "{applicant.candidateCoverNote}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredApplicants.length === 0 && (
              <div className="py-16 text-center bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-300">No candidate applicants found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Candidates applying to your jobs will appear here with parsed resumes and match scores.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY JOB POSTINGS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                        {job.department}
                      </span>
                      <h3 className="font-extrabold text-base text-white leading-tight mt-0.5">
                        {job.title}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      job.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-700/50 text-slate-400 border-slate-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 my-3">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location} • {job.workType} ({job.jobType})
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      ${(job.salary?.min / 1000).toFixed(0)}k - ${(job.salary?.max / 1000).toFixed(0)}k
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {(job.requiredSkills || []).slice(0, 4).map((sk, i) => (
                      <span key={i} className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">
                    {job.applicantsCount || 0} candidate{job.applicantsCount === 1 ? '' : 's'} applied
                  </span>

                  <button
                    onClick={() => {
                      setSelectedJobFilter(job._id);
                      setActiveTab('applicants');
                    }}
                    className="text-xs text-slate-300 hover:text-white font-semibold underline"
                  >
                    View Applicants →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HIRING STATS & FUNNEL */}
      {activeTab === 'analytics' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Active Job Postings</div>
              <div className="text-2xl font-black text-white mt-1">{stats.activeJobsCount}</div>
              <div className="text-[11px] text-teal-400 mt-1">{stats.totalJobsCount} total postings</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Total Applicants Received</div>
              <div className="text-2xl font-black text-white mt-1">{stats.totalApplicants}</div>
              <div className="text-[11px] text-emerald-400 mt-1">Platform candidates</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Active Screening & Loops</div>
              <div className="text-2xl font-black text-white mt-1">{stats.screeningCount + stats.interviewingCount}</div>
              <div className="text-[11px] text-amber-400 mt-1">{stats.interviewingCount} in technical rounds</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Avg ATS Candidate Match</div>
              <div className="text-2xl font-black text-white mt-1">{stats.avgMatchScore}%</div>
              <div className="text-[11px] text-teal-400 mt-1">Resume qualification score</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3">Applicant Stage Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              {Object.entries(stats.stageCounts || {}).map(([stage, count]) => (
                <div key={stage} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xs font-bold text-slate-400 uppercase">{stage}</div>
                  <div className="text-xl font-black text-white mt-1">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: POST NEW JOB */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Post New Job Opening</h3>
                <p className="text-xs text-slate-400">Will be listed on the platform job board for candidates to apply.</p>
              </div>
              <button onClick={() => setIsPostJobModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Backend Engineer"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering / Product"
                    value={newJob.department}
                    onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Work Mode</label>
                  <select
                    value={newJob.workType}
                    onChange={(e) => setNewJob({ ...newJob, workType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Job Type</label>
                  <select
                    value={newJob.jobType}
                    onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Experience Level</label>
                  <select
                    value={newJob.experienceLevel}
                    onChange={(e) => setNewJob({ ...newJob, experienceLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Lead / Staff">Lead / Staff</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="San Francisco, CA or Remote"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Min ($)</label>
                  <input
                    type="number"
                    value={newJob.salaryMin}
                    onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Salary Max ($)</label>
                  <input
                    type="number"
                    value={newJob.salaryMax}
                    onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Required Technical Skills (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Node.js, MongoDB, Docker, REST APIs"
                  value={newJob.requiredSkills}
                  onChange={(e) => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detailed role scope, responsibilities, and team mission..."
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md active:scale-95"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE INTERVIEW WITH APPLICANT */}
      {isInterviewModalOpen && candidateForInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Schedule Interview with {candidateForInterview.candidateName || candidateForInterview.user?.name}
                </h3>
                <p className="text-xs text-slate-400">Role: {candidateForInterview.role}</p>
              </div>
              <button onClick={() => setIsInterviewModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Round Type</label>
                  <select
                    value={interviewForm.round}
                    onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Recruiter Screen">Recruiter Screen</option>
                    <option value="Technical Screen">Technical Screen</option>
                    <option value="Live Coding">Live Coding</option>
                    <option value="System Design">System Design</option>
                    <option value="Hiring Manager">Hiring Manager</option>
                    <option value="Executive / Final Round">Executive / Final Round</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration</label>
                  <select
                    value={interviewForm.durationMinutes}
                    onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={interviewForm.date}
                    onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={interviewForm.time}
                    onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Link (Zoom / Google Meet)</label>
                <input
                  type="text"
                  placeholder="https://meet.google.com/xyz"
                  value={interviewForm.meetingLink}
                  onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preparation & Focus Notes</label>
                <textarea
                  rows={3}
                  placeholder="Focus topics, system design questions to prepare, candidate context..."
                  value={interviewForm.preparationNotes}
                  onChange={(e) => setInterviewForm({ ...interviewForm, preparationNotes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md active:scale-95"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CANDIDATE DETAIL & FULL RESUME PREVIEW */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedCandidate.candidateName || selectedCandidate.user?.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Role: {selectedCandidate.role} • Match: {selectedCandidate.matchScore}%
                </p>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Cover Note */}
              {selectedCandidate.candidateCoverNote && (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-1">
                    Candidate Note to Hiring Team:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedCandidate.candidateCoverNote}
                  </p>
                </div>
              )}

              {/* Resume File Bar */}
              {(selectedCandidate.candidateResumeUrl || selectedCandidate.user?.resumeUrl) && (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-teal-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-teal-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {selectedCandidate.candidateResumeFileName || selectedCandidate.user?.resumeOriginalName || 'Candidate_Resume.pdf'}
                      </div>
                      <div className="text-[10px] text-slate-400">Uploaded file verified</div>
                    </div>
                  </div>
                  <a
                    href={selectedCandidate.candidateResumeUrl || selectedCandidate.user?.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download File
                  </a>
                </div>
              )}

              {/* Parsed Resume Text */}
              {selectedCandidate.user?.resumeText && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Extracted Resume Content:
                  </div>
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 max-h-56 overflow-y-auto whitespace-pre-line leading-relaxed font-mono">
                    {selectedCandidate.user.resumeText}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
