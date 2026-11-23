export function getStatusBadgeConfig(status) {
  switch (status) {
    case 'APPROVED': return { label: 'Approved', color: 'success', bg: 'bg-emerald-500/10 text-emerald-400' };
    case 'REJECTED': return { label: 'Rejected', color: 'error', bg: 'bg-rose-500/10 text-rose-400' };
    case 'PENDING_REVIEW': return { label: 'Pending Review', color: 'warning', bg: 'bg-amber-500/10 text-amber-400' };
    case 'UNDER_AI_AUDIT': return { label: 'AI Auditing', color: 'info', bg: 'bg-sky-500/10 text-sky-400' };
    default: return { label: status || 'Unknown', color: 'neutral', bg: 'bg-slate-500/10 text-slate-400' };
  }
}
