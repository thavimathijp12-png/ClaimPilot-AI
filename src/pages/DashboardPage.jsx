import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useClaims } from '../context/ClaimContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  FileBarChart,
  Calendar,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActivityTimeline } from '../components/common/ActivityTimeline';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  MONTHLY_TREND_DATA,
  STATUS_DISTRIBUTION_DATA,
} from '../data/mockAnalytics';

export function DashboardPage() {
  const { currentUser } = useAuth();
  const { claims, activities, dataGuardSummary } = useClaims();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState('30d');

  // Dynamic calculations filtered by selected operational window
  const filteredClaims = useMemo(() => {
    if (dateRange === 'all') return claims;
    const now = new Date();
    const daysMap = { '7d': 7, '30d': 30, 'qtd': 90, 'ytd': 365 };
    const maxDays = daysMap[dateRange] || 30;
    const cutoff = new Date(now.getTime() - maxDays * 24 * 60 * 60 * 1000);
    return claims.filter((c) => {
      if (!c.submissionDate) return true;
      const sub = new Date(c.submissionDate);
      return isNaN(sub.getTime()) || sub >= cutoff;
    });
  }, [claims, dateRange]);

  const totalClaimsCount = filteredClaims.length;
  const pendingCount = filteredClaims.filter(c => c.status === 'Pending Review' || c.status === 'Under AI Audit').length;
  const approvedCount = filteredClaims.filter(c => c.status === 'Approved').length;
  const rejectedCount = filteredClaims.filter(c => c.status === 'Rejected').length;
  const totalVolume = filteredClaims.reduce((acc, curr) => acc + (curr.claimAmount || 0), 0);

  // Dynamic trend data scaled to selected window
  const trendData = useMemo(() => {
    if (dateRange === '7d') return MONTHLY_TREND_DATA.slice(-2);
    if (dateRange === '30d') return MONTHLY_TREND_DATA.slice(-4);
    if (dateRange === 'qtd') return MONTHLY_TREND_DATA.slice(-6);
    return MONTHLY_TREND_DATA;
  }, [dateRange]);

  const recentClaims = claims.slice(0, 5);
  const pendingApprovals = claims.filter(c => c.status === 'Pending Review').slice(0, 3);

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Top Welcome Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateFormatted}</span>
            <span>•</span>
            <span className="text-slate-400 font-normal">Active Session: {currentUser?.role}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-1 max-w-2xl leading-normal">
            Operational claims queue is healthy. <strong>{pendingCount} claims</strong> currently await clinical review or automated OCR verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Upload Document</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/claims?action=create')}
            className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Claim</span>
          </button>
        </div>
      </div>

      {/* Date Range Operational Window Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-primary-600" />
          <span>Operational Window:</span>
          <span className="text-slate-500 font-normal">
            {dateRange === '7d' && 'Showing last 7 calendar days'}
            {dateRange === '30d' && 'Showing last 30 calendar days (Standard Billing Cycle)'}
            {dateRange === 'qtd' && 'Showing current quarter (Q4)'}
            {dateRange === 'ytd' && 'Showing year to date'}
            {dateRange === 'all' && 'All available historical records'}
          </span>
        </div>
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs">
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'qtd', label: 'Quarter' },
            { id: 'ytd', label: 'YTD' },
            { id: 'all', label: 'All Time' },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setDateRange(r.id)}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                dateRange === r.id
                  ? 'bg-white text-primary-700 shadow-2xs'
                  : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Claims Intake"
          value={totalClaimsCount}
          subtitle={`Total value: ${formatCurrency(totalVolume)}`}
          icon={FileText}
          trend={12.4}
          variant="default"
          onClick={() => navigate('/claims')}
        />
        <StatCard
          title="Pending Clinical Review"
          value={pendingCount}
          subtitle="Awaiting reviewer adjudication"
          icon={Clock}
          trend={-3.1}
          variant="amber"
          onClick={() => navigate('/approvals')}
        />
        <StatCard
          title="Approved Claims"
          value={approvedCount}
          subtitle="Processed for disbursement"
          icon={CheckCircle2}
          trend={8.5}
          variant="teal"
          onClick={() => navigate('/claims?status=Approved')}
        />
        <StatCard
          title="Rejected / Disputed"
          value={rejectedCount}
          subtitle="Compliance or coverage non-match"
          icon={XCircle}
          trend={-1.8}
          variant="rose"
          onClick={() => navigate('/claims?status=Rejected')}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Claims Processing Trend"
            subtitle="Volume and approval trajectory over the last 6 months (synthetic demo data)"
            action={
              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                <span>Full Report</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <Tooltip
                  formatter={(val) => [Number(val).toLocaleString(), 'Claims']}
                  contentStyle={{
                    backgroundColor: '#10233F',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Area type="monotone" dataKey="totalClaims" name="Total Ingested" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="approved" name="Approved" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#colorApproved)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Data Quality / Status Distribution */}
        <div>
          <ChartCard
            title="DataGuard IQ Health Index"
            subtitle="Real-time automated data validation score"
            action={
              <button
                type="button"
                onClick={() => navigate('/dataguard')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
              >
                Inspect Checks
              </button>
            }
          >
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex flex-col items-center justify-center relative">
                  <div
                    className="absolute inset-0 rounded-full border-8 border-teal-500 border-t-transparent border-l-transparent -rotate-45"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
                  />
                  <span className="text-3xl font-extrabold text-navy tracking-tight">{dataGuardSummary.overallScore}%</span>
                  <span className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider">Quality Score</span>
                </div>
              </div>

              <div className="w-full mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Valid Fields Reconciled
                  </span>
                  <span className="font-semibold text-slate-800">{dataGuardSummary.validFields}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Missing Fields Flagged
                  </span>
                  <span className="font-semibold text-slate-800">{dataGuardSummary.missingFields}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Duplicate Verification Checks
                  </span>
                  <span className="font-semibold text-slate-800">{dataGuardSummary.duplicateWarnings}</span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Operational Sections: Recent Claims & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Claims Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-navy">Recent Claims Queue</h2>
              <p className="text-xs text-content-muted mt-0.5">Latest claims processed or awaiting operator verification</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/claims')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Claim ID</th>
                  <th className="px-4 py-2.5">Claimant</th>
                  <th className="px-4 py-2.5">Hospital / Facility</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-center">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => navigate(`/claims/${claim.id}`)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-primary-600 font-mono">
                      {claim.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {claim.claimantName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">
                      {claim.hospitalName}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-navy">
                      {formatCurrency(claim.claimAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={claim.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full text-[11px] border border-teal-200">
                        {claim.dataQualityScore}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Recent Activities */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Operator Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/claims?action=create')}
                className="p-3 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50/20 text-left transition-all"
              >
                <Plus className="w-4 h-4 text-primary-600 mb-1.5" />
                <p className="text-xs font-bold text-navy">New Claim</p>
                <p className="text-[10px] text-slate-500">Register intake</p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="p-3 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50/20 text-left transition-all"
              >
                <UploadCloud className="w-4 h-4 text-teal-600 mb-1.5" />
                <p className="text-xs font-bold text-navy">Upload Docs</p>
                <p className="text-[10px] text-slate-500">Bills, Rx, Discharge</p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/extraction')}
                className="p-3 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50/20 text-left transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-600 mb-1.5" />
                <p className="text-xs font-bold text-navy">OCR Review</p>
                <p className="text-[10px] text-slate-500">Verify suggestions</p>
              </button>

              <button
                type="button"
                onClick={() => navigate('/dataguard')}
                className="p-3 rounded-lg border border-slate-200 hover:border-primary-400 hover:bg-primary-50/20 text-left transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-primary-600 mb-1.5" />
                <p className="text-xs font-bold text-navy">DataGuard IQ</p>
                <p className="text-[10px] text-slate-500">Quality validation</p>
              </button>
            </div>
          </div>

          {/* Recent Live Activity Stream */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Live Audit Trail
              </h3>
              <button
                type="button"
                onClick={() => navigate('/activity')}
                className="text-[11px] font-semibold text-primary-600 hover:underline"
              >
                Full Trail
              </button>
            </div>
            <ActivityTimeline
              activities={activities}
              limit={4}
              onClaimClick={(id) => navigate(`/claims/${id}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

