import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Sliders,
  Shield,
  RotateCcw,
  Save,
  CheckCircle2,
  Lock,
  Smartphone,
  Eye,
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Avatar } from '../components/common/Avatar';
import Tabs from '../components/common/Tabs';

export function SettingsPage() {
  const { currentUser } = useAuth();
  const { resetToDefaults } = useClaims();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('profile');

  // Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileEmail, setProfileEmail] = useState(currentUser?.email || '');
  const [profileDepartment, setProfileDepartment] = useState(currentUser?.department || '');

  // Preferences State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [qualityWarningAlerts, setQualityWarningAlerts] = useState(true);
  const [auditEventNotifications, setAuditEventNotifications] = useState(false);
  const [compactTables, setCompactTables] = useState(false);

  // Reset Modal
  const [showResetModal, setShowResetModal] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast.success('Profile Saved', 'Your user preferences have been updated in local storage.');
  };

  const handleResetData = () => {
    resetToDefaults();
    toast.warning('Demo Reset Complete', 'All claims, documents, extractions and logs restored to initial demo state.');
    setShowResetModal(false);
  };

  const settingsTabs = [
    { id: 'profile', label: 'User Profile', icon: User },
    { id: 'notifications', label: 'Notifications & Alerts', icon: Bell },
    { id: 'security', label: 'Security & Roles', icon: Shield },
    { id: 'demo', label: 'Demo Data Management', icon: Sliders },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Governance"
        description="Configure user profile, notification thresholds, compliance audit configurations, and demo state management."
      />

      {/* Settings Navigation Tabs */}
      <Tabs
        tabs={settingsTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
      />

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-subtle max-w-3xl space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <Avatar
              src={currentUser?.avatar}
              name={currentUser?.name}
              role={currentUser?.role}
              size="xl"
              className="w-16 h-16 border-2 border-primary-500/20 shadow-sm"
            />
            <div>
              <h2 className="text-base font-bold text-navy">{currentUser?.name}</h2>
              <p className="text-xs text-slate-500">{currentUser?.title} • {currentUser?.department}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 text-[10px] font-bold bg-primary-50 text-primary-700 rounded-full border border-primary-200">
                Current Role: {currentUser?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enterprise Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical / Operations Department</label>
              <input
                type="text"
                value={profileDepartment}
                onChange={(e) => setProfileDepartment(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-subtle max-w-3xl space-y-5">
          <h2 className="text-sm font-bold text-navy">Notification Dispatch Rules</h2>
          <p className="text-xs text-content-muted">
            Configure how and when ClaimPilot sends real-time clinical alerts.
          </p>

          <div className="space-y-4 pt-2">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-xs font-bold text-navy block">New Claim Ingestion Digest</span>
                <span className="text-[11px] text-slate-500">Receive batch summary when new electronic claims enter the triage pool.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={qualityWarningAlerts}
                onChange={(e) => setQualityWarningAlerts(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-xs font-bold text-navy block">DataGuard Critical Quality Discrepancies</span>
                <span className="text-[11px] text-slate-500">Immediate high-priority alert for missing physician signatures or ledger variances.</span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                checked={auditEventNotifications}
                onChange={(e) => setAuditEventNotifications(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-xs font-bold text-navy block">Adjudication Decision Audit Trail Broadcast</span>
                <span className="text-[11px] text-slate-500">Broadcast notification when a peer reviewer approves or rejects an assigned claim.</span>
              </div>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => toast.success('Preferences Saved', 'Notification thresholds updated.')}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
            >
              Update Preferences
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Roles */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-subtle max-w-3xl space-y-6">
          <div>
            <h2 className="text-sm font-bold text-navy">Role-Based Access Control (RBAC) Matrix</h2>
            <p className="text-xs text-content-muted mt-0.5">Permissions matrix configured for enterprise clinical compliance.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">Capability / Feature</th>
                  <th className="p-3 text-center">Admin</th>
                  <th className="p-3 text-center">Claims Operator</th>
                  <th className="p-3 text-center">Claims Reviewer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-medium text-slate-800">Claim Ingestion & Document Upload</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">AI Extraction OCR Field Editing</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-slate-300">—</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">Final Adjudication (Approve / Reject)</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-slate-300">—</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-slate-800">System Governance & Audit Purge</td>
                  <td className="p-3 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3 text-center text-slate-300">—</td>
                  <td className="p-3 text-center text-slate-300">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-bold text-navy block">HIPAA Two-Factor Authentication</span>
                <span className="text-[11px] text-slate-500">MFA enforcement enabled across all clinical accounts.</span>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
              Active & Compliant
            </span>
          </div>
        </div>
      )}

      {/* Tab 4: Demo Data Management */}
      {activeTab === 'demo' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-subtle max-w-3xl space-y-6">
          <div>
            <h2 className="text-sm font-bold text-navy">Demo Data & Local Storage Governance</h2>
            <p className="text-xs text-content-muted mt-0.5">
              Manage local browser persistence. You can reset all records back to pristine synthetic demo state at any time.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Reset Application to Default Mock Dataset</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              This will restore all 8 synthetic claims, baseline hospital bills, DataGuard audits, and activity histories to their initial seed state, clearing any locally created or edited claims.
            </p>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors"
            >
              Reset All Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={handleResetData}
        title="Reset Demo Records?"
        message="This will reset all claims, documents, OCR extractions and audit logs back to factory defaults."
        confirmLabel="Confirm Factory Reset"
        variant="warning"
      />
    </div>
  );
}

