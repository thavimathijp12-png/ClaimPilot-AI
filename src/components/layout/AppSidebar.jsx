import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Files,
  ShieldCheck,
  Sparkles,
  CheckSquare,
  Clock,
  BarChart3,
  Settings,
  HelpCircle,
  X,
  Activity,
} from 'lucide-react';
import { useClaims } from '../../context/ClaimContext';
import { cn } from '../../utils/cn';

export function AppSidebar({ isOpen, onClose }) {
  const { claims, dataGuardSummary } = useClaims();

  const pendingApprovalsCount = claims.filter(c => c.status === 'Pending Review').length;

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Claims', path: '/claims', icon: FileText, badge: claims.length },
        { name: 'Documents', path: '/documents', icon: Files },
        {
          name: 'DataGuard IQ',
          path: '/dataguard',
          icon: ShieldCheck,
          badge: `${dataGuardSummary.overallScore}%`,
          badgeColor: 'bg-teal-500/10 text-teal-300 border-teal-500/20'
        },
        { name: 'AI Extraction Review', path: '/extraction', icon: Sparkles },
      ],
    },
    {
      title: 'WORKFLOW',
      items: [
        {
          name: 'Approvals',
          path: '/approvals',
          icon: CheckSquare,
          badge: pendingApprovalsCount,
          badgeColor: 'bg-primary-500 text-white'
        },
        { name: 'Activity History', path: '/activity', icon: Clock },
      ],
    },
    {
      title: 'INSIGHTS',
      items: [
        { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings },
        { name: 'Help & Support', path: '/help', icon: HelpCircle },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-navy/70 z-40 lg:hidden backdrop-blur-xs animate-in fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy text-slate-300 flex flex-col transition-transform duration-200 ease-in-out border-r border-navy-light/40 shadow-xl lg:shadow-none lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-navy-light/40 bg-navy-dark/40">
          <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-teal-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white leading-none">
                ClaimPilot <span className="text-teal-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1 leading-none">
                Smarter Claims. Better Healthcare.
              </span>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-light transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title}>
              <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 tracking-wider">
                {group.title}
              </div>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group',
                          isActive
                            ? 'bg-primary-600 text-white shadow-sm font-semibold'
                            : 'text-slate-300 hover:bg-navy-light hover:text-white'
                        )
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0 stroke-[2] group-hover:scale-105 transition-transform" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold border',
                            item.badgeColor || 'bg-navy-dark text-slate-300 border-navy-light/60'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-navy-light/40 bg-navy-dark/30">
          <div className="p-2.5 rounded-lg bg-navy-light/50 border border-navy-light/40 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-white">DataGuard Engine</p>
              <p className="text-[10px] text-teal-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                Active • 24 Checks Online
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v1.0-prod</span>
          </div>
        </div>
      </aside>
    </>
  );
}

