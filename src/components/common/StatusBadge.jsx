import React from 'react';
import { cn } from '../../utils/cn';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  AlertCircle,
  Activity,
} from 'lucide-react';

/**
 * Enhanced StatusBadge component for healthcare claims, validation flags, and audit statuses.
 * Supports pulsing live status indicators, icon integration, and multiple sizing scales.
 */
export function StatusBadge({
  status,
  size = 'md',
  showDot = true,
  showIcon = false,
  pulse = false,
  className = '',
}) {
  const norm = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let pingColor = 'bg-slate-300';
  let Icon = Activity;

  if (norm.includes('approved') || norm === 'verified' || norm === 'valid') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
    pingColor = 'bg-emerald-400';
    Icon = CheckCircle2;
  } else if (norm.includes('pending') || norm === 'in review' || norm === 'info') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
    dotColor = 'bg-blue-500';
    pingColor = 'bg-blue-400';
    Icon = Clock;
  } else if (norm.includes('audit') || norm === 'extracted' || norm === 'healthy') {
    styles = 'bg-teal-50 text-teal-700 border-teal-200/80';
    dotColor = 'bg-teal-500';
    pingColor = 'bg-teal-400';
    Icon = ShieldCheck;
  } else if (
    norm.includes('correction') ||
    norm.includes('attention') ||
    norm === 'warning' ||
    norm === 'medium'
  ) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotColor = 'bg-amber-500';
    pingColor = 'bg-amber-400';
    Icon = AlertTriangle;
  } else if (
    norm.includes('rejected') ||
    norm === 'critical' ||
    norm === 'invalid' ||
    norm === 'high'
  ) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500';
    pingColor = 'bg-rose-400';
    Icon = XCircle;
  } else if (norm === 'low') {
    styles = 'bg-slate-100 text-slate-600 border-slate-200/80';
    dotColor = 'bg-slate-400';
    pingColor = 'bg-slate-300';
    Icon = AlertCircle;
  }

  // Active status auto-pulsing if pending or in review
  const shouldPulse =
    pulse || norm.includes('pending') || norm === 'in review';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size] || 'text-xs px-2.5 py-1 gap-1.5';

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size] || 'w-3.5 h-3.5';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border tracking-wide whitespace-nowrap shadow-xs select-none',
        sizeClasses,
        styles,
        className
      )}
    >
      {showIcon ? (
        <Icon className={cn('flex-shrink-0', iconSizes)} aria-hidden="true" />
      ) : showDot ? (
        <span className="relative flex h-2 w-2 flex-shrink-0 items-center justify-center">
          {shouldPulse && (
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                pingColor
              )}
            />
          )}
          <span
            className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColor)}
            aria-hidden="true"
          />
        </span>
      ) : null}
      <span>{status || 'Unknown'}</span>
    </span>
  );
}

export default StatusBadge;
