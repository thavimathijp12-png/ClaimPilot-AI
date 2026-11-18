import React, { useState } from 'react';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Edit2,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ShieldAlert,
  FileText,
  UserCheck,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { cn } from '../utils/cn';

export function ExtractionReviewPage() {
  const { extractions, updateExtractionField, verifyExtraction, rerunExtraction, claims } = useClaims();
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [selectedClaimId, setSelectedClaimId] = useState(() => (
    claims.find((claim) => extractions[claim.id])?.id || claims[0]?.id || ''
  ));
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [focusedFieldId, setFocusedFieldId] = useState('f-1');
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editTempValues, setEditTempValues] = useState({});
  const [isRerunning, setIsRerunning] = useState(false);

  const hasExtractionData = Boolean(extractions[selectedClaimId]);
  const extractionData = extractions[selectedClaimId] || {
    fields: [],
    totalPages: 0,
    humanVerified: false,
  };
  const hasUnresolvedFields = extractionData.fields.some((field) => (
    !String(editTempValues[field.id] ?? field.currentValue ?? '').trim()
  ));

  const handleClaimChange = (claimId) => {
    setSelectedClaimId(claimId);
    setCurrentPage(1);
    setFocusedFieldId('f-1');
    setEditingFieldId(null);
    setEditTempValues({});
  };

  const handleFieldChange = (fieldId, val) => {
    setEditTempValues(prev => ({ ...prev, [fieldId]: val }));
  };

  const handleSaveField = (fieldId) => {
    const val = editTempValues[fieldId];
    if (val !== undefined && !val.trim()) {
      toast.warning('Field Required', 'Enter a value or leave the field unchanged before saving.');
      return;
    }
    if (val !== undefined) {
      updateExtractionField(selectedClaimId, fieldId, val);
      toast.success('Field Updated', 'Extracted value manually modified and saved.');
    }
    setEditingFieldId(null);
    setEditTempValues((values) => {
      const next = { ...values };
      delete next[fieldId];
      return next;
    });
  };

  const handleVerifyAll = () => {
    if (!extractionData || hasUnresolvedFields) {
      toast.warning('Review Required', 'Resolve blank extracted fields before recording human verification.');
      return;
    }
    verifyExtraction(selectedClaimId);
    toast.success('Extraction Verified', `Stored demo fields confirmed by ${currentUser?.name || 'Operator'}. Claim is now ready for clinical adjudication.`);
  };

  const handleRerun = async () => {
    setIsRerunning(true);
    await rerunExtraction(selectedClaimId);
    setIsRerunning(false);
    toast.info('Demo Extraction Refreshed', 'The stored sample was refreshed for another human review.');
  };

  const focusedField = extractionData.fields.find(f => f.id === focusedFieldId) || extractionData.fields[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Extraction Review (Demo)"
        badge={
          <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            Human-in-the-Loop Required
          </span>
        }
        description="Review stored demo extraction results, correct fields, and record human verification. No live AI service is connected."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRerun}
              disabled={isRerunning || !hasExtractionData}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRerunning ? 'animate-spin' : ''}`} />
              <span>{isRerunning ? 'Re-extracting...' : 'Re-run Mock Extraction'}</span>
            </button>
            <button
              type="button"
              onClick={handleVerifyAll}
              disabled={!hasExtractionData || extractionData.humanVerified || hasUnresolvedFields}
              className={cn(
                'px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed',
                extractionData.humanVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{extractionData.humanVerified ? 'Verified by Human' : 'Mark as Verified'}</span>
            </button>
          </div>
        }
      />

      {/* Mandatory Regulatory / Human-in-the-Loop Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5 shadow-subtle">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold">
            Important Compliance Notice: AI Extraction Results Are Suggestions
          </p>
          <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
            These demo extraction results are suggestions and must be verified by a human operator. The system will never automatically approve claims. Reviewers are responsible for verifying clinical codes and billed totals against uploaded hospital records.
          </p>
        </div>
      </div>

      {/* Selector & Document Metadata Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Target Claim:</span>
          <select
            value={selectedClaimId}
            onChange={(e) => handleClaimChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-semibold focus:outline-none"
          >
            {claims.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} — {c.claimantName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <span>Overall OCR Confidence:</span>
          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {hasExtractionData ? `${extractionData.overallConfidence ?? '—'}%` : '—'}
          </span>
          {hasExtractionData && extractionData.humanVerified && (
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Verified by {extractionData.verifiedBy}
            </span>
          )}
          {hasExtractionData && (
            <StatusBadge
              status={extractionData.humanVerified ? 'Verified by Human' : 'Needs Human Review'}
              size="sm"
              className={!extractionData.humanVerified ? 'bg-amber-50 text-amber-800 border-amber-200' : ''}
            />
          )}
        </div>
      </div>

      {/* Split-Screen Review Canvas */}
      {hasExtractionData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* LEFT COLUMN: Document Preview Area (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-subtle flex flex-col overflow-hidden">
          {/* Top Document Controls Bar */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <span className="font-semibold text-navy truncate" title={extractionData.documentName}>
                {extractionData.documentName || 'Unnamed demo document'}
              </span>
            </div>

            {/* Page & Zoom Navigation */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-medium text-slate-600 px-1 text-[11px]">
                  Page {currentPage} of {extractionData.totalPages || 3}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(extractionData.totalPages || 3, currentPage + 1))}
                  disabled={currentPage >= (extractionData.totalPages || 3)}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.max(60, zoomLevel - 15))}
                  className="p-1 rounded hover:bg-slate-200"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono text-slate-500">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(Math.min(160, zoomLevel + 15))}
                  className="p-1 rounded hover:bg-slate-200"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Document Page Canvas */}
          <div className="flex-1 p-6 bg-slate-100 flex items-center justify-center overflow-auto relative">
            <div
              className="bg-white p-8 rounded-lg shadow-elevated border border-slate-200 w-full max-w-xl text-slate-800 font-sans transition-transform origin-top relative select-none"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {/* Active Optical Bounding Box Overlay */}
              {focusedField && focusedField.page === currentPage && focusedField.bbox && (
                <div
                  className="absolute border-2 border-primary-500 bg-primary-500/15 rounded pointer-events-none transition-all duration-300 animate-pulse flex items-start justify-end p-0.5"
                  style={{
                    top: `${focusedField.bbox.top}%`,
                    left: `${focusedField.bbox.left}%`,
                    width: `${focusedField.bbox.width}%`,
                    height: `${focusedField.bbox.height}%`,
                  }}
                >
                  <span className="text-[9px] font-bold bg-primary-600 text-white px-1 py-0.2 rounded shadow">
                    OCR: {focusedField.confidence}%
                  </span>
                </div>
              )}

              {/* Simulated Healthcare Bill Document Body */}
              <div className="border-b-2 border-slate-800 pb-3 mb-4 flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-navy text-sm uppercase">Metropolitan Memorial Hospital</h3>
                  <p className="text-[10px] text-slate-500">1400 Health Science Blvd • NPI: 1942859102</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    FORM CMS-1450 (UB-04)
                  </span>
                </div>
              </div>

              {/* Patient Block */}
              <div className="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded border border-slate-200 mb-4">
                <div
                  onClick={() => setFocusedFieldId('f-1')}
                  className={cn(
                    'p-1 rounded cursor-pointer transition-colors',
                    focusedFieldId === 'f-1' ? 'bg-primary-50 ring-1 ring-primary-400' : 'hover:bg-slate-100'
                  )}
                >
                  <span className="text-[10px] text-slate-400 block">PATIENT NAME (BOX 8):</span>
                  <span className="font-bold text-navy">Jonathan Sterling</span>
                </div>

                <div
                  onClick={() => setFocusedFieldId('f-2')}
                  className={cn(
                    'p-1 rounded cursor-pointer transition-colors',
                    focusedFieldId === 'f-2' ? 'bg-primary-50 ring-1 ring-primary-400' : 'hover:bg-slate-100'
                  )}
                >
                  <span className="text-[10px] text-slate-400 block">DATE OF BIRTH (BOX 9):</span>
                  <span className="font-medium text-slate-700">1982-04-12</span>
                </div>
              </div>

              {/* Line Items Sample */}
              <div className="text-xs mb-4">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 font-bold text-slate-500 text-[10px]">
                      <th className="py-1">Rev Cd / Service</th>
                      <th className="py-1">CPT / HCPCS</th>
                      <th className="py-1 text-right">Total Charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr
                      onClick={() => setFocusedFieldId('f-8')}
                      className={cn(
                        'cursor-pointer transition-colors',
                        focusedFieldId === 'f-8' ? 'bg-primary-50 font-semibold' : 'hover:bg-slate-50'
                      )}
                    >
                      <td className="py-1.5">Operating Room Services</td>
                      <td className="py-1.5 font-mono text-primary-700">47562</td>
                      <td className="py-1.5 text-right font-medium">$8,450.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Anesthesia Professional</td>
                      <td className="py-1.5 font-mono text-slate-600">00790</td>
                      <td className="py-1.5 text-right font-medium">$2,650.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5">Room & Board - Inpatient</td>
                      <td className="py-1.5 font-mono text-slate-600">REV-0120</td>
                      <td className="py-1.5 text-right font-medium">$3,250.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr
                      onClick={() => setFocusedFieldId('f-7')}
                      className={cn(
                        'border-t-2 border-slate-800 text-xs font-bold cursor-pointer transition-colors',
                        focusedFieldId === 'f-7' ? 'bg-primary-50' : 'hover:bg-slate-50'
                      )}
                    >
                      <td colSpan={2} className="py-2 text-right">
                        TOTAL BILLED:
                      </td>
                      <td className="py-2 text-right text-navy font-bold">$14,850.50</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400">
                <span>Page {currentPage} of 3</span>
                <span>Document Hash: 0x9b41a980</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Extracted Fields & Confidence Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-subtle flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-navy">Extracted Field Inspector</h2>
              <p className="text-[11px] text-content-muted mt-0.5">Click any field to focus in document canvas</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {extractionData.fields?.length || 0} Fields
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {extractionData.fields?.map((field) => {
              const isFocused = focusedFieldId === field.id;
              const isEditing = editingFieldId === field.id;
              const currentValue = editTempValues[field.id] !== undefined ? editTempValues[field.id] : field.currentValue;

              const confColor =
                field.confidence >= 95
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : field.confidence >= 85
                  ? 'text-blue-700 bg-blue-50 border-blue-200'
                  : 'text-amber-800 bg-amber-50 border-amber-200';
              const confidenceLabel = field.confidence >= 95
                ? 'High confidence'
                : field.confidence >= 85
                  ? 'Review'
                  : 'Low confidence';

              return (
                <div
                  key={field.id}
                  onClick={() => {
                    setFocusedFieldId(field.id);
                    if (field.page) setCurrentPage(field.page);
                  }}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all text-xs cursor-pointer',
                    isFocused
                      ? 'border-primary-500 bg-primary-50/20 shadow-sm ring-1 ring-primary-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700">{field.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border', confColor)}>
                        {field.confidence}% · {confidenceLabel}
                      </span>
                      {field.edited && (
                        <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                          Edited
                        </span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        autoFocus
                        className="w-full text-xs px-2.5 py-1.5 border border-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFieldId(null);
                            setEditTempValues((values) => {
                              const next = { ...values };
                              delete next[field.id];
                              return next;
                            });
                          }}
                          className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveField(field.id)}
                          className="px-2.5 py-1 text-[11px] bg-primary-600 hover:bg-primary-700 text-white font-medium rounded flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono text-navy font-semibold text-xs break-all">
                        {currentValue || <span className="text-amber-600 italic">[Blank / Unreadable]</span>}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFieldId(field.id);
                        }}
                        disabled={extractionData.humanVerified}
                        aria-label={`Edit ${field.label}`}
                        className="p-1 text-slate-400 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed rounded"
                        title="Edit Value"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {field.validationMessage && (
                    <p className="text-[11px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100 leading-tight">
                      {field.validationMessage}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}
      {!hasExtractionData && (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h2 className="text-sm font-bold text-navy">No demo extraction is available for this claim</h2>
          <p className="text-xs text-slate-500 mt-1">
            The demo provides stored extraction samples for selected claims. Uploading a document stores it in the repository but does not generate new extraction results.
          </p>
          <button
            type="button"
            onClick={() => navigate('/documents')}
            className="mt-4 px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
          >
            View Document Repository
          </button>
        </div>
      )}
    </div>
  );
}

