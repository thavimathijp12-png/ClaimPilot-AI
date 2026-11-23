import React from 'react';
import { cn } from '../../utils/cn';

export function PageHeader({
  title,
  description,
  badge,
  actions,
  children,
  className = '',
}) {
  return (
    <div className={cn('mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200/80', className)}>
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-content-muted max-w-2xl leading-normal">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center flex-wrap gap-2.5">
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

