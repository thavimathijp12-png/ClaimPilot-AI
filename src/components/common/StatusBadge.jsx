import React from 'react';
import { cn } from '../../utils/cn';

export function StatusBadge({ status, size = 'md', showDot = true, className = '' }) {
  const norm = (status || '').toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (norm.includes('approved') || norm === 'verified' || norm === 'valid') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (norm.includes('pending') || norm === 'in review' || norm === 'info') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    dotColor = 'bg-blue-500';
  } else if (norm.includes('audit') || norm === 'extracted' || norm === 'healthy') {
    styles = 'bg-teal-50 text-teal-700 border-teal-200';
    dotColor = 'bg-teal-500';
  } else if (norm.includes('correction') || norm.includes('attention') || norm === 'warning' || norm === 'medium') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (norm.includes('rejected') || norm === 'critical' || norm === 'invalid' || norm === 'high') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500';
  } else if (norm === 'low') {
    styles = 'bg-slate-100 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size] || 'text-xs px-2.5 py-1';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border tracking-wide whitespace-nowrap',
        sizeClasses,
        styles,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)}
          aria-hidden="true"
        />
      )}
      <span>{status || 'Unknown'}</span>
    </span>
  );
}

