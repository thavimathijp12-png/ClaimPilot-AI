import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const routeNameMap = {
    dashboard: 'Dashboard',
    claims: 'Claims Management',
    documents: 'Document Repository',
    dataguard: 'DataGuard IQ',
    extraction: 'AI Extraction Review',
    approvals: 'Adjudication Approvals',
    activity: 'Audit & Activity Log',
    reports: 'Reports & Analytics',
    settings: 'System Settings',
    help: 'Knowledge Base & Help',
    new: 'New Claim Registration',
  };

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500">
      <Link
        to="/dashboard"
        className="flex items-center text-slate-400 hover:text-primary-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNameMap[segment] || segment.toUpperCase();

        return (
          <React.Fragment key={routeTo}>
            <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-800 truncate max-w-[200px]" aria-current="page">
                {displayName}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="hover:text-primary-600 transition-colors truncate max-w-[150px]"
              >
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
