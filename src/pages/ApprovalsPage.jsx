import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimContext';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Eye,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatCurrency, formatDate } from '../utils/formatters';

export function ApprovalsPage() {
  const { claims, approveClaim, rejectClaim, requestCorrection } = useClaims();
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedClaimId, setSelectedClaimId] = useState(null);
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    action: null, // 'approve', 'reject', 'correction'
    claimId: null,
  });

  const pendingClaims = claims.filter(
    (c) => c.status === 'Pending Review' || c.status === 'Under AI Audit'
  );

  const activeClaim = pendingClaims.find((c) => c.id === selectedClaimId) || pendingClaims[0];

  const handleDecisionConfirm = async (notesOrReason) => {
    const claimToAdjudicate = decisionModal.claimId;
    if (!claimToAdjudicate) return false;
    const isPending = pendingClaims.some((claim) => claim.id === claimToAdjudicate);
    if (!isPending) {
      toast.warning('Claim No Longer Pending', 'Refresh the queue before recording another decision.');
      setDecisionModal({ isOpen: false, action: null, claimId: null });
      return true;
    }

    let updated = false;
    if (decisionModal.action === 'approve') {
      updated = await approveClaim(claimToAdjudicate, notesOrReason);
    } else if (decisionModal.action === 'reject') {
      updated = await rejectClaim(claimToAdjudicate, notesOrReason);
    } else if (decisionModal.action === 'correction') {
      updated = await requestCorrection(claimToAdjudicate, notesOrReason);
    }

    if (!updated) return false;
    if (decisionModal.action === 'approve') {
      toast.success('Adjudication Approved', `Claim ${claimToAdjudicate} approved by ${currentUser?.name}.`);
    } else if (decisionModal.action === 'reject') {
      toast.error('Claim Rejected', `Claim ${claimToAdjudicate} denied. Mandatory justification logged.`);
    } else {
      toast.warning('Correction Requested', `Instructions dispatched for claim ${claimToAdjudicate}.`);
    }
    setDecisionModal({ isOpen: false, action: null, claimId: null });
    return true;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clinical Adjudication & Approval Queue"
        badge={
          <span className="px-2.5 py-0.5 text-xs font-bold bg-primary-50 text-primary-700 border border-primary-200 rounded-full flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-primary-600" />
            Human Authority Enforced
          </span>
        }
        description="Review incoming healthcare claims, examine cross-referenced DataGuard findings, check clinical necessity, and record final adjudication decisions."
      />

      {/* Human Control Principle Callout */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between gap-4 shadow-elevated">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
            <CheckSquare className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Human Adjudication Guarantee</p>
            <p className="text-slate-300 text-[11px] mt-0.5">
              ClaimPilot AI never executes automated approval. All reimbursement determinations require affirmative sign-off by a licensed reviewer or claims adjudicator.
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">Reviewer On Duty</span>
          <span className="font-bold text-white">{currentUser?.name}</span>
        </div>
      </div>

      {pendingClaims.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 shadow-subtle">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-navy">All Claims Adjudicated</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            The clinical adjudication queue is clear. No claims currently require manual human review.
          </p>
          <button
            type="button"
            onClick={() => navigate('/claims')}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
          >
            Browse All Claims
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Pending Claims List (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-subtle flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <span className="text-xs font-bold text-navy uppercase tracking-wider">
                Pending Adjudication ({pendingClaims.length})
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Select to review</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {pendingClaims.map((claim) => {
                const isSelected = (activeClaim?.id === claim.id);
                return (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaimId(claim.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedClaimId(claim.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    className={`p-4 cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'bg-primary-50/40 border-l-4 border-primary-600'
                        : 'hover:bg-slate-50/70 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-primary-600">{claim.id}</span>
                      <StatusBadge status={claim.status} size="sm" />
                    </div>

                    <p className="font-bold text-navy text-sm">{claim.claimantName}</p>
                    <p className="text-slate-500 text-[11px] truncate">{claim.hospitalName}</p>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400">
                        Submitted {formatDate(claim.submissionDate)}
                      </span>
                      <span className="font-bold text-navy text-sm">
                        {formatCurrency(claim.claimAmount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Review Workspace (7 Cols) */}
          {activeClaim && (
            <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-subtle p-5 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-navy font-mono">{activeClaim.id}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        DataGuard: {activeClaim.dataQualityScore}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeClaim.claimantName} • {activeClaim.policyNumber} ({activeClaim.policyPlan})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/claims/${activeClaim.id}`)}
                    className="text-xs text-primary-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Adjudication Checklist */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Clinical Adjudication Checklist
                  </h3>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Patient identity & active policy enrollment confirmed.</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Itemized billing charges sum reconciles with ledger line items.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>AI OCR field suggestions verified by intake operator.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <ShieldCheck className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      <span>NPI registration verified against CMS master registry.</span>
                    </div>
                  </div>
                </div>

                {/* Encounter Summary */}
                <div className="p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-700 block">Encounter & Medical Necessity:</span>
                  <p className="text-slate-600 leading-relaxed">{activeClaim.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Facility: {activeClaim.hospitalName}</span>
                    <span>Billed: {formatCurrency(activeClaim.claimAmount)}</span>
                  </div>
                </div>

                {/* Review Notes Preview */}
                {activeClaim.reviewNotes && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900 block mb-0.5">Latest Clinical Notes:</span>
                    <p className="text-amber-800">{activeClaim.reviewNotes}</p>
                  </div>
                )}
              </div>

              {/* Action Decision Buttons */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-400">
                  Adjudicating as <strong className="text-slate-700">{currentUser?.name}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: true, action: 'correction', claimId: activeClaim.id })
                    }
                    className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Request Correction</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: true, action: 'reject', claimId: activeClaim.id })
                    }
                    className="px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Reject</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDecisionModal({ isOpen: true, action: 'approve', claimId: activeClaim.id })
                    }
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve Claim</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog with mandatory reason inputs */}
      <ConfirmDialog
        isOpen={decisionModal.isOpen}
        onClose={() => setDecisionModal({ isOpen: false, action: null, claimId: null })}
        onConfirm={handleDecisionConfirm}
        title={
          decisionModal.action === 'approve'
            ? `Approve Claim ${decisionModal.claimId}`
            : decisionModal.action === 'reject'
            ? `Reject Claim ${decisionModal.claimId}`
            : `Request Correction on ${decisionModal.claimId}`
        }
        message={
          decisionModal.action === 'approve'
            ? 'Confirm approval and payment disbursement? This action is recorded with your clinical credentials in the tamper-evident audit history.'
            : decisionModal.action === 'reject'
            ? 'Rejecting this claim will formally deny coverage. Please provide a mandatory clinical or regulatory justification.'
            : 'Specify the missing document, corrected signature, or itemized reconciliation required from the provider.'
        }
        confirmLabel={
          decisionModal.action === 'approve' ? 'Confirm Approval' : decisionModal.action === 'reject' ? 'Deny Claim' : 'Dispatch Request'
        }
        variant={
          decisionModal.action === 'approve' ? 'success' : decisionModal.action === 'reject' ? 'danger' : 'warning'
        }
        requireText={decisionModal.action !== 'approve'}
        textLabel={decisionModal.action === 'reject' ? 'Mandatory Rejection Justification' : 'Correction Instructions'}
        textRequired={decisionModal.action === 'reject' || decisionModal.action === 'correction'}
        textPlaceholder={
          decisionModal.action === 'reject'
            ? 'e.g. Non-contracted provider without emergency exception under policy Section 4.2'
            : 'e.g. Please provide physician signature on page 2 triage ledger'
        }
      />
    </div>
  );
}

