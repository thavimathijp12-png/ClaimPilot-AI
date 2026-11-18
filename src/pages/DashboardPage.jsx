import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
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
  Calendar,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActivityTimeline } from '../components/common/ActivityTimeline';
import { formatCurrency, formatDate } from '../utils/formatters';

function getWindowStart(range, today) {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  if (range === '7d') start.setDate(start.getDate() - 6);
  if (range === '30d') start.setDate(start.getDate() - 29);
  if (range === 'qtd') {
    start.setMonth(Math.floor(start.getMonth() / 3) * 3, 1);
  }
  if (range === 'ytd') start.setMonth(0, 1);

  return start;
}

export function DashboardPage() {
  const { currentUser } = useAuth();
  const { claims, activities, dataGuardSummary } = useClaims();
  const navigate = useNavigate();
  const toast = useToast();

  const [dateRange, setDateRange] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState('just now');
  const [queueFilter, setQueueFilter] = useState('all');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSynced('just now');
      toast.success('Queue Synchronized', 'Retrieved latest intake telemetry and claim status updates.');
    }, 600);
  };

  // Dynamic calculations filtered by selected operational window
  const filteredClaims = useMemo(() => {
    if (dateRange === 'all') return claims;
    const now = new Date();
    const cutoff = getWindowStart(dateRange, now);
    return claims.filter((c) => {
      if (!c.submissionDate) return false;
      const submittedAt = new Date(`${c.submissionDate.slice(0, 10)}T00:00:00`);
      return !Number.isNaN(submittedAt.getTime()) && submittedAt >= cutoff;
    });
  }, [claims, dateRange]);

  const totalClaimsCount = filteredClaims.length;
  const pendingCount = filteredClaims.filter(c => c.status === 'Pending Review' || c.status === 'Under AI Audit').length;
  const approvedCount = filteredClaims.filter(c => c.status === 'Approved').length;
  const rejectedCount = filteredClaims.filter(c => c.status === 'Rejected').length;
  const totalVolume = filteredClaims.reduce((acc, curr) => acc + (curr.claimAmount || 0), 0);
  const pendingSummary = pendingCount === 0
    ? 'No claims await clinical review or OCR verification.'
    : `${pendingCount} claim${pendingCount === 1 ? '' : 's'} await clinical review or automated OCR verification.`;

  const trendData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = dateRange === 'all'
      ? claims.reduce((earliest, claim) => {
        const date = claim.submissionDate ? new Date(`${claim.submissionDate.slice(0, 10)}T00:00:00`) : null;
        return date && !Number.isNaN(date.getTime()) && date < earliest ? date : earliest;
      }, new Date(today.getFullYear(), today.getMonth(), 1))
      : getWindowStart(dateRange, today);
    const bucketUnit = dateRange === '7d' ? 'day' : dateRange === '30d' ? 'week' : 'month';
    const bucketCount = bucketUnit === 'day'
      ? 7
      : bucketUnit === 'week'
        ? Math.ceil((today - start + 86400000) / (7 * 86400000))
        : (today.getFullYear() - start.getFullYear()) * 12 + today.getMonth() - start.getMonth() + 1;
    const buckets = Array.from({ length: Math.max(bucketCount, 1) }, (_, index) => {
      const bucketStart = new Date(start);
      if (bucketUnit === 'day') bucketStart.setDate(start.getDate() + index);
      if (bucketUnit === 'week') bucketStart.setDate(start.getDate() + index * 7);
      if (bucketUnit === 'month') bucketStart.setMonth(start.getMonth() + index, 1);
      const label = bucketUnit === 'day'
        ? bucketStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : bucketUnit === 'week'
          ? `Week ${index + 1}`
          : bucketStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      return { label, totalClaims: 0, approved: 0 };
    });

    filteredClaims.forEach((claim) => {
      if (!claim.submissionDate) return;
      const submittedAt = new Date(`${claim.submissionDate.slice(0, 10)}T00:00:00`);
      if (Number.isNaN(submittedAt.getTime()) || submittedAt < start || submittedAt > today) return;
      const index = bucketUnit === 'day'
        ? Math.floor((submittedAt - start) / 86400000)
        : bucketUnit === 'week'
          ? Math.floor((submittedAt - start) / (7 * 86400000))
          : (submittedAt.getFullYear() - start.getFullYear()) * 12 + submittedAt.getMonth() - start.getMonth();
      if (!buckets[index]) return;
      buckets[index].totalClaims += 1;
      if (claim.status === 'Approved') buckets[index].approved += 1;
    });

    return buckets;
  }, [claims, dateRange, filteredClaims]);

  // Filtered recent claims queue
  const filteredRecentClaims = useMemo(() => {
    let list = claims;
    if (queueFilter === 'pending') {
      list = claims.filter(c => c.status === 'Pending Review' || c.status === 'Under AI Audit');
    } else if (queueFilter === 'flagged') {
      list = claims.filter(c => (c.dataQualityScore < 85) || c.status === 'Correction Requested');
    } else if (queueFilter === 'approved') {
      list = claims.filter(c => c.status === 'Approved');
    }
    return list.slice(0, 6);
  }, [claims, queueFilter]);

  const queueCounts = useMemo(() => ({
    all: claims.length,
    pending: claims.filter(c => c.status === 'Pending Review' || c.status === 'Under AI Audit').length,
    flagged: claims.filter(c => (c.dataQualityScore < 85) || c.status === 'Correction Requested').length,
    approved: claims.filter(c => c.status === 'Approved').length,
  }), [claims]);

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
            {filteredClaims.length === 0
              ? 'No claims were submitted in this operational window.'
              : pendingSummary}
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

      {/* Date Range & Telemetry Stream Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-primary-600" />
            <span>Operational Window:</span>
            <span className="text-slate-500 font-normal">
              {dateRange === '7d' && 'Last 7 Days'}
              {dateRange === '30d' && 'Last 30 Days (Cycle)'}
              {dateRange === 'qtd' && 'Current Quarter'}
              {dateRange === 'ytd' && 'Year to Date'}
              {dateRange === 'all' && 'All Records'}
            </span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          {/* Live Telemetry Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Intake Stream Active</span>
            <span className="text-emerald-600/80 font-mono text-[10px]">({lastSynced})</span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Synchronize claims queue"
              className="ml-0.5 p-0.5 hover:bg-emerald-100 rounded transition-colors text-emerald-700"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="inline-flex w-full max-w-full sm:w-auto items-center overflow-x-auto p-1 bg-slate-100 rounded-lg border border-slate-200/80 text-xs">
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
              className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-md font-semibold transition-all ${
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
          subtitle={`Billed value: ${formatCurrency(totalVolume)}`}
          icon={FileText}
          variant="default"
          onClick={() => navigate('/claims')}
        />
        <StatCard
          title="Pending Clinical Review"
          value={pendingCount}
          subtitle="Awaiting reviewer adjudication"
          icon={Clock}
          variant="amber"
          onClick={() => navigate('/approvals')}
        />
        <StatCard
          title="Approved Claims"
          value={approvedCount}
          subtitle="Processed for disbursement"
          icon={CheckCircle2}
          variant="teal"
          onClick={() => navigate('/claims?status=Approved')}
        />
        <StatCard
          title="Rejected Claims"
          value={rejectedCount}
          subtitle="Compliance or coverage non-match"
          icon={XCircle}
          variant="rose"
          onClick={() => navigate('/claims?status=Rejected')}
        />
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 min-w-0">
          <ChartCard
            title={dateRange === '7d' ? 'Daily Claims Processing Trend' : dateRange === '30d' ? 'Weekly Claims Processing Trend' : 'Monthly Claims Processing Trend'}
            subtitle="Submitted claims and approvals in the selected operational window."
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
            {filteredClaims.length === 0 ? (
              <div className="h-[260px] flex flex-col items-center justify-center text-center px-4" role="status">
                <FileText className="w-8 h-8 text-slate-300 mb-2" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-700">No claims in this window</p>
                <p className="text-xs text-content-muted mt-1">Choose a wider date range or create a claim to see activity here.</p>
                <button
                  type="button"
                  onClick={() => navigate('/claims?action=create')}
                  className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Create a claim
                </button>
              </div>
            ) : (
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
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" minTickGap={12} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" allowDecimals={false} />
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
                  <Legend verticalAlign="bottom" height={28} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Data Quality / Status Distribution */}
        <div className="min-w-0">
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
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-navy">Recent Claims Queue</h2>
              <p className="text-xs text-content-muted mt-0.5">Latest claims processed or awaiting operator verification</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 text-xs">
                {[
                  { id: 'all', label: 'All', count: queueCounts.all },
                  { id: 'pending', label: 'Pending', count: queueCounts.pending },
                  { id: 'flagged', label: 'Flagged', count: queueCounts.flagged },
                  { id: 'approved', label: 'Approved', count: queueCounts.approved },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setQueueFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                      queueFilter === tab.id
                        ? 'bg-white text-primary-700 shadow-2xs'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-200/50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${queueFilter === tab.id ? 'bg-primary-50 text-primary-700' : 'bg-slate-200 text-slate-600'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate('/claims')}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-1"
              >
                <span>Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
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
                {filteredRecentClaims.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-xs text-slate-400">
                      No claims currently match the '{queueFilter}' filter queue.
                    </td>
                  </tr>
                ) : (
                  filteredRecentClaims.map((claim) => (
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
                  ))
                )}
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

