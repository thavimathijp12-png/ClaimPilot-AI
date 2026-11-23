import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Stethoscope,
  RefreshCw,
  Eye,
  Check,
  X,
  RotateCcw,
  MessageSquare,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

export function ReviewerDashboardPage() {
  const { currentUser } = useAuth();
  const {
    claims = [],
    dataGuardSummary,
    validations = {},
    approveClaim,
    rejectClaim,
    requestCorrection,
    refreshData,
  } = useClaims();
  const navigate = useNavigate();
  const toast = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adjudicationFilter, setAdjudicationFilter] = useState('PENDING');

  // Adjudication Modal State
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Clinical Worklist Synced', 'Updated clinical review queue.');
    } catch {
      toast.error('Sync Failed', 'Could not refresh clinical queue.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const openAdjudication = (claim) => {
    setSelectedClaim(claim);
    setClinicalNotes('');
  };

  const handleApprove = async () => {
    if (!selectedClaim) return;
    setIsProcessing(true);
    try {
      await approveClaim(selectedClaim.id, clinicalNotes.trim() || 'Clinical necessity confirmed; meets coverage guidelines.');
      toast.success('Claim Authorized', `Claim ${selectedClaim.id} approved for disbursement.`);
      setSelectedClaim(null);
    } catch (err) {
      toast.error('Approval Blocked', err.message || 'DataGuard validation warnings must be resolved.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestCorrection = async () => {
    if (!selectedClaim) return;
    if (!clinicalNotes.trim()) {
      toast.warning('Notes Required', 'Please enter clinical clarification instructions.');
      return;
    }
    setIsProcessing(true);
    try {
      await requestCorrection(selectedClaim.id, clinicalNotes.trim());
      toast.warning('Revision Requested', `Claim ${selectedClaim.id} routed back to Operator for documentation update.`);
      setSelectedClaim(null);
    } catch (err) {
      toast.error('Request Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedClaim) return;
    if (!clinicalNotes.trim()) {
      toast.warning('Justification Required', 'Please provide clinical denial justification.');
      return;
    }
    setIsProcessing(true);
    try {
      await rejectClaim(selectedClaim.id, clinicalNotes.trim());
      toast.error('Claim Denied', `Claim ${selectedClaim.id} has been formally rejected.`);
      setSelectedClaim(null);
    } catch (err) {
      toast.error('Rejection Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Clinical Review Worklist Filter
  const reviewQueue = useMemo(() => {
    return claims.filter((claim) => {
      const matchSearch =
        claim.claimantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (claim.diagnosisCodes || []).some((c) =>
          (typeof c === 'string' ? c : c.code)?.toLowerCase().includes(searchQuery.toLowerCase())
        );

      if (!matchSearch) return false;

      if (adjudicationFilter === 'ALL') return true;
      if (adjudicationFilter === 'PENDING')
        return claim.status === 'Pending Review' || claim.status === 'Under AI Audit';
      if (adjudicationFilter === 'FLAGGED')
        return (claim.dataQualityScore < 85) || claim.status === 'Correction Requested';
      if (adjudicationFilter === 'DECIDED')
        return claim.status === 'Approved' || claim.status === 'Rejected';
      return true;
    });
  }, [claims, searchQuery, adjudicationFilter]);

  // Reviewer Metrics
  const pendingCount = claims.filter(
    (c) => c.status === 'Pending Review' || c.status === 'Under AI Audit'
  ).length;
  const flaggedCount = claims.filter(
    (c) => (c.dataQualityScore < 85) || c.status === 'Correction Requested'
  ).length;
  const approvedToday = claims.filter((c) => c.status === 'Approved').length;
  const averageQuality = dataGuardSummary?.overallScore ?? 94;

  return (
    <div className="space-y-6">
      {/* Reviewer Profile Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl border border-blue-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Stethoscope className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <Avatar
                src={currentUser?.avatar || '/reviewer-avatar.png'}
                name={currentUser?.name || 'KirubhaShree'}
                role="Claims Reviewer"
                size="lg"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-blue-400/60 shadow-lg object-cover"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-blue-600 border border-white/20 text-[10px] font-extrabold uppercase rounded-md tracking-wider text-white shadow-sm">
                REVIEWER
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-200 border border-blue-500/30">
                  Clinical Adjudication & Audit
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-200 border border-teal-500/30">
                  Registered Nurse (RN) • Medical Necessity
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentUser?.name || 'KirubhaShree'}
              </h1>
              <p className="text-xs sm:text-sm text-blue-200/80 mt-0.5">
                {currentUser?.title || 'Clinical Adjudication Reviewer'} • Medical Documentation & ICD/CPT Audit
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Worklist'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/dataguard')}
              className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
              <span>DataGuard IQ Rules</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/approvals')}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Dedicated Approvals Center</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reviewer KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="Awaiting Adjudication"
          value={pendingCount}
          subtitle="Clinical determinations pending"
          icon={Clock}
          variant="amber"
          onClick={() => setAdjudicationFilter('PENDING')}
        />
        <StatCard
          title="DataGuard Discrepancies"
          value={flaggedCount}
          subtitle="Coding or billing anomalies"
          icon={AlertTriangle}
          variant="rose"
          onClick={() => setAdjudicationFilter('FLAGGED')}
        />
        <StatCard
          title="Approved Today"
          value={approvedToday}
          subtitle="Cleared for disbursement"
          icon={CheckCircle2}
          variant="teal"
          onClick={() => setAdjudicationFilter('DECIDED')}
        />
        <StatCard
          title="Data Integrity Score"
          value={`${averageQuality}%`}
          subtitle="ICD/CPT compliance rate"
          icon={ShieldCheck}
          variant="default"
          onClick={() => navigate('/dataguard')}
        />
      </div>

      {/* Clinical Adjudication Worklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary-600" />
              <h2 className="text-base font-bold text-navy">Clinical Adjudication Worklist</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Reviewer Clearance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review submitted medical records, check ICD-10/CPT coding compatibility, and issue clinical decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, code, facility..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white w-48 sm:w-60"
              />
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              {[
                { id: 'PENDING', label: 'Needs Review', count: pendingCount },
                { id: 'FLAGGED', label: 'Flagged', count: flaggedCount },
                { id: 'DECIDED', label: 'Decided' },
                { id: 'ALL', label: 'All' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdjudicationFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                    adjudicationFilter === tab.id
                      ? 'bg-white text-primary-700 shadow-2xs'
                      : 'text-slate-600 hover:text-navy hover:bg-slate-200/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        adjudicationFilter === tab.id
                          ? 'bg-primary-50 text-primary-700 font-bold'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Worklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Claim Reference</th>
                <th className="px-4 py-3">Patient / Claimant</th>
                <th className="px-4 py-3">Clinical Diagnosis (ICD-10)</th>
                <th className="px-4 py-3">Procedure (CPT)</th>
                <th className="px-4 py-3 text-right">Billed Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">DataGuard</th>
                <th className="px-5 py-3 text-right">Adjudication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviewQueue.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-xs text-slate-400">
                    No clinical claims match the '{adjudicationFilter}' queue filter.
                  </td>
                </tr>
              ) : (
                reviewQueue.map((claim) => {
                  const icdCode =
                    claim.diagnosisCodes?.[0]?.code ||
                    (typeof claim.diagnosisCodes?.[0] === 'string' ? claim.diagnosisCodes[0] : 'R07.9');
                  const cptCode =
                    claim.procedureCodes?.[0]?.code ||
                    (typeof claim.procedureCodes?.[0] === 'string' ? claim.procedureCodes[0] : '99285');

                  return (
                    <tr
                      key={claim.id}
                      onClick={() => openAdjudication(claim)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 font-semibold text-primary-600 font-mono">
                        {claim.id}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-navy">{claim.claimantName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-[150px]">{claim.hospitalName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded">
                          {icdCode}
                        </span>
                        <p className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5">
                          {claim.diagnosis || 'Clinical Inpatient'}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-teal-700 px-2 py-0.5 bg-teal-50 rounded border border-teal-200">
                          {cptCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-navy">
                        {formatCurrency(claim.claimAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={claim.status} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                            claim.dataQualityScore >= 90
                              ? 'text-teal-700 bg-teal-50 border-teal-200'
                              : 'text-amber-700 bg-amber-50 border-amber-200'
                          }`}
                        >
                          {claim.dataQualityScore ?? 92}%
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => openAdjudication(claim)}
                          className="px-3 py-1 text-[11px] font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Stethoscope className="w-3 h-3" />
                          <span>Adjudicate</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinical Adjudication Decision Modal */}
      {selectedClaim && (
        <Modal
          isOpen={Boolean(selectedClaim)}
          onClose={() => setSelectedClaim(null)}
          title={`Clinical Adjudication • ${selectedClaim.id}`}
          subtitle={`Patient: ${selectedClaim.claimantName} | Billed: ${formatCurrency(selectedClaim.claimAmount)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Clinical Overview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Policy / Member ID</span>
                <p className="font-mono font-bold text-navy mt-0.5">{selectedClaim.policyNumber || 'POL-9021-X'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Facility / Provider</span>
                <p className="font-medium text-slate-800 mt-0.5 truncate">{selectedClaim.hospitalName}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">ICD-10 Diagnosis</span>
                <p className="font-mono font-bold text-blue-700 mt-0.5">
                  {selectedClaim.diagnosisCodes?.[0]?.code || 'R07.9'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">DataGuard Score</span>
                <p className="font-bold text-teal-700 mt-0.5">{selectedClaim.dataQualityScore ?? 92}% Validated</p>
              </div>
            </div>

            {/* Medical Diagnosis & Notes */}
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
              <span className="font-bold text-blue-900 block mb-0.5">Clinical Condition / Description:</span>
              <p className="text-slate-700">
                {selectedClaim.diagnosis || selectedClaim.description || 'Routine inpatient medical adjudication with verified itemized hospital invoice.'}
              </p>
            </div>

            {/* Clinical Reviewer Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Adjudication Determination Notes *
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Enter clinical rationale, policy coverage guidelines applied, or instructions for operator..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500"
              />
            </div>

            {/* Adjudication Decision Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="w-full sm:w-auto px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium order-3 sm:order-1"
              >
                Close Without Decision
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleReject}
                  className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Deny Claim</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRequestCorrection}
                  className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Request Correction</span>
                </button>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleApprove}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve Claim</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
