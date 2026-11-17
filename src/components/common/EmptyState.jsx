import React from 'react';
import { FileQuestion } from 'lucide-react';
import { cn } from '../../utils/cn';

export function EmptyState({
  icon: Icon = FileQuestion,
  title = 'No records found',
  description = 'Try adjusting your search or filter criteria to find what you are looking for.',
  action,
  actionLabel,
  className = '',
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center bg-white rounded-xl border border-slate-200 shadow-subtle', className)}>
      <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && actionLabel && (
        <button
          type="button"
          onClick={action}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
