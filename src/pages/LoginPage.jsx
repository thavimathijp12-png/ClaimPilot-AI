import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Clock,
  X,
  Shield,
  Check,
  Minus,
  Sparkles,
  Stethoscope,
  FolderOpen,
} from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { cn } from '../utils/cn';
import { formatRelativeTime } from '../utils/formatters';

function readPreference(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Unable to read browser preference "${key}":`, error);
    return null;
  }
}

function writePreference(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Unable to save browser preference "${key}":`, error);
    return false;
  }
}

function removePreference(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Unable to remove browser preference "${key}":`, error);
    return false;
  }
}

export function LoginPage() {
  const { login, demoAccounts = [] } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Active selected role for login experience (admin, operator, reviewer)
  const [selectedRoleCode, setSelectedRoleCode] = useState('admin');

  // Input fields
  const [email, setEmail] = useState(() => {
    const saved = readPreference('claimpilot_remembered_email');
    return saved || 'admin@claimpilot.ai';
  });
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(readPreference('claimpilot_remembered_email')));
  const [isLoading, setIsLoading] = useState(false);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Define the 3 distinct roles with full visuals & credentials
  const roleCards = [
    {
      code: 'admin',
      name: 'System Admin',
      persona: 'Dr. Thavimathi',
      email: 'admin@claimpilot.ai',
      password: 'admin123',
      avatar: '/admin-profile.png',
      illustration: '/role-admin.svg',
      badgeColor: 'bg-navy-dark text-white border-navy-light/40',
      activeBorder: 'border-primary-600 ring-2 ring-primary-500/20 bg-primary-50/20',
      accentColor: 'text-primary-600',
      tagline: 'System Governance & Staff Oversight',
      description: 'Supervises staff, manages users, configures system, and inspects immutable HIPAA audit trails.',
      dashboardPath: '/admin/dashboard',
      dashboardLabel: 'Admin Dashboard',
    },
    {
      code: 'operator',
      name: 'Claim Operator',
      persona: 'Varshini',
      email: 'operator@claimpilot.ai',
      password: 'operator123',
      avatar: '/operator-avatar.png',
      illustration: '/role-operator.svg',
      badgeColor: 'bg-teal-700 text-white border-teal-600',
      activeBorder: 'border-teal-600 ring-2 ring-teal-500/20 bg-teal-50/20',
      accentColor: 'text-teal-600',
      tagline: 'Claim Intake & Document Ingestion',
      description: 'Ingests patient claims, uploads medical bills, verifies AI OCR extractions, and tracks workloads.',
      dashboardPath: '/operator/dashboard',
      dashboardLabel: 'Operator Dashboard',
    },
    {
      code: 'reviewer',
      name: 'Claim Reviewer',
      persona: 'KirubhaShree',
      email: 'reviewer@claimpilot.ai',
      password: 'reviewer123',
      avatar: '/reviewer-avatar.png',
      illustration: '/role-reviewer.svg',
      badgeColor: 'bg-blue-700 text-white border-blue-600',
      activeBorder: 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20',
      accentColor: 'text-blue-600',
      tagline: 'Clinical Adjudication & Audit',
      description: 'Adjudicates medical claims, audits ICD-10/CPT codes, resolves DataGuard IQ flags, and approves payout.',
      dashboardPath: '/reviewer/dashboard',
      dashboardLabel: 'Reviewer Dashboard',
    },
  ];

  const currentRole = roleCards.find((r) => r.code === selectedRoleCode) || roleCards[0];

  const handleSelectRole = (role) => {
    setSelectedRoleCode(role.code);
    setEmail(role.email);
    setPassword(role.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Missing Credentials', 'Please enter both enterprise email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password, rememberMe);

      if (rememberMe) {
        writePreference('claimpilot_remembered_email', user.email);
        writePreference(
          'claimpilot_last_session',
          JSON.stringify({
            name: user.name,
            email: user.email,
            role: user.role,
            roleCode: user.roleCode,
            timestamp: new Date().toISOString(),
          })
        );
      } else {
        removePreference('claimpilot_remembered_email');
        removePreference('claimpilot_last_session');
      }

      const destination = user.dashboardPath ||
        (user.roleCode === 'admin'
          ? '/admin/dashboard'
          : user.roleCode === 'operator'
            ? '/operator/dashboard'
            : user.roleCode === 'reviewer'
              ? '/reviewer/dashboard'
              : '/dashboard');

      toast.success('Authentication Succeeded', `Signed in as ${user.name} (${user.role}). Redirecting...`);
      navigate(destination);
    } catch (err) {
      toast.error('Authentication Failed', err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.warning('Email Required', 'Please enter your registered email address.');
      return;
    }
    setForgotSubmitted(true);
    toast.info('Password Assistance', 'Password reset instructions have been forwarded to the system administrator.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary-50/70 to-transparent pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-500 text-white shadow-elevated mb-3">
          <Activity className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight">
          ClaimPilot <span className="text-teal-600">AI</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
          Intelligent Healthcare Claims Adjudication & Role-Based Workspaces
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-2xl border border-slate-200">
          {/* Section 1: Choose Your Role Experience */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-primary-600" />
                Select Portal Role
              </span>
              <button
                type="button"
                onClick={() => setShowMatrixModal(true)}
                className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                <span>Permissions Matrix</span>
              </button>
            </div>

            {/* 3 Prominent Role Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roleCards.map((role) => {
                const isSelected = selectedRoleCode === role.code;
                return (
                  <button
                    key={role.code}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={cn(
                      'p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group focus:outline-none',
                      isSelected
                        ? role.activeBorder
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="relative">
                          <Avatar
                            src={role.avatar}
                            name={role.persona}
                            role={role.name}
                            size="md"
                            className="w-10 h-10 rounded-xl border border-slate-200 shadow-2xs object-cover"
                          />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide border',
                            role.badgeColor
                          )}
                        >
                          {role.code}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-navy group-hover:text-primary-600 transition-colors">
                        {role.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        {role.persona}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100/80">
                      <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                        {role.tagline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Selected Role Illustration & Identity Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-primary-50/30 border border-slate-200/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200 shadow-xs flex-shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src={currentRole.illustration}
                  alt={currentRole.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-navy truncate">{currentRole.name} Sign In</h2>
                  <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-primary-100 text-primary-700">
                    {currentRole.dashboardLabel}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                  {currentRole.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEmail(currentRole.email);
                setPassword(currentRole.password);
                toast.info('Credentials Loaded', `Pre-filled ${currentRole.name} credentials.`);
              }}
              title="Pre-fill demo credentials"
              className="px-2.5 py-1 text-[11px] font-bold text-primary-700 bg-white hover:bg-primary-50 border border-primary-200 rounded-lg shadow-2xs whitespace-nowrap flex-shrink-0"
            >
              Fill {currentRole.code.toUpperCase()}
            </button>
          </div>

          {/* Section 3: Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enterprise Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@claimpilot.ai"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50/50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600">Keep me signed in</span>
              </label>

              <span className="text-[11px] text-slate-400">
                Destination: <span className="font-semibold text-navy">{currentRole.dashboardLabel}</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating with Backend...</span>
              ) : (
                <>
                  <span>Sign In as {currentRole.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security badge footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Role-Based Access Control Enforced • HIPAA Audit Logging Active</span>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-dropdown border border-slate-200">
            <h3 className="text-base font-bold text-navy">Password Assistance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your corporate email address to receive password reset instructions.
            </p>
            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@claimpilot.ai"
                required
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500"
              />
              {forgotSubmitted && (
                <p className="text-xs text-emerald-600 font-medium">
                  Password reset request registered with your system administrator.
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Capabilities & Permissions Matrix Modal */}
      <Modal
        isOpen={showMatrixModal}
        onClose={() => setShowMatrixModal(false)}
        title="Enterprise Role Permissions & Capability Matrix"
        subtitle="Role-Based Access Control (RBAC) governance for ClaimPilot AI healthcare processing"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            ClaimPilot AI strictly segregates responsibilities across administrative governance, intake operations, and clinical adjudication to ensure compliance and clinical integrity.
          </p>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">System Capability</th>
                  <th className="py-2.5 px-3 text-center">Claim Operator</th>
                  <th className="py-2.5 px-3 text-center">Claim Reviewer</th>
                  <th className="py-2.5 px-3 text-center">System Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { name: 'Claims Intake & Patient Demographics Entry', op: true, rev: false, adm: true },
                  { name: 'Document Center & Batch Invoice Upload', op: true, rev: true, adm: true },
                  { name: 'AI OCR Extraction Verification', op: true, rev: false, adm: true },
                  { name: 'Clinical Adjudication (Approve / Reject)', op: false, rev: true, adm: true },
                  { name: 'ICD-10 & CPT Medical Audit Overrides', op: false, rev: true, adm: true },
                  { name: 'DataGuard IQ Rule Inspection', op: false, rev: true, adm: true },
                  { name: 'User Management (Manage Operators & Reviewers)', op: false, rev: false, adm: true },
                  { name: 'System Telemetry, Settings & Audit Logs', op: false, rev: false, adm: true },
                ].map((row, idx) => (
                  <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}>
                    <td className="py-2 px-3 font-medium text-slate-800">{row.name}</td>
                    <td className="py-2 px-3 text-center">
                      {row.op ? <Check className="w-4 h-4 text-teal-600 mx-auto" /> : <Minus className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.rev ? <Check className="w-4 h-4 text-blue-600 mx-auto" /> : <Minus className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {row.adm ? <Check className="w-4 h-4 text-primary-600 mx-auto" /> : <Minus className="w-3.5 h-3.5 text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowMatrixModal(false)}
              className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm"
            >
              Close Matrix
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
