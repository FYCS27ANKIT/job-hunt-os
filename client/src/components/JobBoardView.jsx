import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Sparkles,
  Building2,
  CheckCircle2,
  Send,
  FileText,
  X
} from 'lucide-react';

export default function JobBoardView({
  onApplicationCreated,
  onOpenResumeModal
}) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('all');
  const [expFilter, setExpFilter] = useState('all');

  // Application Modal state
  const [applyingJob, setApplyingJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jobsRes, myAppsRes] = await Promise.all([
        API.get('/jobs'),
        API.get('/applications')
      ]);

      setJobs(jobsRes.data);
      const appliedIds = new Set(myAppsRes.data.map(a => a.job).filter(Boolean));
      setAppliedJobIds(appliedIds);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyingJob) return;

    setSubmitting(true);
    try {
      await API.post(`/jobs/${applyingJob._id}/apply`, {
        coverNote,
        phone
      });

      alert(`Application sent to ${applyingJob.company}! Your card is now active on your Kanban board.`);
      setAppliedJobIds(prev => new Set([...prev, applyingJob._id]));
      setApplyingJob(null);
      setCoverNote('');
      setPhone('');
      if (onApplicationCreated) onApplicationCreated();
    } catch (err) {
      console.error('Failed to apply:', err);
      alert(err.response?.data?.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(search.toLowerCase())) ||
      (job.requiredSkills || []).some(s => s.toLowerCase().includes(search.toLowerCase()));

    const matchesWorkType = workTypeFilter === 'all' || job.workType === workTypeFilter;
    const matchesExp = expFilter === 'all' || job.experienceLevel === expFilter;

    return matchesSearch && matchesWorkType && matchesExp;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50/50 border border-sky-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              <Briefcase className="w-4 h-4" />
              <span>Verified Employer Job Openings</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Browse Platform Job Postings
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
              Apply directly to verified employers with your active profile & resume. Applications sync directly into both your personal Kanban board and the employer's applicant tracking pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!user?.resumeUrl && (
              <button
                onClick={onOpenResumeModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                Upload Resume First
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role, company, or skills (e.g. React, Node.js)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={workTypeFilter}
            onChange={(e) => setWorkTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Work Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>

          <select
            value={expFilter}
            onChange={(e) => setExpFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Experience Levels</option>
            <option value="Entry Level">Entry Level</option>
            <option value="Mid Level">Mid Level</option>
            <option value="Senior Level">Senior Level</option>
            <option value="Lead / Staff">Lead / Staff</option>
          </select>
        </div>
      </div>

      {/* Job Postings Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs font-medium">
          Loading employer postings...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.has(job._id);
            const score = job.candidateMatchScore || 80;

            return (
              <div
                key={job._id}
                className="bg-white border border-slate-200/90 hover:border-sky-300 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Company & Score */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-base leading-tight">
                          {job.company}
                        </span>
                        {job.featured && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-sky-700 mt-0.5">{job.title}</h3>
                      <p className="text-[11px] text-slate-500">{job.department}</p>
                    </div>

                    <div
                      className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-xl border shrink-0 ${
                        score >= 80
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : score >= 60
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                      title="Your estimated ATS skill match score"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{score}% Match</span>
                    </div>
                  </div>

                  {/* Metadata Tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location} ({job.workType})
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-semibold flex items-center">
                      <DollarSign className="w-3 h-3" />
                      ${(job.salary?.min / 1000).toFixed(0)}k - ${(job.salary?.max / 1000).toFixed(0)}k
                    </span>
                  </div>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-3 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Required Skills */}
                  <div className="mb-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Required Skills:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(job.requiredSkills || []).slice(0, 5).map((sk, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                      {(job.requiredSkills || []).length > 5 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {job.applicantsCount || 0} applicant{job.applicantsCount === 1 ? '' : 's'}
                  </span>

                  {hasApplied ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => setApplyingJob(job)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-sm active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      1-Click Apply
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-700">No jobs match your filters</h4>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search query or mode filters.</p>
            </div>
          )}
        </div>
      )}

      {/* 1-Click Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Application</h3>
                <p className="text-xs text-slate-500">{applyingJob.title} at {applyingJob.company}</p>
              </div>
              <button
                onClick={() => setApplyingJob(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-xs text-sky-900">
                <div className="font-bold mb-0.5">Resume Attachment:</div>
                <div className="text-slate-600 font-medium">
                  {user?.resumeOriginalName || 'Default Candidate Profile Resume'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quick Note / Pitch to Recruiter</label>
                <textarea
                  rows={4}
                  placeholder="Introduce yourself and explain why you're a great fit for this position..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-sky-600/20 active:scale-95 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Confirm & Apply'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
