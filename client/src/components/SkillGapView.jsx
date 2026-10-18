import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Zap,
  Target,
  RefreshCw,
  Search,
  ExternalLink,
  Plus
} from 'lucide-react';

export default function SkillGapView({
  applications,
  onRefreshApplications,
  onSelectApplication,
  onOpenProfile
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <Target className="w-4 h-4" />
              <span>Target Role & Profile Alignment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {user?.targetRole || 'Full Stack Software Engineer'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Job Hunt OS checks your active resume profile against live job requirements, highlighting technical overlaps, missing prerequisites, and targeted interview prep strategies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenProfile}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition"
            >
              Edit Resume & Skills
            </button>
            <button
              onClick={onRefreshApplications}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-scan All Jobs
            </button>
          </div>
        </div>

        {/* User Skills Pills */}
        <div className="mt-5 pt-4 border-t border-slate-700/60">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Your Indexed Resume Skills ({user?.resumeSkills?.length || 0})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(user?.resumeSkills || []).map((skill, idx) => (
              <span
                key={idx}
                className="text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-2.5 py-1 rounded-lg"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive AI Skill Gap Sandbox */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Instant AI Skill Gap Checker</h3>
            <p className="text-xs text-slate-400">
              Paste any job posting or requirement text below to compare against your resume in real time.
            </p>
          </div>
        </div>

        <form onSubmit={handleLiveAnalyze} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Netflix, Anthropic"
                value={pasteCompany}
                onChange={(e) => setPasteCompany(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={pasteRole}
                onChange={(e) => setPasteRole(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Job Description / Requirements Text
            </label>
            <textarea
              rows={4}
              placeholder="Paste requirements, tech stack mentions, or qualifications here..."
              value={pasteDesc}
              onChange={(e) => setPasteDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={analyzing || !pasteDesc.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Skills...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Skill Gap
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Analysis Results Modal/Card */}
        {liveResult && (
          <div className="mt-6 pt-6 border-t border-slate-700/80 bg-slate-900/80 rounded-xl p-5 border border-emerald-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Analysis Result</span>
                <h4 className="text-lg font-bold text-white">
                  Match Score: <span className="text-emerald-400">{liveResult.matchScore}%</span>
                </h4>
                <p className="text-xs text-slate-400">{liveResult.summary}</p>
              </div>

              <button
                onClick={handleSaveAnalyzedAsApp}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Save as Application
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Matched Skills */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matching Skills ({liveResult.matchedSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(liveResult.matchedSkills || []).map((sk, i) => (
                    <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {sk}
                    </span>
                  ))}
                  {(!liveResult.matchedSkills || liveResult.matchedSkills.length === 0) && (
                    <span className="text-xs text-slate-500">None detected</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Missing Requirements ({liveResult.missingSkills?.length || 0})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(liveResult.missingSkills || []).map((sk, i) => (
                    <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">
                      {sk}
                    </span>
                  ))}
                  {(!liveResult.missingSkills || liveResult.missingSkills.length === 0) && (
                    <span className="text-xs text-emerald-400">All prerequisites satisfied!</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            {liveResult.aiRecommendations?.length > 0 && (
              <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Actionable Preparation Strategy</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {liveResult.aiRecommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">▸</span>
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
            <h3 className="text-lg font-bold text-white">Application Alignment Scores</h3>
            <p className="text-xs text-slate-400">
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app._id}
              onClick={() => onSelectApplication(app)}
              className="group cursor-pointer bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 rounded-2xl p-5 transition-all shadow-md"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                      {app.company}
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {app.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{app.role}</p>
                </div>

                {/* Score Pill */}
                <div className={`px-2.5 py-1 rounded-xl text-center border font-extrabold text-xs ${
                  app.matchScore >= 80
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : app.matchScore >= 60
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {app.matchScore || 0}% Match
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-700/50 rounded-full h-1.5 mb-3.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    app.matchScore >= 80 ? 'bg-emerald-400' :
                    app.matchScore >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                  }`}
                  style={{ width: `${app.matchScore || 0}%` }}
                />
              </div>

              {/* Matched vs Missing preview */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                    Matched ({app.matchedSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(app.matchedSkills || []).slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[11px]">
                        {sk}
                      </span>
                    ))}
                    {(app.matchedSkills || []).length > 5 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{app.matchedSkills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    Missing Gaps ({app.missingSkills?.length || 0})
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(app.missingSkills || []).slice(0, 5).map((sk, idx) => (
                      <span key={idx} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[11px]">
                        {sk}
                      </span>
                    ))}
                    {(app.missingSkills || []).length === 0 && (
                      <span className="text-[11px] text-emerald-400">Zero skill gaps! Full overlap.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
