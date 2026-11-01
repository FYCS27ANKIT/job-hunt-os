import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Bell,
  RefreshCw,
  Plus,
  Sparkles,
  Kanban,
  Briefcase,
  Calendar,
  MessageSquareQuote,
  BarChart3,
  Building2,
  ShieldAlert
} from 'lucide-react';

export default function Header({
  activeTab,
  onOpenNewAppModal,
  onOpenNotifications,
  onOpenProfile,
  notificationCount = 0,
  onRefresh,
  setMobileOpen
}) {
  const { user } = useAuth();
  const currentRole = user?.role || 'employee';

  const tabTitles = {
    'kanban': { title: 'Applications Kanban Board', desc: 'Drag and drop applications across your recruitment pipeline stages' },
    'job-board': { title: 'Verified Employer Job Board', desc: 'Browse platform openings and apply with your active resume' },
    'skill-gap': { title: 'AI Skill Gap & Match Engine', desc: 'Real-time ATS comparison between your resume and job requirements' },
    'interviews': { title: 'Interview Schedule & Feedback', desc: 'Track technical rounds, video meeting links, and retrospectives' },
    'questions': { title: 'STAR Interview Question Bank', desc: 'High-frequency interview questions, model answers, and coaching notes' },
    'analytics': { title: 'Funnel & Conversion Analytics', desc: 'Chart.js metrics on application success rates and follow-up alerts' },
    'employer-main': { title: 'Employer Recruiting Console', desc: 'Candidate ATS pipeline, company job postings, and interview scheduling' },
    'admin-main': { title: 'Platform Governance & Administration', desc: 'System-wide telemetry, user management, and job moderation' }
  };

  const currentInfo = tabTitles[activeTab] || {
    title: 'Workspace',
    desc: 'Smart Job Search & Recruiting Platform'
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 h-16">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu & Current Tab Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition lg:hidden"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
              {currentInfo.title}
            </h2>
            <p className="text-[11px] text-slate-400 font-medium truncate hidden sm:block">
              {currentInfo.desc}
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Quick Track Job button for Employee */}
          {currentRole === 'employee' && (
            <button
              onClick={onOpenNewAppModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Track New Job</span>
            </button>
          )}

          {/* Refresh Data */}
          <button
            onClick={onRefresh}
            title="Refresh data"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Notifications Center */}
          <button
            onClick={onOpenNotifications}
            title="Notifications & follow-up reminders"
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-slate-900 animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Profile Shortcut */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition"
            title="Profile & Resume Settings"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xs border border-emerald-500/30">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200 hidden md:inline truncate max-w-[80px]">
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
