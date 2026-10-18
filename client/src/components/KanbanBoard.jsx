import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const COLUMNS = [
  { id: 'Wishlist', label: 'Wishlist', color: 'border-slate-700 bg-slate-900/40 text-slate-400' },
  { id: 'Applied', label: 'Applied', color: 'border-blue-500/30 bg-blue-950/20 text-blue-400' },
  { id: 'Screening', label: 'Screening', color: 'border-indigo-500/30 bg-indigo-950/20 text-indigo-400' },
  { id: 'Interviewing', label: 'Interviewing', color: 'border-amber-500/30 bg-amber-950/20 text-amber-400' },
  { id: 'Offer', label: 'Offer Received', color: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400' },
  { id: 'Rejected', label: 'Archived / Rejected', color: 'border-rose-500/30 bg-rose-950/20 text-rose-400' }
];

export default function KanbanBoard({
  applications,
  onUpdateStatus,
  onSelectApplication,
  onOpenNewModal
}) {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [draggedAppId, setDraggedAppId] = useState(null);

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.company.toLowerCase().includes(search.toLowerCase()) ||
      app.role.toLowerCase().includes(search.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(search.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || app.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (appId) {
      onUpdateStatus(appId, targetStatus);
    }
    setDraggedAppId(null);
  };

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return 0;
    const diff = new Date() - new Date(dateStr);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <button
            onClick={() => onOpenNewModal('Applied')}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Application
          </button>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-h-[680px] pb-6 items-start">
        {COLUMNS.map((col) => {
          const colApps = filteredApps.filter(app => app.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex flex-col bg-slate-900/60 rounded-2xl border border-slate-800 p-3 min-h-[500px] transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col.id === 'Offer' ? 'bg-emerald-400' :
                    col.id === 'Interviewing' ? 'bg-amber-400' :
                    col.id === 'Screening' ? 'bg-indigo-400' :
                    col.id === 'Applied' ? 'bg-blue-400' :
                    col.id === 'Rejected' ? 'bg-rose-400' : 'bg-slate-400'
                  }`} />
                  <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                    {col.label}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                  {colApps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
                {colApps.map((app) => {
                  const daysAgo = getDaysAgo(app.lastContactDate || app.applicationDate);
                  const isFollowUpDue = app.followUpStatus === 'Pending' && daysAgo >= 5 && ['Applied', 'Screening'].includes(app.status);

                  return (
                    <div
                      key={app._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app._id)}
                      onClick={() => onSelectApplication(app)}
                      className="group cursor-pointer bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl p-3.5 transition-all shadow-md hover:shadow-emerald-500/10 active:scale-[0.98]"
                    >
                      {/* Company & Role */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors leading-tight">
                            {app.company}
                          </h4>
                          <p className="text-xs text-slate-300 font-medium mt-0.5 line-clamp-1">
                            {app.role}
                          </p>
                        </div>

                        {/* Match Score Badge */}
                        <div
                          className={`flex items-center gap-1 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                            app.matchScore >= 80
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : app.matchScore >= 60
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : 'bg-slate-700/30 text-slate-400 border-slate-700'
                          }`}
                          title={`Resume match score: ${app.matchScore}%`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{app.matchScore || 70}%</span>
                        </div>
                      </div>

                      {/* Location & Work Type */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{app.location || 'Remote'}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[10px] bg-slate-700/50 px-1 rounded text-slate-300">
                          {app.workType}
                        </span>
                      </div>

                      {/* Salary if available */}
                      {app.salary && app.salary.max > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 mb-2.5">
                          <DollarSign className="w-3 h-3" />
                          <span>
                            ${(app.salary.min / 1000).toFixed(0)}k - ${(app.salary.max / 1000).toFixed(0)}k
                          </span>
                        </div>
                      )}

                      {/* Bottom Tags / Alerts */}
                      <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between gap-2 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-semibold ${
                          app.priority === 'High'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : app.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {app.priority}
                        </span>

                        {isFollowUpDue ? (
                          <div className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                            <AlertCircle className="w-3 h-3" />
                            <span>Follow-up</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                    <p className="text-xs">No jobs in {col.label}</p>
                    <button
                      onClick={() => onOpenNewModal(col.id)}
                      className="mt-2 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      + Add to column
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
