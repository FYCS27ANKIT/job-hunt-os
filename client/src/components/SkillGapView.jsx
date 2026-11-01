import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Target,
  RefreshCw,
  Search,
  Plus
} from 'lucide-react';

export default function SkillGapView({
  applications,
  onRefreshApplications,
  onSelectApplication,
  onOpenProfile,
  onOpenResumeModal
}) {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [pasteRole, setPasteRole] = useState('');
  const [pasteCompany, setPasteCompany] = useState('');
  const [pasteDesc, setPasteDesc] = useState('');
  const [liveResult, setLiveResult] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');

  const handleLiveAnalyze = async (e) => {
    e.preventDefault();
    if (!pasteDesc.trim()) return;

    setAnalyzing(true);
    try {
      const res = await API.post('/ai/match-skills', {
        jobDescription: pasteDesc,
        role: pasteRole || 'Full Stack Engineer'
      });
      setLiveResult(res.data);
    } catch (err) {
      console.error('Error analyzing skill gap:', err);
      alert('Error analyzing job description. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveAnalyzedAsApp = async () => {
    if (!pasteCompany) {
      alert('Please enter a Company name first.');
      return;
    }

    try {
      await API.post('/applications', {
        company: pasteCompany,
        role: pasteRole || 'Software Engineer',
        jobDescription: pasteDesc,
        status: 'Wishlist',
        priority: 'Medium'
      });
      alert(`Saved "${pasteCompany}" to your Kanban board!`);
      setLiveResult(null);
      setPasteCompany('');
      setPasteRole('');
      setPasteDesc('');
      onRefreshApplications();
    } catch (err) {
      console.error('Failed to save application:', err);
      alert('Failed to save application');
    }
  };

  const filteredApps = applications.filter(a =>
    a.company.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.role.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* User Resume Profile Summary Bar */}
      <div className="bg-gradient-to-r from-sky-50 via-white to-indigo-50/50 border border-sky-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
              <Target className="w-4 h-4" />
              <span>Target Role & Profile Alignment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {user?.targetRole || 'Full Stack Software Engineer'}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Job Hunt OS checks your active resume profile against live job requirements, highlighting technical overlaps, missing prerequisites, and targeted interview prep strategies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenResumeModal && (
              <button
                onClick={onOpenResumeModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl text-xs font-bold text-sky-800 transition"
              >
                <span>📄</span>
                <span>{user?.resumeUrl ? 'Manage Resume File' : 'Upload Resume File'}</span>
              </button>
            )}
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition shadow-2xs"
            >
              Edit Profile
            </button>
            <button
              onClick={onRefreshApplications}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition shadow-sm shadow-sky-600/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-scan All Jobs
            </button>
          </div>
        </div>

        {/* User Skills Pills */}
        <div className="mt-5 pt-4 border-t border-sky-100">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Your Indexed Resume Skills ({user?.resumeSkills?.length || 0})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(user?.resumeSkills || []).map((skill, idx) => (
              <span
                key={idx}
                className="text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive AI Skill Gap Sandbox */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Instant AI Skill Gap Checker</h3>
            <p className="text-xs text-slate-500">
              Paste any job posting or requirement text below to compare against your resume in real time.
            </p>
          </div>
        </div>

        <form onSubmit={handleLiveAnalyze} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Netflix, Anthropic"
                value={pasteCompany}
                onChange={(e) => setPasteCompany(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={pasteRole}
                onChange={(e) => setPasteRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description / Requirements Text
            </label>
            <textarea
              rows={4}
              placeholder="Paste requirements, tech stack mentions, or qualifications here..."
              value={pasteDesc}
              onChange={(e) => setPasteDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={analyzing || !pasteDesc.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-sm shadow-sky-600/20 active:scale-95"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Skills...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze Skill Gap</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Analysis Results Modal/Card */}
        {liveResult && (
          <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50/70 rounded-xl p-5 border border-sky-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Analysis Result</span>
                <h4 className="text-lg font-bold text-slate-900">
                  Match Score: <span className="text-sky-700">{liveResult.matchScore}%</span>
                </h4>
                <p className="text-xs text-slate-600">{liveResult.summary}</p>
              </div>

              <button
                onClick={handleSaveAnalyzedAsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Save as Application
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Matched Skills */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Matching Skills ({liveResult.matchedSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(liveResult.matchedSkills || []).map((sk, i) => (
                    <span key={i} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                      {sk}
                    </span>
                  ))}
                  {(!liveResult.matchedSkills || liveResult.matchedSkills.length === 0) && (
                    <span className="text-xs text-slate-400">None detected</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-white p-4 rounded-xl border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Missing Requirements ({liveResult.missingSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(liveResult.missingSkills || []).map((sk, i) => (
                    <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                      {sk}
                    </span>
                  ))}
                  {(!liveResult.missingSkills || liveResult.missingSkills.length === 0) && (
                    <span className="text-xs text-emerald-700 font-medium">All prerequisites satisfied!</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {liveResult.aiRecommendations?.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Actionable Preparation Strategy</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {liveResult.aiRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-sky-600 mt-0.5">▸</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tracked Applications Skill Breakdown List */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Application Alignment Scores</h3>
            <p className="text-xs text-slate-500">
              Live skill match ratings and gap analysis across all tracked jobs on your Kanban board.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by company or role..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              onClick={() => onSelectApplication(app)}
              className="group cursor-pointer bg-white hover:bg-slate-50/60 border border-slate-200/90 hover:border-sky-300 rounded-2xl p-5 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-slate-900 group-hover:text-sky-700 transition-colors">
                      {app.company}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{app.role}</p>
                </div>

                {/* Score Pill */}
                <div className={`px-2.5 py-1 rounded-xl text-center border font-extrabold text-xs ${
                  app.matchScore >= 80
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : app.matchScore >= 60
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {app.matchScore || 0}% Match
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    app.matchScore >= 80 ? 'bg-emerald-500' :
                    app.matchScore >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${app.matchScore || 0}%` }}
                />
              </div>

              {/* Matched vs Missing Tags */}
              <div className="space-y-2 text-xs">
                {app.matchedSkills?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide mr-2">Matches:</span>
                    <span className="text-slate-600">{app.matchedSkills.slice(0, 4).join(', ')}</span>
                    {app.matchedSkills.length > 4 && <span className="text-slate-400 ml-1">+{app.matchedSkills.length - 4} more</span>}
                  </div>
                )}

                {app.missingSkills?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mr-2">Gaps:</span>
                    <span className="text-slate-600">{app.missingSkills.slice(0, 4).join(', ')}</span>
                    {app.missingSkills.length > 4 && <span className="text-slate-400 ml-1">+{app.missingSkills.length - 4} more</span>}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredApps.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
              No applications tracked yet. Add jobs from your Kanban board or verified job board.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
