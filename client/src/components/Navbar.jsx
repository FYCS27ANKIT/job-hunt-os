import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
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
  RefreshCw
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenNewAppModal,
  onOpenNotifications,
  onOpenProfile,
  notificationCount,
  onRefresh
}) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <span className="text-xl">🎯</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  Job Hunt OS
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                  AI Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Smart Job Search & Career Workspace
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'kanban'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              Kanban Board
            </button>

            <button
              onClick={() => setActiveTab('skill-gap')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'skill-gap'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Skill Gap & Matching
            </button>

            <button
              onClick={() => setActiveTab('interviews')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'interviews'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Interviews
            </button>

            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'questions'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              Question Bank
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics & Funnel
            </button>
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Quick Add Button */}
            <button
              onClick={onOpenNewAppModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

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
              title="Notifications & Follow-up reminders"
            >
              <Bell className="w-4 h-4" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Trigger */}
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

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${activeTab === 'kanban' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Kanban
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
      </div>
    </header>
  );
}
