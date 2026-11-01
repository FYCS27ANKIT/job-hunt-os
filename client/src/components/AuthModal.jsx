import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  Building2,
  AlertCircle,
  Loader2
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
      console.error('Login submit error:', err);
      setError(err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials or retry.');
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
      console.error('Quick demo login error:', err);
      setError(err.response?.data?.message || err.message || `Failed to sign in as ${demoRole}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-800 relative overflow-hidden font-sans">
      {/* Soft light decorative ambient gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-100 rounded-full blur-3xl pointer-events-none opacity-60" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-100 rounded-full blur-3xl pointer-events-none opacity-60" />

      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xl shadow-slate-200/50 relative z-10">
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 mx-auto mb-3 text-white">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Job Hunt OS
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Smart Career Platform • Employee • Employer • Admin
          </p>
        </div>

        {/* 1-Click Instant Module Launchers */}
        <div className="mb-6 p-4 bg-slate-50/90 border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>1-Click Instant Demo Launchers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('employee')}
              disabled={loading}
              className="p-3 bg-white hover:bg-sky-50/80 border border-slate-200 hover:border-sky-300 rounded-xl text-left transition shadow-sm active:scale-95 group"
            >
              <div className="text-base">👤</div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-sky-700 mt-1">Employee</div>
              <div className="text-[10px] text-slate-500 leading-tight">Alex Rivera (Resume & Kanban)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('employer')}
              disabled={loading}
              className="p-3 bg-white hover:bg-teal-50/80 border border-slate-200 hover:border-teal-300 rounded-xl text-left transition shadow-sm active:scale-95 group"
            >
              <div className="text-base">🏢</div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-teal-700 mt-1">Employer</div>
              <div className="text-[10px] text-slate-500 leading-tight">TechCorp (Jobs & Pipeline)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading}
              className="p-3 bg-white hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 rounded-xl text-left transition shadow-sm active:scale-95 group"
            >
              <div className="text-base">🛡️</div>
              <div className="font-bold text-xs text-slate-900 group-hover:text-indigo-700 mt-1">Admin</div>
              <div className="text-[10px] text-slate-500 leading-tight">Super Admin (Governance)</div>
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
            or sign in with credentials
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              {/* Role Selector during Registration */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Choose Account Type / Module:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                      role === 'employee'
                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    👤 Employee (Job Seeker)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition ${
                      role === 'employer'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    🏢 Employer (Recruiter)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>
              </div>

              {role === 'employee' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role Title</label>
                  <input
                    type="text"
                    placeholder="Senior Full Stack Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, TechCorp, Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-sky-600/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with server...</span>
              </>
            ) : (
              <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-sky-600 hover:underline font-bold"
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
                className="text-sky-600 hover:underline font-bold"
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
