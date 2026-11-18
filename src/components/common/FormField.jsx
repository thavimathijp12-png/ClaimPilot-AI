import React from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function FormField({
  label,
  id,
  error,
  helperText,
  required = false,
  tooltip,
  children,
  className = '',
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-semibold text-slate-700 flex items-center gap-1">
            {label}
            {required && <span className="text-rose-500 font-bold">*</span>}
          </label>
          {tooltip && (
            <span
              className="text-slate-400 hover:text-slate-600 transition-colors cursor-help"
              title={tooltip}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      )}
      {children}
      {error && (
        <p
          id={id ? `${id}-error` : undefined}
          role="alert"
          className="text-[11px] text-rose-600 font-medium animate-in fade-in duration-150"
        >
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="text-[11px] text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

