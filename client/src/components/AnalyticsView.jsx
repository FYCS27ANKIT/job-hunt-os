import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  TrendingUp,
  Award,
  Users,
  Clock,
  Sparkles,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AnalyticsView({ onRefreshAll }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningCron, setRunningCron] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/analytics/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleTriggerScheduledJobs = async () => {
    setRunningCron(true);
    try {
      const res = await API.post('/notifications/trigger-cron');
      alert(`Scheduled jobs executed! Created ${res.data.result?.notificationsCreated || 0} follow-up / interview alerts.`);
      fetchAnalytics();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Failed to trigger cron:', err);
      alert('Failed to run scheduled scan');
    } finally {
      setRunningCron(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-xs font-semibold">Compiling application metrics & Chart.js data...</p>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, statusDistribution, funnel, sources, monthlyTrend, topMissingSkills } = data;

  // Chart 1: Doughnut Chart (Status Distribution)
  const doughnutData = {
    labels: ['Wishlist', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected'],
    datasets: [
      {
        data: [
          statusDistribution.Wishlist || 0,
          statusDistribution.Applied || 0,
          statusDistribution.Screening || 0,
          statusDistribution.Interviewing || 0,
          statusDistribution.Offer || 0,
          statusDistribution.Rejected || 0
        ],
        backgroundColor: [
          '#64748b', // Wishlist (slate)
          '#3b82f6', // Applied (blue)
          '#6366f1', // Screening (indigo)
          '#f59e0b', // Interviewing (amber)
          '#10b981', // Offer (emerald)
          '#f43f5e'  // Rejected (rose)
        ],
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  // Chart 2: Funnel Bar Chart
  const funnelData = {
    labels: funnel.map(f => f.stage),
    datasets: [
      {
        label: 'Applications',
        data: funnel.map(f => f.count),
        backgroundColor: '#10b981',
        borderRadius: 8
      }
    ]
  };

  // Chart 3: Monthly Velocity
  const lineData = {
    labels: monthlyTrend.labels,
    datasets: [
      {
        label: 'Applications Submitted',
        data: monthlyTrend.data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#10b981',
        pointRadius: 4
      }
    ]
  };

  // Chart 4: Sources
  const sourceLabels = Object.keys(sources);
  const sourceTotals = sourceLabels.map(s => sources[s].total);
  const sourceInterviews = sourceLabels.map(s => sources[s].interviews);

  const sourceChartData = {
    labels: sourceLabels,
    datasets: [
      {
        label: 'Total Applications',
        data: sourceTotals,
        backgroundColor: '#475569',
        borderRadius: 6
      },
      {
        label: 'Interviews Landed',
        data: sourceInterviews,
        backgroundColor: '#10b981',
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#cbd5e1',
          font: { size: 11, family: 'Plus Jakarta Sans' }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 10 } },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Scheduled Jobs Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-extrabold text-white">Application Success & Funnel Analytics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pipeline metrics, conversion benchmarks, and automated follow-up scheduler.
          </p>
        </div>

        <button
          onClick={handleTriggerScheduledJobs}
          disabled={runningCron}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
        >
          <Clock className="w-4 h-4" />
          {runningCron ? 'Scanning Follow-ups...' : 'Trigger Follow-up Cron Job'}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Interview Rate */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Interview Rate</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {kpis.interviewRate}%
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>{kpis.interviewCount} interviews</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{kpis.activeApplications} active</span>
          </p>
        </div>

        {/* KPI 2: Offer Rate */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Offer Rate</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {kpis.offerRate}%
          </div>
          <p className="text-[11px] text-teal-400 mt-1 font-medium">
            {kpis.offerCount} written offers secured
          </p>
        </div>

        {/* KPI 3: Average Resume Match */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Avg Match Score</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {kpis.avgMatchScore}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-medium">
            ATS skills alignment
          </p>
        </div>

        {/* KPI 4: Pending Follow-ups */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Follow-ups Due</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {kpis.followUpsPending}
          </div>
          <p className="text-[11px] text-rose-400 mt-1 font-medium">
            Requires candidate outreach
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Funnel Pipeline */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Application Funnel Stages</h3>
          <p className="text-xs text-slate-400 mb-4">Volume of jobs moving through each recruitment stage.</p>
          <div className="h-64">
            <Bar data={funnelData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Status Breakdown Doughnut */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Status Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Proportion of opportunities across current stages.</p>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: { color: '#cbd5e1', font: { size: 11 } }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 3: Monthly Application Velocity */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Monthly Application Velocity</h3>
          <p className="text-xs text-slate-400 mb-4">Frequency of job applications submitted over time.</p>
          <div className="h-64">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Source Conversion Efficiency */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Source Conversion Efficiency</h3>
          <p className="text-xs text-slate-400 mb-4">Comparing applications submitted vs interviews landed by source.</p>
          <div className="h-64">
            <Bar data={sourceChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Top Missing Skills Widget */}
      {topMissingSkills && topMissingSkills.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Highest-Demand Skill Gaps</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            These technologies appear most frequently across your applied roles but are missing from your resume.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topMissingSkills.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-xs font-bold text-amber-400">{item.skill}</div>
                <div className="text-[11px] text-slate-400 mt-1">Requested in {item.count} jobs</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
