import React, { useState } from 'react';
import API from '../services/api';
import { X, Bell, Clock, Calendar, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onRefresh,
  onNavigateTab
}) {
  const [runningCron, setRunningCron] = useState(false);

  if (!isOpen) return null;

  const handleMarkAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      onRefresh();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.post('/notifications/mark-all-read');
      onRefresh();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleTriggerCron = async () => {
    setRunningCron(true);
    try {
      const res = await API.post('/notifications/trigger-cron');
      alert(`Automated scan finished! Generated ${res.data.result?.notificationsCreated || 0} alerts.`);
      onRefresh();
    } catch (err) {
      console.error('Failed to trigger cron:', err);
      alert('Error triggering scan');
    } finally {
      setRunningCron(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Follow-Up Reminders & Alerts</h3>
              <p className="text-xs text-slate-500">Automated node-cron scheduler notifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-slate-600 hover:text-sky-600 font-semibold transition"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read
          </button>

          <button
            onClick={handleTriggerCron}
            disabled={runningCron}
            className="flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-bold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${runningCron ? 'animate-spin' : ''}`} />
            Run Cron Check Now
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => {
                if (!item.isRead) handleMarkAsRead(item._id);
                if (item.type === 'UPCOMING_INTERVIEW') onNavigateTab('interviews');
                else onNavigateTab('kanban');
                onClose();
              }}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                item.isRead
                  ? 'bg-slate-50/60 border-slate-200 text-slate-500'
                  : 'bg-white border-sky-200 hover:border-sky-300 text-slate-800 shadow-sm ring-1 ring-sky-50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.type === 'UPCOMING_INTERVIEW'
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-sky-50 text-sky-600 border-sky-200'
                  }`}>
                    {item.type === 'UPCOMING_INTERVIEW' ? <Calendar className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!item.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(item._id);
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 shrink-0 font-medium"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <CheckCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold">All caught up! No active reminders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
