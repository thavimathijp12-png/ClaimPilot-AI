import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import { FileText, CheckCircle2, AlertTriangle, AlertCircle, Sparkles, Shield, User } from 'lucide-react';
import { Avatar } from './Avatar';
import { cn } from '../../utils/cn';

export function ActivityTimeline({ activities = [], limit, className = '', onClaimClick }) {
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  const getCategoryConfig = (category, severity) => {
    switch (category) {
      case 'Approvals':
        return severity === 'success'
          ? { icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-700' }
          : severity === 'error'
          ? { icon: AlertCircle, bg: 'bg-rose-100 text-rose-700' }
          : { icon: AlertTriangle, bg: 'bg-amber-100 text-amber-700' };
      case 'Extraction':
        return { icon: Sparkles, bg: 'bg-teal-100 text-teal-700' };
      case 'DataGuard':
        return { icon: Shield, bg: 'bg-blue-100 text-blue-700' };
      case 'Documents':
        return { icon: FileText, bg: 'bg-purple-100 text-purple-700' };
      default:
        return { icon: User, bg: 'bg-slate-100 text-slate-700' };
    }
  };

  if (!displayActivities.length) {
    return (
      <div className="text-center py-6 text-xs text-slate-400">
        No recent activities recorded.
      </div>
    );
  }

  return (
    <div className={cn('relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200', className)}>
      {displayActivities.map((act) => {
        const config = getCategoryConfig(act.category, act.severity);
        const Icon = config.icon;

        return (
          <div key={act.id} className="relative group">
            {/* Timeline node */}
            <div
              className={cn(
                'absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white',
                config.bg
              )}
            >
              <Icon className="w-3 h-3 stroke-[2]" />
            </div>

            <div className="text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-800">{act.action}</span>
                <span className="text-[11px] text-slate-400 flex-shrink-0">
                  {formatRelativeTime(act.timestamp)}
                </span>
              </div>

              <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px] sm:text-xs">
                {act.description}
              </p>

              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Avatar
                    src={act.userAvatar}
                    name={act.userName}
                    role={act.userRole}
                    size="xs"
                    className="w-4 h-4 text-[7px]"
                  />
                  {act.userName}
                </span>
                <span>•</span>
                <span>{act.userRole}</span>
                {act.claimId && act.claimId !== 'SYSTEM' && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => onClaimClick && onClaimClick(act.claimId)}
                      className="text-primary-600 font-semibold hover:underline"
                    >
                      {act.claimId}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

