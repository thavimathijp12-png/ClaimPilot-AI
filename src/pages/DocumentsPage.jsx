import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  FileText,
  UploadCloud,
  Search,
  Filter,
  Eye,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { FileUploader } from '../components/common/FileUploader';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatFileSize, formatDate } from '../utils/formatters';

export function DocumentsPage() {
  const { documents, claims, uploadDocument, deleteDocument, updateDocument } = useClaims();
  const toast = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedClaimForUpload, setSelectedClaimForUpload] = useState(() => claims[0]?.id || '');

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewZoom, setPreviewZoom] = useState(100);

  // Delete Confirm
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const categories = [
    'Hospital Bill',
    'Discharge Summary',
    'Prescription',
    'Claim Form',
    'Other Supporting Documents'
  ];

  const handleUploadComplete = (fileMeta) => {
    const doc = uploadDocument({
      ...fileMeta,
      claimId: selectedClaimForUpload,
    });
    toast.success('Document Uploaded', `File "${doc.name}" is ready for simulated extraction review.`);
    setShowUploadModal(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteDocument(deleteTargetId);
      toast.warning('Document Removed', 'Selected file has been deleted from repository.');
      setDeleteTargetId(null);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.claimId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || doc.category === selectedCategory;
      const matchesStatus = selectedStatus === 'ALL' || doc.status === selectedStatus;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [documents, searchQuery, selectedCategory, selectedStatus]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Management Repository"
        description="Ingest, categorize and inspect medical bills, physician discharge summaries, prescriptions and CMS-1500 universal claim documents."
        actions={
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            disabled={claims.length === 0}
            title={claims.length === 0 ? 'Create a claim before uploading documents' : undefined}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4 stroke-[2]" />
            <span>Upload Documents</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-subtle">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name, category, or linked claim ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Extracted">Extracted</option>
            <option value="Pending OCR">Pending OCR</option>
            <option value="Needs Attention">Needs Attention</option>
          </select>
        </div>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200/90 shadow-subtle p-4 flex flex-col justify-between hover:border-slate-300 card-hover transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-primary-700 uppercase tracking-wider block">
                      {doc.category}
                    </span>
                    <h3 className="text-xs font-bold text-navy truncate max-w-[170px]" title={doc.name}>
                      {doc.name}
                    </h3>
                  </div>
                </div>
                <StatusBadge status={doc.status} size="sm" />
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                {doc.description || 'Verified supporting clinical paperwork.'}
              </p>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-[11px] text-slate-500 mb-3">
                <div className="flex items-center justify-between">
                  <span>Linked Claim:</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/claims/${doc.claimId}`)}
                    className="font-mono font-semibold text-primary-600 hover:underline"
                  >
                    {doc.claimId}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span>File Size / Type:</span>
                  <span className="font-medium text-slate-700">
                    {formatFileSize(doc.sizeBytes)} • {doc.fileType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>OCR Confidence:</span>
                  <span className="font-semibold text-teal-700">
                    {Number.isFinite(doc.confidenceScore) ? `${doc.confidenceScore}%` : 'Not processed'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Uploaded {formatDate(doc.uploadedAt)}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc(doc);
                    setPreviewZoom(100);
                  }}
                  className="p-1.5 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-md transition-colors"
                  title="Preview Document"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/extraction')}
                  className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                  title="Open AI Extraction Review"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  title="Remove Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-navy">No documents match the filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the category filter or clearing your search term.</p>
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Healthcare Document"
        subtitle="Ingest PDF, PNG, or JPG records. DataGuard IQ and simulated OCR will automatically process the file."
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Link to Existing Claim Reference
            </label>
            <select
              value={selectedClaimForUpload}
              onChange={(e) => setSelectedClaimForUpload(e.target.value)}
              disabled={claims.length === 0}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              {claims.length === 0 && <option value="">No claims available</option>}
              {claims.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.claimantName} ({c.hospitalName})
                </option>
              ))}
            </select>
          </div>

          <FileUploader
            claimId={selectedClaimForUpload}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </Modal>

      {/* Document Preview Modal */}
      {previewDoc && (
        <Modal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          title={`Document Preview: ${previewDoc.name}`}
          subtitle={`${previewDoc.category} • Linked to ${previewDoc.claimId} • ${formatFileSize(previewDoc.sizeBytes)}`}
          maxWidth="max-w-4xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(Math.max(60, previewZoom - 20))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono text-slate-500">{previewZoom}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(Math.min(180, previewZoom + 20))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const docToReview = previewDoc;
                    setPreviewDoc(null);
                    navigate('/extraction');
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open in AI Extraction</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          {/* Simulated Healthcare Document Render */}
          <div className="bg-slate-100 p-6 rounded-xl flex items-center justify-center overflow-auto min-h-[420px]">
            <div
              className="bg-white p-8 rounded-lg shadow-elevated border border-slate-200 w-full max-w-2xl font-serif text-slate-800 transition-transform origin-top"
              style={{ transform: `scale(${previewZoom / 100})` }}
            >
              {/* Simulated Hospital Letterhead */}
              <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-tight text-navy font-sans">
                    Metropolitan Memorial Hospital
                  </h2>
                  <p className="text-[11px] font-sans text-slate-500">
                    Department of Patient Financial Services & Clinical Adjudication
                  </p>
                  <p className="text-[10px] font-sans text-slate-400">
                    1400 Health Science Blvd, Suite 400 • NPI: 1942859102 • Federal Tax ID: 36-2910481
                  </p>
                </div>
                <div className="text-right font-sans">
                  <span className="text-[11px] font-bold text-teal-700 block bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    OFFICIAL RECORD
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                    REF: {previewDoc.claimId}
                  </span>
                </div>
              </div>

              {/* Patient / Account Box */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans mb-6 p-3 bg-slate-50 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">PATIENT NAME:</span>
                  <p className="font-bold text-slate-800">Jonathan Sterling</p>
                  <span className="text-slate-400 block text-[10px] mt-1">DOB / GENDER:</span>
                  <p className="text-slate-700">1982-04-12 / Male</p>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">POLICY NUMBER:</span>
                  <p className="font-mono font-bold text-primary-700">POL-BCBS-9042</p>
                  <span className="text-slate-400 block text-[10px] mt-1">ADMISSION DATE:</span>
                  <p className="text-slate-700">2026-10-28 — DISCHARGE: 2026-11-02</p>
                </div>
              </div>

              {/* Ledger Items */}
              <div className="font-sans text-xs mb-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-[10px] uppercase font-bold text-slate-500">
                      <th className="py-1">Description / Procedure</th>
                      <th className="py-1">Code</th>
                      <th className="py-1 text-right">Units</th>
                      <th className="py-1 text-right">Charge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="py-1.5 font-medium">Laparoscopic Cholecystectomy Operating Suite</td>
                      <td className="py-1.5 font-mono text-slate-500">47562</td>
                      <td className="py-1.5 text-right">1</td>
                      <td className="py-1.5 text-right font-semibold">$8,450.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">General Anesthesia Administration (3.5 hrs)</td>
                      <td className="py-1.5 font-mono text-slate-500">00790</td>
                      <td className="py-1.5 text-right">1</td>
                      <td className="py-1.5 text-right font-semibold">$2,650.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">Semi-Private Inpatient Room & Board (5 nights)</td>
                      <td className="py-1.5 font-mono text-slate-500">REV-0120</td>
                      <td className="py-1.5 text-right">5</td>
                      <td className="py-1.5 text-right font-semibold">$3,250.00</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">Post-Op Diagnostic Abdominal Ultrasound</td>
                      <td className="py-1.5 font-mono text-slate-500">76705</td>
                      <td className="py-1.5 text-right">1</td>
                      <td className="py-1.5 text-right font-semibold">$500.50</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 text-xs font-bold">
                      <td colSpan={3} className="py-2 text-right">
                        TOTAL BILLED CHARGES:
                      </td>
                      <td className="py-2 text-right text-sm text-navy">$14,850.50</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Physician Signature Line */}
              <div className="border-t border-slate-200 pt-4 flex justify-between items-end font-sans">
                <div className="text-[10px] text-slate-400">
                  <p>Certified Electronic Clinical Record • Form 109-HC</p>
                  <p>Hash: 9283-bcde-4819-aafe</p>
                </div>
                <div className="text-right">
                  <div className="italic font-serif text-xs text-primary-700 font-bold mb-1">
                    Dr. Gregory Harrison, MD
                  </div>
                  <div className="w-48 border-t border-slate-400 text-[10px] text-slate-500 pt-0.5">
                    Attending Surgeon Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Document from Repository"
        message="Are you sure you want to permanently delete this clinical document? This will remove it from the associated claim file."
        confirmLabel="Delete Document"
        variant="danger"
      />
    </div>
  );
}

