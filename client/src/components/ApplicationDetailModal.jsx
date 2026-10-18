import React, { useState } from 'react';
import API from '../services/api';
import {
  X,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Trash2,
  RefreshCw,
  Plus,
  Send,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function ApplicationDetailModal({
  application,
  onClose,
  onUpdated,
  onScheduleInterview
}) {
  const [app, setApp] = useState(application);
  const [rescanning, setRescanning] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [showFollowUpBox, setShowFollowUpBox] = useState(false);

  if (!application) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await API.patch(`/applications/${app._id}/status`, { status: newStatus });
      setApp(res.data);
      onUpdated();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRescan = async () => {
    setRescanning(true);
    try {
      const res = await API.post(`/applications/${app._id}/rescan`);
      setApp(res.data.application);
      onUpdated();
    } catch (err) {
      console.error('Failed to rescan:', err);
      alert('Failed to re-scan application');
    } finally {
      setRescanning(false);
    }
  };

  const handleRecordFollowUp = async () => {
    try {
      const res = await API.post(`/applications/${app._id}/follow-up`, {
        status: 'Sent',
        notes: followUpNotes || 'Sent email follow-up to recruiter'
      });
      setApp(res.data.application);
      setShowFollowUpBox(false);
      setFollowUpNotes('');
      onUpdated();
    } catch (err) {
      console.error('Failed to record follow-up:', err);
      alert('Failed to record follow-up');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete application for ${app.company}?`)) return;
    try {
      await API.delete(`/applications/${app._id}`);
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to delete application:', err);
      alert('Failed to delete application');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-extrabold text-white">{app.company}</h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                app.matchScore >= 80 ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                app.matchScore >= 60 ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                'bg-slate-700/30 text-slate-400 border-slate-700'
              }`}>
                {app.matchScore || 0}% ATS Match
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-2">
              <span>{app.role}</span>
              <span className="text-slate-600">•</span>
              <span>{app.location || 'Remote'}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">{app.workType}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
              title="Delete application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Stage Progression & Follow-up Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Current Pipeline Stage
              </label>
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Screening">Screening</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer Received</option>
                <option value="Rejected">Archived / Rejected</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Follow-Up Status
                </label>
                <button
                  onClick={() => setShowFollowUpBox(!showFollowUpBox)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  {showFollowUpBox ? 'Cancel' : '+ Record Outreach'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                <span className="font-semibold">{app.followUpStatus || 'Pending'}</span>
                <span className="text-slate-400 text-[11px]">
                  Applied: {new Date(app.applicationDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Follow-up Note Box */}
            {showFollowUpBox && (
              <div className="md:col-span-2 pt-2 border-t border-slate-800 space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Sent polite email to recruiter Sarah on LinkedIn..."
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleRecordFollowUp}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Mark Follow-up Sent
                </button>
              </div>
            )}
          </div>

          {/* AI Skill Gap Card */}
          <div className="bg-slate-950/70 border border-emerald-500/25 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Skill Gap Analysis</h3>
              </div>
              <button
                onClick={handleRescan}
                disabled={rescanning}
                className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rescanning ? 'animate-spin' : ''}`} />
                <span>{rescanning ? 'Analyzing...' : 'Re-scan with Resume'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
              <div className="bg-slate-900 p-3 rounded-lg border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                  Matched Skills ({app.matchedSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {(app.matchedSkills || []).map((sk, i) => (
                    <span key={i} className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[11px]">
                      {sk}
                    </span>
                  ))}
                  {(!app.matchedSkills || app.matchedSkills.length === 0) && (
                    <span className="text-slate-500 italic">None detected</span>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-amber-500/20">
                <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                  Missing Prerequisites ({app.missingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1">
                  {(app.missingSkills || []).map((sk, i) => (
                    <span key={i} className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[11px]">
                      {sk}
                    </span>
                  ))}
                  {(!app.missingSkills || app.missingSkills.length === 0) && (
                    <span className="text-emerald-400 italic">All skills satisfied!</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Actionable Recommendations */}
            {app.aiRecommendations?.length > 0 && (
              <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Interview Strategy & Bridging the Gap</span>
                </div>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {app.aiRecommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">▸</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Job Description Text */}
          {app.jobDescription && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Job Description & Scope</h4>
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line max-h-48 overflow-y-auto leading-relaxed">
                {app.jobDescription}
              </div>
            </div>
          )}

          {/* Timeline History */}
          {app.timeline?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Application Timeline</h4>
              <div className="space-y-2 border-l-2 border-slate-800 pl-4 ml-2">
                {app.timeline.map((evt, idx) => (
                  <div key={idx} className="relative text-xs">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-slate-900" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{evt.stage}</span>
                      <span className="text-[10px] text-slate-500">{new Date(evt.date).toLocaleDateString()}</span>
                    </div>
                    {evt.note && <p className="text-slate-400 text-[11px] mt-0.5">{evt.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Interview for this application button */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={() => {
                onClose();
                onScheduleInterview(app);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule Interview for {app.company}
            </button>

            {app.jobUrl && (
              <a
                href={app.jobUrl.startsWith('http') ? app.jobUrl : `https://${app.jobUrl}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
              >
                <span>View Job Posting</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
