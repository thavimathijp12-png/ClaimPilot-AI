import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel = 'vs last month',
  subtitle,
  variant = 'default',
  className = '',
  onClick,
}) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;

  const variantStyles = {
    default: 'border-slate-200/80 bg-white hover:border-slate-300',
    primary: 'border-primary-100 bg-gradient-to-br from-white to-primary-50/30',
    teal: 'border-teal-100 bg-gradient-to-br from-white to-teal-50/30',
    amber: 'border-amber-100 bg-gradient-to-br from-white to-amber-50/30',
    rose: 'border-rose-100 bg-gradient-to-br from-white to-rose-50/30',
  }[variant] || 'border-slate-200/80 bg-white';

  const iconColor = {
    default: 'text-navy bg-slate-100',
    primary: 'text-primary-600 bg-primary-50',
    teal: 'text-teal-600 bg-teal-50',
    amber: 'text-amber-600 bg-amber-50',
    rose: 'text-rose-600 bg-rose-50',
  }[variant] || 'text-navy bg-slate-100';

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-5 rounded-xl border shadow-subtle card-hover transition-all relative overflow-hidden',
        variantStyles,
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-content-muted uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', iconColor)}>
            <Icon className="w-5 h-5 stroke-[1.75]" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">{value}</span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-xs">
        {trend !== undefined && trend !== null && (
          <span
            className={cn(
              'inline-flex items-center font-semibold rounded px-1.5 py-0.5',
              isPositive && 'text-emerald-700 bg-emerald-50',
              isNegative && 'text-rose-700 bg-rose-50',
              isNeutral && 'text-slate-600 bg-slate-50'
            )}
          >
            {isPositive && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
            {isNegative && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {isNeutral && <Minus className="w-3.5 h-3.5 mr-0.5" />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="text-content-muted truncate">{subtitle || trendLabel}</span>
      </div>
    </div>
  );
}

