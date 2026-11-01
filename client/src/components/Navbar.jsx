import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Kanban,
  Target,
  Calendar,
  MessageSquareQuote,
  BarChart3,
  Bell,
  Plus,
  User,
  LogOut,
  Sparkles,
  RefreshCw,
  FileText,
  Briefcase,
  Users,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Upload
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewAppModal,
  onOpenNotifications,
  onOpenProfile,
  onOpenResumeModal,
  notificationCount,
  onRefresh
}) {
  const { user, logout } = useAuth();
  const currentRole = user?.role || 'employee';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Current Module Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30 shrink-0">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  Job Hunt OS
                </span>

                {/* Role Workspace Badge (Static) */}
                <div
                  className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border ${
                    currentRole === 'admin'
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      : currentRole === 'employer'
                      ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  <span>
                    {currentRole === 'admin' ? '🛡️ Admin' : currentRole === 'employer' ? '🏢 Employer' : '👤 Employee'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                {currentRole === 'employer' ? (user?.companyName || 'Employer Recruiting Platform') : currentRole === 'admin' ? 'Platform Governance & Control Console' : 'Smart Career & Job Hunt Workspace'}
              </p>
            </div>
          </div>
            </div>
          </div>

          {/* Module-Specific Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            {currentRole === 'employee' && (
              <>
                <button
                  onClick={() => setActiveTab('kanban')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'kanban'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  Kanban Board
                </button>

                <button
                  onClick={() => setActiveTab('job-board')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'job-board'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Find Jobs
                </button>

                <button
                  onClick={() => setActiveTab('skill-gap')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'skill-gap'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Skill Gap & Match
                </button>

                <button
                  onClick={() => setActiveTab('interviews')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'interviews'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Interviews
                </button>

                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'questions'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <MessageSquareQuote className="w-3.5 h-3.5" />
                  STAR Questions
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Funnel Stats
                </button>
              </>
            )}

            {currentRole === 'employer' && (
              <div className="flex items-center gap-2 px-2 text-xs font-bold text-teal-400">
                <Building2 className="w-4 h-4" />
                <span>Employer Recruiting Workspace Active</span>
              </div>
            )}

            {currentRole === 'admin' && (
              <div className="flex items-center gap-2 px-2 text-xs font-bold text-indigo-400">
                <ShieldAlert className="w-4 h-4" />
                <span>Super Administrator Governance Active</span>
              </div>
            )}
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Resume Upload Button for Employee */}
            {currentRole === 'employee' && (
              <button
                onClick={onOpenResumeModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  user?.resumeUrl
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25 animate-pulse'
                }`}
                title="Manage uploaded resume file"
              >
                {user?.resumeUrl ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Upload className="w-3.5 h-3.5 text-amber-400" />}
                <span className="hidden sm:inline">
                  {user?.resumeUrl ? 'Resume Active' : 'Upload Resume'}
                </span>
              </button>
            )}

            {/* Quick Add Job for Employee */}
            {currentRole === 'employee' && (
              <button
                onClick={onOpenNewAppModal}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Track Job</span>
              </button>
            )}

            {/* Refresh Data */}
            <button
              onClick={onRefresh}
              title="Refresh all data"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Notifications & Alerts"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Profile Avatar */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/40">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-medium text-slate-300 max-w-[90px] truncate hidden lg:inline">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              title="Sign out"
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar for Employee */}
        {currentRole === 'employee' && (
          <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-2 text-xs">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'kanban' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveTab('job-board')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'job-board' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Find Jobs
            </button>
            <button
              onClick={() => setActiveTab('skill-gap')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'skill-gap' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Skill Gap
            </button>
            <button
              onClick={() => setActiveTab('interviews')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'interviews' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Interviews
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'questions' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Questions
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'analytics' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
            >
              Analytics
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
