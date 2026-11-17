import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  Clock,
  Search,
  Filter,
  Download,
  Shield,
  FileText,
  User,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { SearchInput } from '../components/common/SearchInput';
import { FilterBar } from '../components/common/FilterBar';
import { ActivityTimeline } from '../components/common/ActivityTimeline';
import { formatDate } from '../utils/formatters';
import { exportToCSV } from '../services/exportService';

export function ActivityHistoryPage() {
  const { activities } = useClaims();
  const toast = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        act.action.toLowerCase().includes(term) ||
        act.description.toLowerCase().includes(term) ||
        act.userName.toLowerCase().includes(term) ||
        (act.claimId && act.claimId.toLowerCase().includes(term));

      const matchesCategory = categoryFilter === 'ALL' || act.category === categoryFilter;
      const matchesSeverity = severityFilter === 'ALL' || act.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [activities, searchQuery, categoryFilter, severityFilter]);

  const handleExportCSV = () => {
    const rows = filteredActivities.map(a => ({
      'Event ID': a.id,
      'Timestamp': a.timestamp,
      'User': a.userName,
      'Role': a.userRole,
      'Category': a.category,
      'Action': a.action,
      'Claim ID': a.claimId,
      'Description': a.description,
      'Severity': a.severity,
    }));
    exportToCSV('ClaimPilot_Audit_Activity_Log', rows);
    toast.info('Audit Log Exported', 'Activity history downloaded in CSV format.');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('ALL');
    setSeverityFilter('ALL');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit & Activity History Log"
        badge={
          <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-full flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            Immutable Audit Trail
          </span>
        }
        description="Comprehensive compliance ledger recording all user actions, claim updates, document uploads, DataGuard quality evaluations, and human adjudication decisions."
        actions={
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail (CSV)</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/90 shadow-subtle">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter by action, user, claim ID, or keyword..."
          className="max-w-md"
        />

        <FilterBar
          hasActiveFilters={categoryFilter !== 'ALL' || severityFilter !== 'ALL' || Boolean(searchQuery)}
          onReset={handleResetFilters}
          filters={[
            {
              id: 'category',
              label: 'Category',
              value: categoryFilter,
              onChange: setCategoryFilter,
              options: [
                { label: 'All Categories', value: 'ALL' },
                { label: 'Adjudication Approvals', value: 'Approvals' },
                { label: 'Claims Intake', value: 'Claims' },
                { label: 'Document Operations', value: 'Documents' },
                { label: 'DataGuard IQ', value: 'DataGuard' },
                { label: 'AI Extraction', value: 'Extraction' },
                { label: 'System Compliance', value: 'System' },
              ],
            },
            {
              id: 'severity',
              label: 'Severity',
              value: severityFilter,
              onChange: setSeverityFilter,
              options: [
                { label: 'All Severities', value: 'ALL' },
                { label: 'Success Events', value: 'success' },
                { label: 'Informational', value: 'info' },
                { label: 'Warnings', value: 'warning' },
                { label: 'Errors / Denials', value: 'error' },
              ],
            },
          ]}
        />
      </div>

      {/* Main Activity Timeline Container */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-subtle p-6">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <span className="text-xs font-bold text-navy uppercase tracking-wider">
            Recorded Activity Timeline ({filteredActivities.length} Events)
          </span>
          <span className="text-xs text-slate-400">
            Current system time: {formatDate(new Date().toISOString(), true)}
          </span>
        </div>

        <ActivityTimeline
          activities={filteredActivities}
          onClaimClick={(claimId) => navigate(`/claims/${claimId}`)}
        />
      </div>
    </div>
  );
}
