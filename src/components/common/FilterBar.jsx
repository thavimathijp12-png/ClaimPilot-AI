import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

export function FilterBar({
  filters = [],
  onReset,
  hasActiveFilters = false,
  children,
  className = '',
}) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200/90 shadow-subtle', className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1 pl-1">
        <Filter className="w-3.5 h-3.5 text-slate-400" />
        <span>Filters</span>
      </div>

      {filters.map((filter, index) => (
        <div key={filter.id || index} className="flex items-center">
          <label htmlFor={`filter-${filter.id}`} className="sr-only">
            {filter.label}
          </label>
          <select
            id={`filter-${filter.id}`}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors cursor-pointer"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {children}

      {hasActiveFilters && onReset && (
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}
