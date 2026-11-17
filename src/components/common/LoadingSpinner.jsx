import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function LoadingSpinner({ size = 'md', message = '', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-4 gap-2 text-slate-500', className)} role="status">
      <Loader2 className={cn('animate-spin text-primary-600', sizeMap[size] || sizeMap.md)} />
      {message && <p className="text-xs font-medium text-slate-600">{message}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
