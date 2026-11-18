import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  Shield,
  FileText,
  DollarSign,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
  Plus,
  Send,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import CodeBadge from '../components/common/CodeBadge';
import { formatCurrency, formatDate, formatRelativeTime, formatFileSize } from '../utils/formatters';

export function ClaimDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { claims, documents, validations, approveClaim, rejectClaim, requestCorrection, updateClaim } = useClaims();
  const toast = useToast();

  const claim = claims.find(c => c.id === id);
  const claimDocs = documents.filter(d => d.claimId === id);
  const validationData = validations[id] || null;
  const canAdjudicate = claim && ['Pending Review', 'Under AI Audit'].includes(claim.status);

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    action: null, // 'approve', 'reject', 'correction'
  });

  // Comments / Notes Input
  const [newComment, setNewComment] = useState('');

  if (!claim) {
    return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
        <h2 className="text-lg font-bold text-navy">Claim Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested claim reference "{id}" does not exist in local state.</p>
        <button
          type="button"
          onClick={() => navigate('/claims')}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
        >
          Return to Claims Registry
        </button>
      </div>
    );
  }

  const handleDecisionConfirm = (notesOrReason) => {
    let updated = false;
    if (decisionModal.action === 'approve') {
      updated = approveClaim(claim.id, notesOrReason);
    } else if (decisionModal.action === 'reject') {
      updated = rejectClaim(claim.id, notesOrReason);
    } else if (decisionModal.action === 'correction') {
      updated = requestCorrection(claim.id, notesOrReason);
    }

    if (!updated) {
      toast.warning('Decision Not Recorded', 'This claim is no longer awaiting adjudication. Refresh the record and try again.');
      setDecisionModal({ isOpen: false, action: null });
      return true;
    }

    if (decisionModal.action === 'approve') {
      toast.success('Claim Approved', `Claim ${claim.id} has been adjudicated and approved.`);
    } else if (decisionModal.action === 'reject') {
      toast.error('Claim Rejected', `Claim ${claim.id} has been denied.`);
    } else {
      toast.warning('Correction Requested', `Notice dispatched for ${claim.id}.`);
    }
    setDecisionModal({ isOpen: false, action: null });
    return true;
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newTimelineItem = {
      id: `evt-${Date.now()}`,
      date: new Date().toISOString(),
      title: 'Reviewer Comment Added',
      user: 'Sarah Jenkins, RN',
      description: newComment.trim(),
    };

    updateClaim(claim.id, {
      timeline: [newTimelineItem, ...(claim.timeline || [])],
      reviewNotes: newComment.trim(),
    });

    setNewComment('');
    toast.info('Comment Appended', 'Audit note recorded on claim timeline.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/claims')}
            className="p-2 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 transition-colors"
            title="Back to Claims List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold text-navy font-mono tracking-tight">{claim.id}</span>
              <StatusBadge status={claim.status} size="md" />
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                DataGuard: {claim.dataQualityScore}%
              </span>
            </div>
            <p className="text-xs text-content-muted mt-0.5">
              Submitted {formatDate(claim.submissionDate)} • Assigned to {claim.assignedTo}
            </p>
          </div>
        </div>

        {/* Adjudication Decision Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDecisionModal({ isOpen: true, action: 'correction' })}
            disabled={!canAdjudicate}
            className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Request Correction</span>
          </button>
          <button
            type="button"
            onClick={() => setDecisionModal({ isOpen: true, action: 'reject' })}
            disabled={!canAdjudicate}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Reject Claim</span>
          </button>
          <button
            type="button"
            onClick={() => setDecisionModal({ isOpen: true, action: 'approve' })}
            disabled={!canAdjudicate}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Approve Claim</span>
          </button>
        </div>
      </div>

      {/* Grid: Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Details Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claimant & Policy Summary Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary-600" />
              Claimant & Coverage Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Claimant Full Legal Name</span>
                <p className="text-sm font-bold text-navy">{claim.claimantName}</p>
                <div className="flex items-center gap-2 text-slate-500 pt-1">
                  <span>DOB: {claim.claimantDob || '1985-06-15'}</span>
                  <span>•</span>
                  <span>Gender: {claim.claimantGender || 'Unspecified'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Policy Reference & Plan</span>
                <p className="text-sm font-bold text-primary-600 font-mono">{claim.policyNumber}</p>
                <p className="text-slate-600 font-medium truncate">{claim.policyPlan}</p>
              </div>
            </div>
          </div>

          {/* Clinical Encounter & Facility Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-teal-600" />
              Healthcare Provider & Clinical Encounter
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[11px]">Provider Facility</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{claim.hospitalName}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">NPI: {claim.hospitalNpi}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Encounter Classification</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">{claim.claimType}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Priority: {claim.priority}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Admission / Discharge</span>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">
                  {formatDate(claim.admissionDate)} — {formatDate(claim.dischargeDate)}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Length: Acute Episode</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="font-semibold text-slate-700 block mb-1">Clinical Intake Summary:</span>
              <p className="text-slate-600 leading-relaxed">{claim.description}</p>
            </div>

            {/* Diagnostic Codes Table */}
            {claim.diagnosisCodes && claim.diagnosisCodes.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2.5">
                  Validated Diagnostic & Procedure Codes
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {claim.diagnosisCodes.map((d, i) => (
                    <CodeBadge
                      key={`diag-${i}`}
                      code={d.code}
                      description={d.description}
                      type="diagnosis"
                      showDescription={true}
                    />
                  ))}
                  {claim.procedureCodes &&
                    claim.procedureCodes.map((p, i) => (
                      <CodeBadge
                        key={`proc-${i}`}
                        code={p.code}
                        description={p.description}
                        type="procedure"
                        showDescription={true}
                      />
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Attached Supporting Documents */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary-600" />
                Attached Clinical Documentation ({claimDocs.length})
              </h2>
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                <span>Upload Additional</span>
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {claimDocs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 border border-dashed rounded-lg">
                No documents currently attached to this claim reference.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {claimDocs.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{doc.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {doc.category} • {formatFileSize(doc.sizeBytes)} • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={doc.status} size="sm" />
                      <button
                        type="button"
                        onClick={() => navigate('/extraction')}
                        className="p-1.5 text-slate-400 hover:text-primary-600 rounded"
                        title="Review OCR Extraction"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Financials, DataGuard & Timeline */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Adjudication Financials
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Gross Billed Charges</span>
                <span className="text-sm font-bold text-navy">{formatCurrency(claim.claimAmount)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Patient Copay / Deductible</span>
                <span className="font-semibold text-slate-700">{formatCurrency(claim.copayAmount)}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Eligible Adjudicated Payout</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(claim.approvedAmount || (claim.status === 'Approved' ? claim.claimAmount : 0))}
                </span>
              </div>
            </div>
          </div>

          {/* DataGuard Quality Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                DataGuard IQ Score
              </h2>
              <button
                type="button"
                onClick={() => navigate('/dataguard')}
                className="text-xs text-primary-600 hover:underline font-semibold"
              >
                Inspect
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
              <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-extrabold text-base flex items-center justify-center flex-shrink-0">
                {claim.dataQualityScore}%
              </div>
              <div>
                <p className="text-xs font-bold text-teal-900">Automated Integrity Verified</p>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  24 consistency checks run against payer enrollment ledger.
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-subtle">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Audit & Adjudication Timeline
            </h2>
            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {(claim.timeline || []).map((evt) => (
                <div key={evt.id} className="relative text-xs">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-primary-600 ring-2 ring-white" />
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy">{evt.title}</span>
                    <span className="text-[10px] text-slate-400">{formatDate(evt.date, true)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{evt.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">— {evt.user}</p>
                </div>
              ))}
            </div>

            {/* Quick Comment Input */}
            <form onSubmit={handleAddComment} className="mt-5 pt-4 border-t border-slate-100">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Add Reviewer Note / Internal Comment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter audit note..."
                  className="flex-1 text-xs px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="p-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white rounded-lg transition-colors"
                  aria-label="Submit note"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Decision Confirmation Dialog */}
      <ConfirmDialog
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal({ isOpen: false, action: null })}
        onConfirm={handleDecisionConfirm}
        title={
          decisionModal.action === 'approve'
            ? 'Confirm Claim Approval'
            : decisionModal.action === 'reject'
            ? 'Reject Healthcare Claim'
            : 'Request Provider Correction'
        }
        message={
          decisionModal.action === 'approve'
            ? `Are you sure you want to approve claim ${claim.id} for the full billed sum of ${formatCurrency(claim.claimAmount)}? This will record your name in the clinical audit history.`
            : decisionModal.action === 'reject'
            ? `Rejecting claim ${claim.id} will deny disbursement. A mandatory clinical or compliance reason is required.`
            : `Please enter the specific clinical corrections or documentation items required from the provider.`
        }
        confirmLabel={
          decisionModal.action === 'approve' ? 'Approve Claim' : decisionModal.action === 'reject' ? 'Deny & Reject' : 'Send Correction Notice'
        }
        variant={
          decisionModal.action === 'approve' ? 'success' : decisionModal.action === 'reject' ? 'danger' : 'warning'
        }
        requireText={decisionModal.action !== 'approve'}
        textLabel={decisionModal.action === 'reject' ? 'Mandatory Rejection Reason' : 'Correction Instructions'}
        textRequired={decisionModal.action === 'reject' || decisionModal.action === 'correction'}
        textPlaceholder={
          decisionModal.action === 'reject'
            ? 'Specify coverage exclusion, lack of pre-authorization, or out-of-network rider...'
            : 'Specify missing signatures, ledger reconciliations, or discharge notes needed...'
        }
      />
    </div>
  );
}

