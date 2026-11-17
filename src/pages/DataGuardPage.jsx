import React, { useState } from 'react';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Download,
  Info,
  Check,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatRelativeTime } from '../utils/formatters';
import { exportToCSV } from '../services/exportService';

export function DataGuardPage() {
  const { validations, claims, dataGuardSummary, rerunDataGuard } = useClaims();
  const toast = useToast();

  const [selectedClaimId, setSelectedClaimId] = useState('CLM-2026-8910');
  const [isRechecking, setIsRechecking] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const activeAudit = validations[selectedClaimId] || validations['CLM-2026-8910'] || {
    score: 92,
    validCount: 18,
    missingCount: 1,
    invalidCount: 0,
    inconsistentCount: 1,
    duplicateWarningsCount: 0,
    items: []
  };

  const handleRecheck = async () => {
    setIsRechecking(true);
    await rerunDataGuard(selectedClaimId);
    setIsRechecking(false);
    toast.success('DataGuard IQ Audit Complete', `Automated consistency evaluation completed for ${selectedClaimId}.`);
  };

  const handleExportQualityReport = () => {
    const rows = activeAudit.items.map(item => ({
      'Claim ID': selectedClaimId,
      'Field / Rule Name': item.field,
      'Document Source': item.sourceDoc,
      'Extracted Value': item.extractedValue,
      'Expected Value': item.expectedValue,
      'Severity Level': item.severity,
      'Audit Status': item.status,
      'Explanation': item.explanation,
      'Recommended Correction': item.recommendation,
    }));

    exportToCSV(`DataGuard_IQ_Report_${selectedClaimId}`, rows);
    toast.info('Report Exported', 'DataGuard quality validation report downloaded.');
  };

  const filteredItems = (activeAudit.items || []).filter(item => {
    if (filterSeverity === 'ALL') return true;
    return item.severity === filterSeverity || item.status.toLowerCase() === filterSeverity.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="DataGuard IQ — Automated Quality Engine"
        badge={
          <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            AI Guardrails Active
          </span>
        }
        description="Continuous automated verification cross-referencing CMS regulations, provider NPI rosters, ICD/CPT clinical coding, and financial ledger calculations."
        actions={
          <>
            <button
              type="button"
              onClick={handleExportQualityReport}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Quality Report</span>
            </button>
            <button
              type="button"
              onClick={handleRecheck}
              disabled={isRechecking}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRechecking ? 'animate-spin' : ''}`} />
              <span>{isRechecking ? 'Re-evaluating...' : 'Recheck Quality'}</span>
            </button>
          </>
        }
      />

      {/* Claim Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label htmlFor="claim-select" className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Inspect Claim File:
          </label>
          <select
            id="claim-select"
            value={selectedClaimId}
            onChange={(e) => setSelectedClaimId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {claims.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.claimantName} ({c.hospitalName})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Last full evaluation:</span>
          <span className="font-semibold text-slate-700">
            {formatRelativeTime(activeAudit.lastChecked || new Date().toISOString())}
          </span>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Overall Quality Score */}
        <div className="col-span-2 sm:col-span-1 lg:col-span-1 bg-gradient-to-br from-navy to-navy-light text-white p-4 rounded-xl shadow-card flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
              Overall Score
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 block">
              {activeAudit.score}%
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium mt-2">
            Automated Quality Index
          </span>
        </div>

        {/* Valid Fields */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Valid Fields</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-navy mt-1 block">
            {activeAudit.validCount ?? 18}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Verified consistent</span>
        </div>

        {/* Missing Fields */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase">Missing Fields</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold text-navy mt-1 block">
            {activeAudit.missingCount ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Required inputs blank</span>
        </div>

        {/* Invalid Fields */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase">Invalid Fields</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-bold text-navy mt-1 block">
            {activeAudit.invalidCount ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Fails syntax/format</span>
        </div>

        {/* Inconsistent Values */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase">Inconsistencies</span>
            <HelpCircle className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-navy mt-1 block">
            {activeAudit.inconsistentCount ?? 1}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Cross-document variance</span>
        </div>

        {/* Possible Duplicate Warnings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-700 uppercase">Duplicates</span>
            <FileCheck2 className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-navy mt-1 block">
            {activeAudit.duplicateWarningsCount ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Overlap alerts</span>
        </div>
      </div>

      {/* Critical Ethics & Policy Notice: Duplicate Warnings != Fraud */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-950">
            Adjudication Guidance: Duplicate & Overlap Warnings
          </p>
          <p className="text-blue-800 leading-relaxed text-[11px] sm:text-xs">
            A duplicate or overlap flag indicates identical or closely sequenced dates of service, identical procedure codes, or overlapping hospital stays. <strong>A duplicate warning reflects potential administrative overlap requiring human verification, not proof of fraud.</strong> Adjudicators must examine medical records for valid readmissions, staged surgical interventions, or bilateral procedures before reaching an adjudication outcome.
          </p>
        </div>
      </div>

      {/* Field-Level Validation Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-navy">
              Field-Level Validation & Audit Rules
            </h2>
            <p className="text-xs text-content-muted mt-0.5">
              Automated rules executed against {selectedClaimId} documents and payer master records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter:</span>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Items</option>
              <option value="valid">Valid (Passed)</option>
              <option value="warning">Warnings</option>
              <option value="critical">Critical Issues</option>
              <option value="info">Informational</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Audit Rule / Field</th>
                <th className="px-4 py-3">Source Document</th>
                <th className="px-4 py-3">Extracted vs. Expected</th>
                <th className="px-4 py-3">Severity & Status</th>
                <th className="px-4 py-3">Explanation & Recommended Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-semibold text-navy">
                    {item.field}
                  </td>
                  <td className="px-4 py-3 text-slate-500 max-w-[160px] truncate" title={item.sourceDoc}>
                    {item.sourceDoc}
                  </td>
                  <td className="px-4 py-3 space-y-0.5">
                    <div className="text-slate-800 font-mono text-[11px]">
                      Extracted: <span className="font-semibold text-navy">{item.extractedValue}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      Expected: {item.expectedValue}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 space-y-1 max-w-[280px]">
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {item.explanation}
                    </p>
                    <p className="text-primary-700 text-[11px] font-medium leading-relaxed bg-primary-50/60 px-2 py-1 rounded border border-primary-100">
                      <strong>Fix:</strong> {item.recommendation}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit items match the chosen severity filter.
          </div>
        )}
      </div>

      {/* System Rule Categories Breakdown */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          DataGuard IQ Core Verification Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {dataGuardSummary.ruleCategories.map((cat, i) => (
            <div key={i} className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <p className="font-bold text-navy">{cat.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated Rule Engine v2.4</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-teal-700">{cat.score}%</span>
                <span className="block text-[10px] text-slate-500 font-medium">{cat.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

