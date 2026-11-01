import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Activity,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Megaphone,
  Clock,
  Sparkles,
  Server,
  RefreshCw,
  Star
} from 'lucide-react';

export default function AdminModule({ onRefreshAll }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'jobs', 'broadcast'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // User Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [runningCron, setRunningCron] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/jobs')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Failed to change role:', err);
      alert('Failed to update role.');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await API.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to toggle user status.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}" and all associated data?`)) return;
    try {
      await API.delete(`/admin/users/${userId}`);
      fetchAdminData();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user.');
    }
  };

  const handleToggleJobFeatured = async (jobId) => {
    try {
      await API.patch(`/admin/jobs/${jobId}/feature`);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to toggle feature:', err);
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!confirm(`Are you sure you want to moderate and delete "${jobTitle}"?`)) return;
    try {
      await API.delete(`/admin/jobs/${jobId}`);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete job:', err);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    setBroadcasting(true);
    try {
      const res = await API.post('/admin/broadcast', {
        title: broadcastTitle,
        message: broadcastMsg
      });
      alert(res.data.message);
      setBroadcastTitle('');
      setBroadcastMsg('');
    } catch (err) {
      console.error('Broadcast failed:', err);
      alert('Failed to send broadcast alert.');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleTriggerCron = async () => {
    setRunningCron(true);
    try {
      const res = await API.post('/notifications/trigger-cron');
      alert(`Scheduler scan completed! Created ${res.data.result?.notificationsCreated || 0} automated reminders.`);
      fetchAdminData();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Failed to trigger scheduler:', err);
      alert('Error triggering scheduled jobs.');
    } finally {
      setRunningCron(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(userSearch.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-4 h-4" />
              <span>Platform Super Administrator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              System Administration & Moderation Console
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Control user privileges, moderate employer job postings, broadcast platform updates, and monitor server health.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleTriggerCron}
              disabled={runningCron}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl transition"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {runningCron ? 'Scanning...' : 'Trigger Global Scheduler'}
            </button>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Platform Health
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            User Management ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'jobs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            Job Moderation ({jobs.length})
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'broadcast'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            Broadcast Alert
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400">Total Registered Users</div>
              <div className="text-3xl font-black text-white mt-1">{stats.users.total}</div>
              <div className="text-[11px] text-indigo-400 mt-1">
                {stats.users.employees} Candidates • {stats.users.employers} Employers
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400">Total Employer Jobs</div>
              <div className="text-3xl font-black text-white mt-1">{stats.jobs.total}</div>
              <div className="text-[11px] text-emerald-400 mt-1">{stats.jobs.active} active openings</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400">Total Applications Processed</div>
              <div className="text-3xl font-black text-white mt-1">{stats.pipeline.totalApplications}</div>
              <div className="text-[11px] text-teal-400 mt-1">{stats.pipeline.totalInterviews} interviews held</div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <div className="text-xs text-slate-400">Placement Offer Rate</div>
              <div className="text-3xl font-black text-white mt-1">{stats.pipeline.placementRate}%</div>
              <div className="text-[11px] text-emerald-400 mt-1">{stats.pipeline.totalOffers} written offers</div>
            </div>
          </div>

          {/* System Telemetry */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">System Runtime & Database Telemetry</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">MongoDB Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {stats.system.mongoStatus}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Node Runtime</span>
                <span className="font-bold text-white font-mono">{stats.system.nodeVersion}</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Heap Memory</span>
                <span className="font-bold text-white">{stats.system.memoryUsageMb} MB</span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block mb-1">Uptime</span>
                <span className="font-bold text-white">{Math.round(stats.system.uptimeSeconds / 60)} minutes</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="employee">Employees (Candidates)</option>
                <option value="employer">Employers (Recruiters)</option>
                <option value="admin">Admins</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                        {u.companyName && (
                          <div className="text-[10px] text-indigo-400 font-semibold">{u.companyName}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={u.role || 'employee'}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="employee">Employee</option>
                          <option value="employer">Employer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleStatusToggle(u._id, u.status || 'Active')}
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition ${
                            u.status === 'Suspended'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {u.status || 'Active'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id, u.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JOB MODERATION */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">{job.company}</span>
                      <h4 className="font-bold text-sm text-white">{job.title}</h4>
                      <p className="text-[11px] text-slate-400">{job.location} • {job.workType}</p>
                    </div>

                    <button
                      onClick={() => handleToggleJobFeatured(job._id)}
                      className={`p-1.5 rounded-lg border transition ${
                        job.featured
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'text-slate-500 hover:text-amber-400 border-slate-700'
                      }`}
                      title={job.featured ? 'Featured Job' : 'Click to Feature'}
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 my-2">{job.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">{job.applicantsCount || 0} applicants</span>
                  <button
                    onClick={() => handleDeleteJob(job._id, job.title)}
                    className="text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Moderate / Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST ALERT */}
      {activeTab === 'broadcast' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 max-w-xl mx-auto shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Broadcast System Announcement</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Delivers an instant notification to all active employee and employer accounts on the platform.
          </p>

          <form onSubmit={handleBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Platform Update: New Resume Skill Matching Engine Live!"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
              <textarea
                required
                rows={4}
                placeholder="Write your announcement details here..."
                value={broadcastMsg}
                onChange={(e) => setBroadcastMsg(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={broadcasting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md active:scale-95"
            >
              {broadcasting ? 'Sending to all users...' : 'Send Broadcast Notification'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
