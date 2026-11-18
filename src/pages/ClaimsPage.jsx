import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  Plus,
  Download,
  Eye,
  Edit2,
  Copy,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable } from '../components/common/DataTable';
import { SearchInput } from '../components/common/SearchInput';
import { FilterBar } from '../components/common/FilterBar';
import { Pagination } from '../components/common/Pagination';
import { StatusBadge } from '../components/common/StatusBadge';
import Tooltip from '../components/common/Tooltip';
import DropdownMenu from '../components/common/DropdownMenu';
import DensityToggle from '../components/common/DensityToggle';
import { Modal } from '../components/common/Modal';
import { FormField } from '../components/common/FormField';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportToCSV } from '../services/exportService';
import { storage } from '../services/storageService';
import { validateClaimForm } from '../utils/validators';

const isValidDensity = (value) => ['compact', 'comfortable', 'spacious'].includes(value);

function getSavedDensity() {
  const savedDensity = storage.get('table_density', null, isValidDensity);
  if (savedDensity) return savedDensity;

  try {
    const legacyDensity = window.localStorage.getItem('claimpilot_table_density');
    if (isValidDensity(legacyDensity)) {
      storage.set('table_density', legacyDensity);
      return legacyDensity;
    }
    if (legacyDensity) {
      console.warn('Invalid saved claim table density; using the comfortable layout.');
      window.localStorage.removeItem('claimpilot_table_density');
    }
  } catch (error) {
    console.warn('Unable to read saved claim table density:', error);
  }
  return 'comfortable';
}

export function ClaimsPage() {
  const { claims, createClaim, updateClaim } = useClaims();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search, Filters & Sorting State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'ALL');
  const [sortColumn, setSortColumn] = useState('submissionDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const [density, setDensity] = useState(getSavedDensity);

  const handleDensityChange = (newDensity) => {
    if (!isValidDensity(newDensity)) return;
    setDensity(newDensity);
    storage.set('table_density', newDensity);
  };

  // Modal State: Create / Edit
  const [modalOpen, setModalOpen] = useState(searchParams.get('action') === 'create');
  const [editingClaim, setEditingClaim] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    claimantName: '',
    claimantDob: '1985-06-15',
    claimantGender: 'Female',
    policyNumber: '',
    policyPlan: 'BlueCross Comprehensive Gold PPO',
    hospitalName: '',
    hospitalNpi: '1942859102',
    claimType: 'Inpatient',
    claimAmount: '',
    copayAmount: '50.00',
    submissionDate: new Date().toISOString().split('T')[0],
    admissionDate: new Date().toISOString().split('T')[0],
    dischargeDate: new Date().toISOString().split('T')[0],
    status: 'Pending Review',
    priority: 'Medium',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setEditingClaim(null);
      setModalOpen(true);
      setSearchParams((params) => {
        const nextParams = new URLSearchParams(params);
        nextParams.delete('action');
        return nextParams;
      }, { replace: true });
    }
  }, [searchParams]);

  useEffect(() => {
    const nextSearch = searchParams.get('q') || '';
    const nextStatus = searchParams.get('status') || 'ALL';
    const nextType = searchParams.get('type') || 'ALL';
    setSearchQuery((current) => current === nextSearch ? current : nextSearch);
    setStatusFilter((current) => current === nextStatus ? current : nextStatus);
    setTypeFilter((current) => current === nextType ? current : nextType);
  }, [searchParams]);

  useEffect(() => {
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);
      const filters = { q: searchQuery.trim(), status: statusFilter, type: typeFilter };
      Object.entries(filters).forEach(([key, value]) => {
        if (!value || value === 'ALL') nextParams.delete(key);
        else nextParams.set(key, value);
      });
      return nextParams.toString() === params.toString() ? params : nextParams;
    }, { replace: true });
  }, [searchQuery, statusFilter, typeFilter, setSearchParams]);

  const handleOpenCreateModal = () => {
    setEditingClaim(null);
    setFormData({
      claimantName: '',
      claimantDob: '1985-06-15',
      claimantGender: 'Female',
      policyNumber: 'POL-BCBS-' + Math.floor(1000 + Math.random() * 9000),
      policyPlan: 'BlueCross Comprehensive Gold PPO',
      hospitalName: 'Metropolitan Memorial Hospital',
      hospitalNpi: '1942859102',
      claimType: 'Inpatient',
      claimAmount: '',
      copayAmount: '50.00',
      submissionDate: new Date().toISOString().split('T')[0],
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeDate: new Date().toISOString().split('T')[0],
      status: 'Pending Review',
      priority: 'Medium',
      description: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (claim, e) => {
    if (e) e.stopPropagation();
    setEditingClaim(claim);
    setFormData({
      claimantName: claim.claimantName,
      claimantDob: claim.claimantDob || '1985-06-15',
      claimantGender: claim.claimantGender || 'Female',
      policyNumber: claim.policyNumber,
      policyPlan: claim.policyPlan,
      hospitalName: claim.hospitalName,
      hospitalNpi: claim.hospitalNpi,
      claimType: claim.claimType,
      claimAmount: claim.claimAmount.toString(),
      copayAmount: (claim.copayAmount || 0).toString(),
      submissionDate: claim.submissionDate,
      admissionDate: claim.admissionDate,
      dischargeDate: claim.dischargeDate,
      status: claim.status,
      priority: claim.priority,
      description: claim.description,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const validation = validateClaimForm(formData);
    if (!validation.success) {
      setFormErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      toast.warning('Validation Required', firstError || 'Please correct the highlighted fields.');
      return;
    }

    setFormErrors({});
    const claimData = {
      ...validation.data,
      copayAmount: validation.data.copayAmount ?? 0,
    };

    if (editingClaim) {
      updateClaim(editingClaim.id, claimData);
      toast.success('Claim Updated', `Record for ${editingClaim.id} updated successfully.`);
    } else {
      const created = createClaim(claimData);
      toast.success('Claim Registered', `New claim created with reference ${created.id}.`);
    }

    setModalOpen(false);
  };

  const handleFieldChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  // Sorting Handler
  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  // Filtering & Sorting Pipeline
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch =
        !searchQuery ||
        claim.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.claimantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || claim.claimType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [claims, searchQuery, statusFilter, typeFilter]);

  const sortedClaims = useMemo(() => {
    return [...filteredClaims].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      let comparison = 0;

      if (sortColumn === 'claimAmount' || sortColumn === 'dataQualityScore') {
        comparison = (Number(aValue) || 0) - (Number(bValue) || 0);
      } else if (sortColumn === 'submissionDate') {
        comparison = (Date.parse(aValue) || 0) - (Date.parse(bValue) || 0);
      } else {
        comparison = String(aValue ?? '').localeCompare(String(bValue ?? ''), undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredClaims, sortColumn, sortDirection]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedClaims.length / pageSize) || 1;
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedClaims.slice(start, start + pageSize);
  }, [sortedClaims, currentPage, pageSize]);

  const handleExportClaims = () => {
    const rows = sortedClaims.map(c => ({
      'Claim ID': c.id,
      'Claimant': c.claimantName,
      'Policy Number': c.policyNumber,
      'Plan': c.policyPlan,
      'Hospital': c.hospitalName,
      'Claim Type': c.claimType,
      'Billed Amount': c.claimAmount,
      'Submission Date': c.submissionDate,
      'Status': c.status,
      'Data Quality': `${c.dataQualityScore}%`,
    }));
    exportToCSV('ClaimPilot_Claims_Registry', rows);
    toast.info('Export Initiated', 'Claims registry exported to CSV format.');
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setCurrentPage(1);
  };

  const columns = [
    {
      key: 'id',
      header: 'Claim ID',
      sortable: true,
      render: (val) => (
        <span className="font-semibold text-primary-600 font-mono tracking-tight">{val}</span>
      ),
    },
    {
      key: 'claimantName',
      header: 'Claimant / Patient',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-navy">{val}</span>
          <span className="block text-[11px] text-slate-400">{row.policyNumber}</span>
        </div>
      ),
    },
    {
      key: 'hospitalName',
      header: 'Healthcare Facility',
      sortable: true,
      render: (val, row) => (
        <div className="max-w-[200px] truncate" title={val}>
          <span className="text-slate-800">{val}</span>
          <span className="block text-[11px] text-slate-400">{row.claimType}</span>
        </div>
      ),
    },
    {
      key: 'claimAmount',
      header: 'Claim Amount',
      sortable: true,
      align: 'right',
      render: (val) => (
        <span className="font-bold text-navy">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'submissionDate',
      header: 'Submission Date',
      sortable: true,
      render: (val) => (
        <span className="text-slate-500">{formatDate(val)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Adjudication Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} size="sm" />,
    },
    {
      key: 'dataQualityScore',
      header: 'DataGuard IQ',
      sortable: true,
      align: 'center',
      render: (val) => (
        <Tooltip
          content={`Data quality validation: ${val >= 90 ? 'High Confidence (Clean pass)' : val >= 75 ? 'Moderate Risk (Requires manual verification)' : 'High Risk (Discrepancies flagged)'}`}
          position="top"
        >
          <span className="inline-block px-2 py-0.5 text-[11px] font-bold rounded-full bg-teal-50 text-teal-700 border border-teal-200 cursor-help">
            {val}%
          </span>
        </Tooltip>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Tooltip content="Inspect Claim 360°" position="top">
            <button
              type="button"
              onClick={() => navigate(`/claims/${row.id}`)}
              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              aria-label="Inspect Claim Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip content="Edit Claim Record" position="top">
            <button
              type="button"
              onClick={(e) => handleOpenEditModal(row, e)}
              className="p-1.5 text-slate-400 hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Edit Claim"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
          <DropdownMenu
            align="right"
            items={[
              {
                id: 'inspect',
                label: '360° Investigation',
                icon: Eye,
                onClick: () => navigate(`/claims/${row.id}`),
              },
              {
                id: 'dataguard',
                label: 'DataGuard IQ Audit',
                icon: ShieldCheck,
                onClick: () => navigate('/dataguard'),
              },
              { divider: true },
              {
                id: 'copy-id',
                label: 'Copy Claim ID',
                icon: Copy,
                onClick: () => {
                  navigator.clipboard.writeText(row.id);
                  toast.success('Copied', `Claim ID ${row.id} copied to clipboard.`);
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Claims Management"
        description="Comprehensive healthcare claims ledger with automated DataGuard audits, AI OCR extraction link, and adjudication workflows."
        actions={
          <>
            <button
              type="button"
              onClick={handleExportClaims}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create Claim</span>
            </button>
          </>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <SearchInput
          value={searchQuery}
          onChange={(val) => {
            setSearchQuery(val);
            setCurrentPage(1);
          }}
          placeholder="Filter by Claim ID, claimant name, hospital, policy number..."
          className="lg:max-w-md"
        />

        <div className="flex items-center gap-2.5 flex-wrap justify-between lg:justify-end">
          <FilterBar
            hasActiveFilters={statusFilter !== 'ALL' || typeFilter !== 'ALL' || Boolean(searchQuery)}
            onReset={resetFilters}
            filters={[
              {
                id: 'status',
                label: 'Claim Status',
                value: statusFilter,
                onChange: (val) => {
                  setStatusFilter(val);
                  setCurrentPage(1);
                },
                options: [
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Pending Review', value: 'Pending Review' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Correction Requested', value: 'Correction Requested' },
                  { label: 'Under AI Audit', value: 'Under AI Audit' },
                  { label: 'Rejected', value: 'Rejected' },
                ],
              },
              {
                id: 'type',
                label: 'Encounter Type',
                value: typeFilter,
                onChange: (val) => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                },
                options: [
                  { label: 'All Claim Types', value: 'ALL' },
                  { label: 'Inpatient Care', value: 'Inpatient' },
                  { label: 'Outpatient Care', value: 'Outpatient' },
                  { label: 'Emergency Room', value: 'Emergency' },
                  { label: 'Pharmacy', value: 'Pharmacy' },
                  { label: 'Specialist Consultation', value: 'Specialist Consultation' },
                ],
              },
            ]}
          />
          <DensityToggle density={density} onChange={handleDensityChange} />
        </div>
      </div>

      {/* Claims Data Table */}
      <DataTable
        columns={columns}
        data={paginatedClaims}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        onSort={handleSort}
        onRowClick={(row) => navigate(`/claims/${row.id}`)}
        density={density}
        emptyTitle="No claims match your search criteria"
        emptyDescription="Try clearing filters or search terms to display available healthcare claims."
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={sortedClaims.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Create / Edit Claim Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingClaim ? `Edit Claim ${editingClaim.id}` : 'Create New Claim Intake'}
        subtitle="Ensure synthetic healthcare identifiers are used. DataGuard will run automated validation upon submission."
        maxWidth="max-w-2xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
            >
              {editingClaim ? 'Save Changes' : 'Create & Audit Claim'}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Synthetic Claimant Full Name"
              required
              error={formErrors.claimantName}
              helperText="e.g., Jonathan Sterling (demo record)"
              id="claimant-name"
            >
              <input
                id="claimant-name"
                type="text"
                value={formData.claimantName}
                onChange={(e) => handleFieldChange('claimantName', e.target.value)}
                aria-invalid={Boolean(formErrors.claimantName)}
                aria-describedby={formErrors.claimantName ? 'claimant-name-error' : undefined}
                placeholder="Enter patient full name"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </FormField>

            <FormField
              label="Insurance Policy Reference"
              required
              error={formErrors.policyNumber}
              helperText="e.g., POL-BCBS-9042"
              id="policy-number"
            >
              <input
                id="policy-number"
                type="text"
                value={formData.policyNumber}
                onChange={(e) => handleFieldChange('policyNumber', e.target.value)}
                aria-invalid={Boolean(formErrors.policyNumber)}
                aria-describedby={formErrors.policyNumber ? 'policy-number-error' : undefined}
                placeholder="POL-XXXX-0000"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-mono"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Hospital / Facility Name" required error={formErrors.hospitalName} id="hospital-name">
              <input
                id="hospital-name"
                type="text"
                value={formData.hospitalName}
                onChange={(e) => handleFieldChange('hospitalName', e.target.value)}
                aria-invalid={Boolean(formErrors.hospitalName)}
                aria-describedby={formErrors.hospitalName ? 'hospital-name-error' : undefined}
                placeholder="e.g., Metropolitan Memorial Hospital"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </FormField>

            <FormField label="Encounter / Claim Type">
              <select
                value={formData.claimType}
                onChange={(e) => handleFieldChange('claimType', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
              >
                <option value="Inpatient">Inpatient Care</option>
                <option value="Outpatient">Outpatient Surgery</option>
                <option value="Emergency">Emergency Room</option>
                <option value="Pharmacy">Pharmacy Dispensation</option>
                <option value="Specialist Consultation">Specialist Consultation</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              label="Claim Amount ($)"
              required
              error={formErrors.claimAmount}
              helperText="Total billed charge"
              id="claim-amount"
            >
              <input
                id="claim-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.claimAmount}
                onChange={(e) => handleFieldChange('claimAmount', e.target.value)}
                aria-invalid={Boolean(formErrors.claimAmount)}
                aria-describedby={formErrors.claimAmount ? 'claim-amount-error' : undefined}
                placeholder="0.00"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-semibold"
              />
            </FormField>

            <FormField label="Copay Obligation ($)" error={formErrors.copayAmount} id="copay-amount">
              <input
                id="copay-amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.copayAmount}
                onChange={(e) => handleFieldChange('copayAmount', e.target.value)}
                aria-invalid={Boolean(formErrors.copayAmount)}
                aria-describedby={formErrors.copayAmount ? 'copay-amount-error' : undefined}
                placeholder="50.00"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </FormField>

            <FormField label="Initial Status">
              <select
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
              >
                <option value="Pending Review">Pending Review</option>
                <option value="Under AI Audit">Under AI Audit</option>
                <option value="Approved">Approved</option>
                <option value="Correction Requested">Correction Requested</option>
                <option value="Rejected">Rejected</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Admission / Service Date" required error={formErrors.admissionDate} id="admission-date">
              <input
                id="admission-date"
                type="date"
                value={formData.admissionDate}
                onChange={(e) => handleFieldChange('admissionDate', e.target.value)}
                aria-invalid={Boolean(formErrors.admissionDate)}
                aria-describedby={formErrors.admissionDate ? 'admission-date-error' : undefined}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </FormField>

            <FormField label="Discharge Date" required error={formErrors.dischargeDate} id="discharge-date">
              <input
                id="discharge-date"
                type="date"
                value={formData.dischargeDate}
                onChange={(e) => handleFieldChange('dischargeDate', e.target.value)}
                aria-invalid={Boolean(formErrors.dischargeDate)}
                aria-describedby={formErrors.dischargeDate ? 'discharge-date-error' : undefined}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </FormField>
          </div>

          <FormField label="Clinical Encounter Description & Intake Summary">
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Summary of medical procedures, diagnostic notes, or hospital admission context..."
              className="w-full text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 resize-none"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}

