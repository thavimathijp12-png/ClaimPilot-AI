import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Clock,
  Plus,
  ArrowRight,
  Search,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  Send,
  User,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

export function OperatorDashboardPage() {
  const { currentUser } = useAuth();
  const { claims = [], createClaim, refreshData } = useClaims();
  const navigate = useNavigate();
  const toast = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [intakeFilter, setIntakeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Quick Ingestion Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [claimantName, setClaimantName] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Queue Synchronized', 'Retrieved latest intake assignments.');
    } catch {
      toast.error('Sync Failed', 'Could not refresh intake telemetry.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!claimantName.trim() || !claimAmount) {
      toast.warning('Required Fields', 'Please specify claimant name and billed amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createClaim({
        claimantName: claimantName.trim(),
        policyNumber: policyNumber.trim() || 'POL-GEN-9021',
        hospitalName: hospitalName.trim() || 'Metro Health General Hospital',
        claimAmount: parseFloat(claimAmount) || 0,
        diagnosis: diagnosis.trim() || 'Routine Inpatient Medical Adjudication',
        priority: 'MEDIUM',
      });
      toast.success('Claim Ingested', `Claim ${created?.id || 'Record'} successfully registered in intake queue.`);
      setShowCreateModal(false);
      setClaimantName('');
      setPolicyNumber('');
      setHospitalName('');
      setClaimAmount('');
      setDiagnosis('');
    } catch (err) {
      toast.error('Intake Failed', err.message || 'Could not create claim record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter operator claims (intake focused)
  const operatorClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchSearch =
        claim.claimantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.hospitalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.policyNumber?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (intakeFilter === 'ALL') return true;
      if (intakeFilter === 'UNDER_AUDIT') return claim.status === 'Under AI Audit';
      if (intakeFilter === 'PENDING_DOCS') return claim.status === 'Correction Requested' || !claim.documentCount;
      if (intakeFilter === 'SUBMITTED') return claim.status === 'Pending Review' || claim.status === 'Submitted';
      return true;
    });
  }, [claims, searchQuery, intakeFilter]);

  // Operator specific metrics
  const myQueueCount = claims.filter(
    (c) => c.status === 'Under AI Audit' || c.status === 'Pending Review' || c.status === 'Correction Requested'
  ).length;
  const docsPendingCount = claims.filter((c) => c.status === 'Correction Requested').length;
  const underExtractionCount = claims.filter((c) => c.status === 'Under AI Audit').length;
  const submittedToday = claims.length;

  return (
    <div className="space-y-6">
      {/* Operator Profile Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-navy text-white p-6 rounded-2xl border border-teal-700/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-teal-400/10 to-transparent pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <FolderOpen className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <Avatar
                src={currentUser?.avatar || '/operator-avatar.png'}
                name={currentUser?.name || 'Varshini'}
                role="Claims Operator"
                size="lg"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-teal-300/60 shadow-lg object-cover"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-teal-600 border border-white/20 text-[10px] font-extrabold uppercase rounded-md tracking-wider text-white shadow-sm">
                OPERATOR
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                  Intake & Document Operations
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                  Active Intake Terminal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentUser?.name || 'Varshini'}
              </h1>
              <p className="text-xs sm:text-sm text-teal-100 mt-0.5">
                {currentUser?.title || 'Senior Claims Processing Specialist'} • Intake & Patient Demographics
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
              <span>{isRefreshing ? 'Syncing...' : 'Sync Intake'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-300" />
              <span>Batch Upload</span>
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-navy font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Claim Intake</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operator KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="Active Intake Queue"
          value={myQueueCount}
          subtitle="Assigned intake workloads"
          icon={FileText}
          variant="teal"
          onClick={() => { }}
        />
        <StatCard
          title="Under AI OCR Audit"
          value={underExtractionCount}
          subtitle="Automated extraction running"
          icon={Sparkles}
          variant="default"
          onClick={() => navigate('/extraction')}
        />
        <StatCard
          title="Corrections / Missing Info"
          value={docsPendingCount}
          subtitle="Awaiting additional patient docs"
          icon={AlertCircle}
          variant="amber"
          onClick={() => setIntakeFilter('PENDING_DOCS')}
        />
        <StatCard
          title="Total Ingested"
          value={submittedToday}
          subtitle="Claims in enterprise registry"
          icon={CheckCircle2}
          variant="teal"
          onClick={() => navigate('/claims')}
        />
      </div>

      {/* Operator Quick Actions Tray */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="p-4 rounded-xl bg-white border border-teal-200 hover:border-teal-500 hover:shadow-md transition-all text-left flex items-start gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy group-hover:text-teal-700">New Claim Intake</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Enter patient demographics, insurance policy, and initial billed items.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/documents')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all text-left flex items-start gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy group-hover:text-teal-700">Document Center</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Upload hospital invoices, discharge summaries, and medical prescriptions.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/extraction')}
          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all text-left flex items-start gap-3.5 group"
        >
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-navy group-hover:text-teal-700">AI OCR Extraction</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Review and verify OCR-extracted bill totals and patient identifiers.
            </p>
          </div>
        </button>
      </div>

      {/* Operator Ingestion Worklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-600" />
              <h2 className="text-base font-bold text-navy">Assigned Intake Worklist</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Operator Scope
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Track claimant details, upload supplementary documents, and monitor AI processing progress.
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
                placeholder="Search claimant, ID, facility..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white w-48 sm:w-60"
              />
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              {[
                { id: 'ALL', label: 'All Ingested' },
                { id: 'UNDER_AUDIT', label: 'Under AI Audit' },
                { id: 'PENDING_DOCS', label: 'Docs Needed' },
                { id: 'SUBMITTED', label: 'Submitted' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setIntakeFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${intakeFilter === tab.id
                      ? 'bg-white text-teal-800 shadow-2xs'
                      : 'text-slate-600 hover:text-navy hover:bg-slate-200/50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ingestion Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Claim Reference</th>
                <th className="px-4 py-3">Claimant Details</th>
                <th className="px-4 py-3">Hospital / Facility</th>
                <th className="px-4 py-3 text-right">Billed Amount</th>
                <th className="px-4 py-3">Intake Status</th>
                <th className="px-4 py-3 text-center">DataGuard Score</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {operatorClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-slate-400">
                    No intake records found in this view. Use "New Claim Intake" to create one.
                  </td>
                </tr>
              ) : (
                operatorClaims.map((claim) => (
                  <tr
                    key={claim.id}
                    onClick={() => navigate(`/claims/${claim.id}`)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 font-semibold text-teal-700 font-mono">
                      {claim.id}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-navy">{claim.claimantName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{claim.policyNumber || 'POL-9021-X'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">
                      {claim.hospitalName}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-navy">
                      {formatCurrency(claim.claimAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={claim.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full text-[11px] border border-teal-200">
                        {claim.dataQualityScore ?? 92}%
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/claims/${claim.id}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors flex items-center gap-1"
                        >
                          <span>Manage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Claim Intake Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Register New Claim Intake"
        subtitle="Capture patient demographics and hospital billing items"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Claimant / Patient Name *
              </label>
              <input
                type="text"
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="e.g. Robert Kowalski"
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Insurance Policy Number
              </label>
              <input
                type="text"
                value={policyNumber}
                onChange={(e) => setPolicyNumber(e.target.value)}
                placeholder="e.g. POL-882190-TX"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital / Provider Name
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                placeholder="e.g. St. Jude Regional Hospital"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Billed Amount ($ USD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="4250.00"
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Primary Diagnosis / Clinical Notes
            </label>
            <textarea
              rows={3}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Acute appendicitis with laparoscopic appendectomy. Patient discharged in stable condition."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Register Claim'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
