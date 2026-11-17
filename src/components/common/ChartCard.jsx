import React from 'react';
import { cn } from '../../utils/cn';

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}) {
  return (
    <div className={cn('bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle flex flex-col', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-navy tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-content-muted mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          <div className="flex items-center gap-2">
            {action}
          </div>
        )}
      </div>
      <div className="flex-1 w-full min-h-[220px]">
        {children}
      </div>
    </div>
  );
}
