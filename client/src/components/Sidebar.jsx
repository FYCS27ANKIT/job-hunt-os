import React from 'react';
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
  Building2,
  ShieldAlert,
  LogOut,
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
  const { user, logout } = useAuth();
  const currentRole = user?.role || 'employee';

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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Vertical Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-sm ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Top Brand & Workspace Switcher */}
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight text-slate-900">
                    Job Hunt OS
                  </h1>
                  <span className="text-[10px] text-slate-500 font-semibold tracking-wide">
                    Career & Recruiting OS
                  </span>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Account Info (Static indicator, no role switcher) */}
            <div
              className={`w-full flex items-center px-3 py-2 rounded-xl border text-xs font-bold ${
                currentRole === 'admin'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : currentRole === 'employer'
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-sky-50 text-sky-700 border-sky-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm">
                  {currentRole === 'admin' ? '🛡️' : currentRole === 'employer' ? '🏢' : '👤'}
                </span>
                <div className="text-left truncate">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Account Role</div>
                  <div className="truncate">
                    {currentRole === 'admin' ? 'Super Admin' : currentRole === 'employer' ? (user?.companyName || 'Employer / Recruiter') : 'Employee (Candidate)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Resume Card in Sidebar */}
          {currentRole === 'employee' && (
            <div className="p-4 mx-4 mt-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Candidate Resume</span>
                {user?.resumeUrl ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600">Required</span>
                )}
              </div>

              <div className="text-xs font-semibold text-slate-800 truncate mb-2.5">
                {user?.resumeOriginalName || 'No resume file attached'}
              </div>

              <button
                onClick={onOpenResumeModal}
                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 ${
                  user?.resumeUrl
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                    : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20'
                }`}
              >
                {user?.resumeUrl ? (
                  <>
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
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
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2">
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
                          ? 'bg-sky-50 text-sky-700 border-l-4 border-sky-600 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
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
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>Employer Workspace</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ATS applicant tracking, job openings, and candidate screening are active on your main dashboard.
                </p>
              </div>
            )}

            {/* ADMIN VERTICAL NAV NOTICE */}
            {currentRole === 'admin' && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  <span>Admin Control Console</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  System telemetry, user privilege management, and platform job moderation controls are active.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Profile & Logout Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 flex-1 min-w-0 p-1.5 rounded-xl hover:bg-slate-100 text-left transition"
              title="Edit Profile Settings"
            >
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs border border-sky-200 shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate">
                  {user?.name || 'User'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {currentRole === 'employer' ? (user?.companyName || 'Employer') : (user?.targetRole || user?.email)}
                </div>
              </div>
            </button>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
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
