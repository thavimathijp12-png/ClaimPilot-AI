import React, { useState } from 'react';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Clock,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { formatCurrency } from '../utils/formatters';
import { exportToCSV } from '../services/exportService';
import {
  MONTHLY_TREND_DATA,
  STATUS_DISTRIBUTION_DATA,
  CLAIM_TYPE_DISTRIBUTION,
  DATA_QUALITY_DISTRIBUTION,
  DOCUMENT_PROCESSING_METRICS,
} from '../data/mockAnalytics';

export function ReportsPage() {
  const { claims } = useClaims();
  const toast = useToast();

  const [dateRange, setDateRange] = useState('90d');

  const handleExportFullReport = () => {
    const rows = MONTHLY_TREND_DATA.map(m => ({
      'Reporting Month': m.month,
      'Total Claims Ingested': m.totalClaims,
      'Approved Claims': m.approved,
      'Rejected Claims': m.rejected,
      'Corrections Requested': m.correction,
      'Billed Financial Volume (INR)': m.volumeInr || m.volumeUsd,
    }));
    exportToCSV('ClaimPilot_Executive_Analytics_Report', rows);
    toast.success('Report Exported', 'Executive analytics downloaded as CSV.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Predictive Analytics"
        description="Comprehensive healthcare claims analytics, turnaround timelines, DataGuard quality distributions, and clinical adjudication metrics."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date (2026)</option>
              <option value="all">Full Historical Horizon</option>
            </select>

            <button
              type="button"
              onClick={handleExportFullReport}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>
        }
      />

      {/* High-Level Executive Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Claims Volume (H2)"
          value="11,090"
          subtitle="₹34.5 Cr cumulative billed value"
          icon={TrendingUp}
          trend={14.8}
          variant="primary"
        />
        <StatCard
          title="Clinical Approval Ratio"
          value="88.2%"
          subtitle="Meets CMS medical necessity standard"
          icon={CheckCircle2}
          trend={2.4}
          variant="teal"
        />
        <StatCard
          title="Mean Adjudication Velocity"
          value="3.2 Days"
          subtitle="Down from 6.8 days pre-AI"
          icon={Clock}
          trend={-24.5}
          variant="default"
        />
        <StatCard
          title="OCR Extraction Precision"
          value="98.7%"
          subtitle="Over 8,940 verified pages"
          icon={ShieldCheck}
          trend={1.2}
          variant="amber"
        />
      </div>

      {/* Main Charts: Volume & Adjudication Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Area Chart */}
        <ChartCard
          title="Monthly Intake vs. Adjudicated Approvals"
          subtitle="Trajectory of ingested claims vs. final approvals (Jun - Nov 2026)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="areaTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#10233F',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Area type="monotone" dataKey="totalClaims" name="Total Ingested" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#areaTotal)" />
              <Area type="monotone" dataKey="approved" name="Approved" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#areaApproved)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Claim Type Breakdown Bar Chart */}
        <ChartCard
          title="Financial Volume by Healthcare Encounter Type"
          subtitle="Cumulative charges distributed across hospital inpatient, outpatient, and emergency care"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={CLAIM_TYPE_DISTRIBUTION} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis
                tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                tick={{ fontSize: 11, fill: '#64748B' }}
                stroke="#CBD5E1"
              />
              <Tooltip
                formatter={(val) => [formatCurrency(val), 'Volume']}
                contentStyle={{
                  backgroundColor: '#10233F',
                  borderRadius: '8px',
                  color: '#FFF',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="amount" name="Financial Volume" fill="#10233F" radius={[4, 4, 0, 0]}>
                {CLAIM_TYPE_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Secondary Analytics: Data Quality & Document Processing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Quality Health Tiers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy">DataGuard IQ Quality Index Tiers</h3>
            <p className="text-xs text-content-muted mt-0.5">Automated validation outcome distribution across portfolio</p>

            <div className="mt-5 space-y-4">
              {DATA_QUALITY_DISTRIBUTION.map((tier, idx) => (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">{tier.name}</span>
                    <span className="font-bold text-navy">
                      {tier.count} claims ({tier.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${tier.percentage}%`, backgroundColor: tier.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-teal-50/60 border border-teal-100 text-[11px] text-teal-800 flex items-center justify-between">
            <span>Overall Portfolio Quality Benchmark:</span>
            <span className="font-bold text-teal-900 text-xs">92.4% (Industry Top Decile)</span>
          </div>
        </div>

        {/* Document Ingestion & Optical Recognition Metrics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-navy">Document Intake & OCR Performance</h3>
            <p className="text-xs text-content-muted mt-0.5">Summary of digitized clinical paper records</p>

            <div className="mt-4 divide-y divide-slate-100 text-xs">
              {DOCUMENT_PROCESSING_METRICS.documentsByCategory.map((docCat, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <span className="font-medium text-slate-700">{docCat.category}</span>
                  <div className="flex items-center gap-4 text-slate-500">
                    <span>{docCat.count.toLocaleString()} docs</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      avg {docCat.avgPages} pgs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs text-center">
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px]">AVG OCR EXTRACTION TIME</span>
              <span className="font-bold text-navy text-sm">3.4 Seconds</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg">
              <span className="text-slate-400 block text-[10px]">HUMAN CORRECTION RATE</span>
              <span className="font-bold text-teal-700 text-sm">14.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

