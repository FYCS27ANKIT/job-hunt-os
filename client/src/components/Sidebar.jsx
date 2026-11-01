import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Kanban,
  Briefcase,
  Sparkles,
  Calendar,
  MessageSquareQuote,
  BarChart3,
  FileText,
  Upload,
  CheckCircle2,
  ChevronDown,
  Building2,
  ShieldAlert,
  Users,
  Activity,
  Megaphone,
  LogOut,
  User,
  Plus,
  X
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenNewAppModal,
  onOpenResumeModal,
  onOpenProfile,
  mobileOpen,
  setMobileOpen,
  applicationCount = 0,
  interviewCount = 0
}) {
  const { user, logout, switchActiveRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const currentRole = user?.role || 'employee';

  const handleRoleSwitch = async (newRole) => {
    setRoleMenuOpen(false);
    if (newRole === currentRole) return;
    setSwitching(true);
    try {
      await switchActiveRole(newRole);
      if (newRole === 'employee') setActiveTab('kanban');
      else if (newRole === 'employer') setActiveTab('employer-main');
      else if (newRole === 'admin') setActiveTab('admin-main');
    } catch (err) {
      alert('Failed to switch workspace role.');
    } finally {
      setSwitching(false);
    }
  };

  const navItems = [
    { id: 'kanban', label: 'Kanban Board', icon: Kanban, badge: applicationCount > 0 ? applicationCount : null },
    { id: 'job-board', label: 'Find Jobs', icon: Briefcase, badge: 'New' },
    { id: 'skill-gap', label: 'Skill Gap & Match', icon: Sparkles },
    { id: 'interviews', label: 'Interviews', icon: Calendar, badge: interviewCount > 0 ? interviewCount : null },
    { id: 'questions', label: 'STAR Questions', icon: MessageSquareQuote },
    { id: 'analytics', label: 'Funnel Stats', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Vertical Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand & Workspace Switcher */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/30 shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                    Job Hunt OS
                  </h1>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Career & Recruiting OS
                  </span>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Workspace Selector */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                disabled={switching}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition ${
                  currentRole === 'admin'
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
                    : currentRole === 'employer'
                    ? 'bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-sm">
                    {currentRole === 'admin' ? '🛡️' : currentRole === 'employer' ? '🏢' : '👤'}
                  </span>
                  <div className="text-left truncate">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Role</div>
                    <div className="truncate">
                      {currentRole === 'admin' ? 'Super Admin' : currentRole === 'employer' ? 'Employer / Recruiter' : 'Employee (Candidate)'}
                    </div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-70 shrink-0 ml-1" />
              </button>

              {/* Role Dropdown */}
              {roleMenuOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl z-50 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1.5 border-b border-slate-800">
                    Switch Workspace Module
                  </div>

                  <button
                    onClick={() => handleRoleSwitch('employee')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold transition ${
                      currentRole === 'employee' ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>👤</span>
                    <div>
                      <div>Employee (Candidate)</div>
                      <div className="text-[10px] font-normal text-slate-400">Kanban, jobs, resume upload</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('employer')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold transition ${
                      currentRole === 'employer' ? 'bg-teal-500/15 text-teal-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>🏢</span>
                    <div>
                      <div>Employer / Recruiter</div>
                      <div className="text-[10px] font-normal text-slate-400">ATS applicants, job postings</div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSwitch('admin')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold transition ${
                      currentRole === 'admin' ? 'bg-indigo-500/15 text-indigo-300' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>🛡️</span>
                    <div>
                      <div>Super Administrator</div>
                      <div className="text-[10px] font-normal text-slate-400">User controls, job moderation</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Employee Resume Card in Sidebar */}
          {currentRole === 'employee' && (
            <div className="p-4 mx-4 mt-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Candidate Resume</span>
                {user?.resumeUrl ? (
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400 animate-pulse">Required</span>
                )}
              </div>

              <div className="text-xs font-semibold text-white truncate mb-2">
                {user?.resumeOriginalName || 'No resume file attached'}
              </div>

              <button
                onClick={onOpenResumeModal}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                  user?.resumeUrl
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
                }`}
              >
                {user?.resumeUrl ? (
                  <>
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Manage / Re-upload</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Resume (PDF)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Vertical Navigation Tabs */}
          <div className="px-3 py-4 flex-1">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 mb-2">
              {currentRole === 'employee' ? 'Workspace Navigation' : currentRole === 'employer' ? 'Recruiting Modules' : 'Governance Controls'}
            </div>

            {/* EMPLOYEE VERTICAL NAV */}
            {currentRole === 'employee' && (
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-slate-950 text-emerald-400'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* EMPLOYER VERTICAL NAV NOTICE */}
            {currentRole === 'employer' && (
              <div className="p-3 bg-teal-950/20 border border-teal-500/20 rounded-xl text-xs text-teal-300">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>Employer Workspace</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ATS applicant tracking, job openings, and candidate screening are active on your main dashboard.
                </p>
              </div>
            )}

            {/* ADMIN VERTICAL NAV NOTICE */}
            {currentRole === 'admin' && (
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  <span>Admin Control Console</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  System telemetry, user privilege management, and platform job moderation controls are active.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Profile & Logout Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-xl hover:bg-slate-800 text-left transition"
              title="Edit Profile Settings"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30 shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentRole === 'employer' ? (user?.companyName || 'Employer') : (user?.targetRole || user?.email)}
                </div>
              </div>
            </button>

            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
