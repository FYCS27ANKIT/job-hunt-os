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
  Filter
} from 'lucide-react';

const COLUMNS = [
  { id: 'Wishlist', label: 'Wishlist', dotColor: 'bg-slate-400' },
  { id: 'Applied', label: 'Applied', dotColor: 'bg-sky-500' },
  { id: 'Screening', label: 'Screening', dotColor: 'bg-indigo-500' },
  { id: 'Interviewing', label: 'Interviewing', dotColor: 'bg-amber-500' },
  { id: 'Offer', label: 'Offer Received', dotColor: 'bg-emerald-500' },
  { id: 'Rejected', label: 'Archived / Rejected', dotColor: 'bg-rose-500' }
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, role, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          <button
            onClick={() => onOpenNewModal('Applied')}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm shadow-sky-600/20 active:scale-95 whitespace-nowrap"
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
              className="flex flex-col bg-slate-100/70 rounded-2xl border border-slate-200/80 p-3 min-h-[500px] transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    {col.label}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
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
                      className="group cursor-pointer bg-white hover:bg-slate-50/60 border border-slate-200/90 hover:border-sky-300 rounded-xl p-3.5 transition-all shadow-xs hover:shadow-md active:scale-[0.98]"
                    >
                      {/* Company & Role */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors leading-tight">
                            {app.company}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium mt-0.5 line-clamp-1">
                            {app.role}
                          </p>
                        </div>

                        {/* Match Score Badge */}
                        <div
                          className={`flex items-center gap-1 text-[11px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                            app.matchScore >= 80
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : app.matchScore >= 60
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                          title={`Resume match score: ${app.matchScore}%`}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{app.matchScore || 70}%</span>
                        </div>
                      </div>

                      {/* Location & Work Type */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{app.location || 'Remote'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                          {app.workType}
                        </span>
                      </div>

                      {/* Salary if available */}
                      {app.salary && app.salary.max > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mb-2.5">
                          <DollarSign className="w-3 h-3" />
                          <span>
                            ${(app.salary.min / 1000).toFixed(0)}k - ${(app.salary.max / 1000).toFixed(0)}k
                          </span>
                        </div>
                      )}

                      {/* Bottom Tags / Alerts */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[10px]">
                        <span className={`px-2 py-0.5 rounded font-semibold border ${
                          app.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : app.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {app.priority}
                        </span>

                        {isFollowUpDue ? (
                          <div className="flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            <span>Follow-up</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-slate-400 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {colApps.length === 0 && (
                  <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 bg-white/40">
                    <p className="text-xs">No jobs in {col.label}</p>
                    <button
                      onClick={() => onOpenNewModal(col.id)}
                      className="mt-2 text-[11px] text-sky-600 hover:text-sky-700 font-semibold"
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
