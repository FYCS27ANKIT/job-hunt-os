import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building2,
  ShieldAlert,
  Briefcase
} from 'lucide-react';

export default function AuthModal({ onLoggedIn }) {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState('employee'); // 'employee' or 'employer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          name,
          email,
          password,
          role,
          targetRole: role === 'employee' ? targetRole : undefined,
          companyName: role === 'employer' ? companyName : undefined
        });
      } else {
        await login(email, password);
      }
      if (onLoggedIn) onLoggedIn();
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(demoRole);
      if (onLoggedIn) onLoggedIn();
    } catch (err) {
      setError(`Failed to sign in as ${demoRole}. Make sure the backend server is running and database is seeded.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-emerald-400/40 mx-auto mb-3">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Job Hunt OS
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            3 Integrated Modules: Employee • Employer • Admin
          </p>
        </div>

        {/* 1-Click Instant Module Launchers */}
        <div className="mb-6 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>1-Click Instant Demo Launchers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('employee')}
              disabled={loading}
              className="p-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl text-left transition active:scale-95 group"
            >
              <div className="text-base">👤</div>
              <div className="font-bold text-xs text-emerald-300 mt-1">Employee</div>
              <div className="text-[10px] text-slate-400 leading-tight">Alex Rivera (Resume & Kanban)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('employer')}
              disabled={loading}
              className="p-2.5 bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 rounded-xl text-left transition active:scale-95 group"
            >
              <div className="text-base">🏢</div>
              <div className="font-bold text-xs text-teal-300 mt-1">Employer</div>
              <div className="text-[10px] text-slate-400 leading-tight">TechCorp (Jobs & ATS Pipeline)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="p-2.5 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl text-left transition active:scale-95 group"
            >
              <div className="text-base">🛡️</div>
              <div className="font-bold text-xs text-indigo-300 mt-1">Admin</div>
              <div className="text-[10px] text-slate-400 leading-tight">Super Admin (User & Job Control)</div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            or sign in with credentials
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              {/* Role Selector during Registration */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Choose Account Type / Module:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                      role === 'employee'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👤 Employee (Job Seeker)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                      role === 'employer'
                        ? 'bg-teal-500 text-slate-950 border-teal-500'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🏢 Employer (Recruiter)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {role === 'employee' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Role Title</label>
                  <input
                    type="text"
                    placeholder="Senior Full Stack Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, TechCorp, Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700 active:scale-95"
          >
            {loading ? 'Authenticating...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-emerald-400 hover:underline font-semibold"
              >
                Create One
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
