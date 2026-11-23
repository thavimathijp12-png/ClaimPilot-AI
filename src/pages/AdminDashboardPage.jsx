import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useClaims } from '../context/ClaimContext';
import { useToast } from '../hooks/useToast';
import {
  Shield,
  Users,
  FileText,
  BarChart3,
  Settings,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  UserPlus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { ChartCard } from '../components/common/ChartCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { Avatar } from '../components/common/Avatar';
import { Modal } from '../components/common/Modal';
import { formatCurrency, formatRelativeTime } from '../utils/formatters';

export function AdminDashboardPage() {
  const { currentUser } = useAuth();
  const { claims = [], dataGuardSummary, refreshData } = useClaims();
  const navigate = useNavigate();
  const toast = useToast();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('operator');
  const [newUserDept, setNewUserDept] = useState('Intake & Document Operations');

  // Seeded / Managed Team Members (Operators & Reviewers)
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 'usr-op-02',
      name: 'Varshini',
      email: 'operator@claimpilot.ai',
      role: 'Claims Operator',
      roleCode: 'operator',
      avatar: '/operator-avatar.png',
      department: 'Intake & Document Operations',
      assignedQueue: 8,
      status: 'Active',
      lastActive: '5 mins ago',
      processedToday: 14,
    },
    {
      id: 'usr-rev-03',
      name: 'KirubhaShree',
      email: 'reviewer@claimpilot.ai',
      role: 'Claims Reviewer',
      roleCode: 'reviewer',
      avatar: '/reviewer-avatar.png',
      department: 'Clinical Adjudication & Audit',
      assignedQueue: 6,
      status: 'Active',
      lastActive: 'Just now',
      processedToday: 19,
    },
    {
      id: 'usr-op-04',
      name: 'David Alvarez',
      email: 'david.alvarez@claimpilot.ai',
      role: 'Claims Operator',
      roleCode: 'operator',
      avatar: null,
      department: 'Intake & Document Operations',
      assignedQueue: 4,
      status: 'Idle',
      lastActive: '42 mins ago',
      processedToday: 9,
    },
    {
      id: 'usr-rev-05',
      name: 'Dr. Priya Patel, MD',
      email: 'priya.patel@claimpilot.ai',
      role: 'Claims Reviewer',
      roleCode: 'reviewer',
      avatar: null,
      department: 'Clinical Adjudication & Audit',
      assignedQueue: 3,
      status: 'Active',
      lastActive: '12 mins ago',
      processedToday: 11,
    },
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('System Refreshed', 'Retrieved latest enterprise telemetry and queue metrics.');
    } catch {
      toast.error('Sync Failed', 'Could not refresh system telemetry.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.warning('Missing Fields', 'Please specify both name and email.');
      return;
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole === 'operator' ? 'Claims Operator' : 'Claims Reviewer',
      roleCode: newUserRole,
      avatar: newUserRole === 'operator' ? '/operator-avatar.png' : '/reviewer-avatar.png',
      department: newUserDept,
      assignedQueue: 0,
      status: 'Active',
      lastActive: 'Pending first sign-in',
      processedToday: 0,
    };

    setTeamMembers((prev) => [newUser, ...prev]);
    toast.success('Account Created', `Provisioned ${newUser.role} account for ${newUser.name}.`);
    setNewUserName('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  const handleToggleUserStatus = (userId) => {
    setTeamMembers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          toast.info('User Updated', `${u.name} status changed to ${newStatus}.`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Metrics
  const totalVolume = claims.reduce((acc, curr) => acc + (curr.claimAmount || 0), 0);
  const pendingCount = claims.filter(
    (c) => c.status === 'Pending Review' || c.status === 'Under AI Audit'
  ).length;
  const approvedCount = claims.filter((c) => c.status === 'Approved').length;
  const rejectedCount = claims.filter((c) => c.status === 'Rejected').length;

  const filteredTeam = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchRole = roleFilter === 'ALL' || m.roleCode === roleFilter.toLowerCase();
      const matchSearch =
        m.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        m.department.toLowerCase().includes(userSearch.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [teamMembers, roleFilter, userSearch]);

  const trendData = [
    { label: 'Mon', intake: 18, adjudicated: 15, flagged: 2 },
    { label: 'Tue', intake: 24, adjudicated: 22, flagged: 3 },
    { label: 'Wed', intake: 31, adjudicated: 28, flagged: 1 },
    { label: 'Thu', intake: 29, adjudicated: 27, flagged: 4 },
    { label: 'Fri', intake: 35, adjudicated: 33, flagged: 2 },
    { label: 'Sat', intake: 14, adjudicated: 12, flagged: 1 },
    { label: 'Sun', intake: 19, adjudicated: 18, flagged: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Admin Executive Profile Header Banner */}
      <div className="bg-gradient-to-r from-navy via-slate-900 to-navy-dark text-white p-6 rounded-2xl border border-navy-light/40 shadow-xl relative overflow-hidden">
        {/* Background glow & watermark */}
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-primary-600/10 to-transparent pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Shield className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex-shrink-0">
              <Avatar
                src={currentUser?.avatar || '/admin-profile.png'}
                name={currentUser?.name || 'Dr. Thavimathi'}
                role="Admin"
                size="lg"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-primary-400/60 shadow-lg object-cover"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 bg-primary-600 border border-white/20 text-[10px] font-extrabold uppercase rounded-md tracking-wider text-white shadow-sm">
                ADMIN
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Executive Operations & Governance
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  HIPAA Security Officer
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {currentUser?.name || 'Dr. Thavimathi'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {currentUser?.title || 'Chief Compliance & Operations Officer'} • System Administrator
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
              <span>{isRefreshing ? 'Syncing...' : 'Refresh Telemetry'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="px-3.5 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-all flex items-center gap-1.5 backdrop-blur-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>System Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Executive KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title="Enterprise Claims Volume"
          value={claims.length}
          subtitle={`Total Billed: ${formatCurrency(totalVolume)}`}
          icon={FileText}
          variant="default"
          onClick={() => navigate('/claims')}
        />
        <StatCard
          title="Staff In Service"
          value={teamMembers.filter((m) => m.status === 'Active').length}
          subtitle="Operators & Reviewers online"
          icon={Users}
          variant="teal"
          onClick={() => {}}
        />
        <StatCard
          title="Adjudication Backlog"
          value={pendingCount}
          subtitle="Clinical determination queue"
          icon={Clock}
          variant="amber"
          onClick={() => navigate('/approvals')}
        />
        <StatCard
          title="DataGuard Health Index"
          value={`${dataGuardSummary?.overallScore ?? 94}%`}
          subtitle="Automated checks passing"
          icon={Shield}
          variant="teal"
          onClick={() => navigate('/dataguard')}
        />
      </div>

      {/* User Management Module: Manage Operators & Reviewers */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-600" />
              <h2 className="text-base font-bold text-navy">User & Role Management</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                Admin Clearance
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervise Claim Operators and Claim Reviewers, manage access permissions, and track active workloads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search staff by name or email..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary-500 focus:bg-white w-48 sm:w-60"
              />
            </div>

            {/* Role Filter Buttons */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              {['ALL', 'OPERATOR', 'REVIEWER'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    roleFilter === r
                      ? 'bg-white text-primary-700 shadow-2xs'
                      : 'text-slate-600 hover:text-navy hover:bg-slate-200/50'
                  }`}
                >
                  {r === 'ALL' ? 'All Roles' : r === 'OPERATOR' ? 'Operators' : 'Reviewers'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3">Team Member</th>
                <th className="px-4 py-3">Role & Scope</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-center">Active Queue</th>
                <th className="px-4 py-3 text-center">Completed Today</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-xs text-slate-400">
                    No staff members match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTeam.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.avatar}
                          name={member.name}
                          role={member.role}
                          size="sm"
                          className="w-8 h-8 flex-shrink-0"
                        />
                        <div>
                          <p className="font-bold text-navy">{member.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          member.roleCode === 'operator'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-primary-50 text-primary-700 border-primary-200'
                        }`}
                      >
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{member.department}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold font-mono text-navy px-2 py-0.5 bg-slate-100 rounded-md">
                        {member.assignedQueue} claims
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-emerald-700">{member.processedToday}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : member.status === 'Idle'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            member.status === 'Active'
                              ? 'bg-emerald-500 animate-pulse'
                              : member.status === 'Idle'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          }`}
                        />
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(member.id)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors ${
                            member.status === 'Active'
                              ? 'text-slate-600 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          {member.status === 'Active' ? 'Suspend' : 'Activate'}
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

      {/* Operational Analytics & System Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 min-w-0">
          <ChartCard
            title="Weekly Enterprise Adjudication Velocity"
            subtitle="Intake volume vs clinical determinations over the last 7 days."
            action={
              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1"
              >
                <span>Analytics Center</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminIntake" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="adminAdjudicated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" allowDecimals={false} />
                <Tooltip
                  formatter={(val) => [Number(val).toLocaleString(), 'Claims']}
                  contentStyle={{
                    backgroundColor: '#10233F',
                    borderRadius: '8px',
                    color: '#FFF',
                    fontSize: '12px',
                    border: 'none',
                  }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Area type="monotone" dataKey="intake" name="Intake Volume" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#adminIntake)" />
                <Area type="monotone" dataKey="adjudicated" name="Adjudicated" stroke="#0D9488" strokeWidth={2} fillOpacity={1} fill="url(#adminAdjudicated)" />
                <Legend verticalAlign="bottom" height={28} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* System Health & Audit Monitor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                System Health & Audit
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                All Systems Operational
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">DataGuard Validation Engine</span>
                  <span className="text-[11px] font-bold text-teal-600">Active (24 Checks)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Average automated execution latency: 420ms per claim payload.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Database Persistence Pool</span>
                  <span className="text-[11px] font-bold text-emerald-600">MySQL 8.0 UP</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  HikariCP connection pool healthy with 0 connection leaks.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Audit Trail Integrity</span>
                  <span className="text-[11px] font-bold text-primary-600">100% Immutability</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Full HIPAA access logging across all clinical determination events.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/activity')}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <span>Inspect Full Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] text-slate-400 font-mono">Build v1.0-prod</span>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Provision New Enterprise Staff Member"
        subtitle="Create an authorized role-based account with strict departmental boundaries"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Dr. Jordan Lee, MD"
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enterprise Email
            </label>
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="e.g. jlee@claimpilot.ai"
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assigned System Role
            </label>
            <select
              value={newUserRole}
              onChange={(e) => {
                setNewUserRole(e.target.value);
                setNewUserDept(
                  e.target.value === 'operator'
                    ? 'Intake & Document Operations'
                    : 'Clinical Adjudication & Audit'
                );
              }}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500 bg-white"
            >
              <option value="operator">Claim Operator (Intake, Documents, OCR)</option>
              <option value="reviewer">Claim Reviewer (Clinical Adjudication, Approvals)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Department Assignment
            </label>
            <input
              type="text"
              value={newUserDept}
              onChange={(e) => setNewUserDept(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddUserModal(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm"
            >
              Provision Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
