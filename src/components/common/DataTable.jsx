import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

export function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  sortColumn,
  sortDirection,
  onSort,
  onRowClick,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'No data matching your current filters or criteria.',
  className = '',
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12">
        <LoadingSpinner message="Retrieving healthcare claim records..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-content-muted font-semibold uppercase tracking-wider">
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const canSort = col.sortable && onSort;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 select-none',
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                      canSort && 'cursor-pointer hover:text-navy transition-colors',
                      col.className
                    )}
                    onClick={() => canSort && onSort(col.key)}
                  >
                    <div className={cn(
                      'inline-flex items-center gap-1.5',
                      col.align === 'right' && 'flex-row-reverse'
                    )}>
                      <span>{col.header}</span>
                      {canSort && (
                        <span className="text-slate-400">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-primary-600" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-primary-600" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, index) => {
              const rowKey = row[keyField] || index;
              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-slate-50/80' : 'hover:bg-slate-50/40',
                    index % 2 === 1 ? 'bg-slate-50/20' : 'bg-white'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={`${rowKey}-${col.key}`}
                      className={cn(
                        'px-4 py-3 text-slate-700 whitespace-nowrap',
                        col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left',
                        col.cellClassName
                      )}
                    >
                      {col.render ? col.render(row[col.key], row, index) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

