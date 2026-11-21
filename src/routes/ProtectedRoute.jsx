import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();
  const toast = useToast();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization if restricted to specific roles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoleCode = (currentUser?.roleCode || '').toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRoleCode);

    if (!isAllowed) {
      // Determine destination based on user's legitimate role
      const fallbackPath =
        userRoleCode === 'admin'
          ? '/admin/dashboard'
          : userRoleCode === 'operator'
            ? '/operator/dashboard'
            : userRoleCode === 'reviewer'
              ? '/reviewer/dashboard'
              : '/dashboard';

      // Prevent redirect loop if already on fallbackPath
      if (location.pathname !== fallbackPath) {
        toast.warning(
          'Restricted Area',
          `Your role (${currentUser?.role || 'User'}) does not have clearance for ${location.pathname}. Redirected to your authorized dashboard.`
        );
        return <Navigate to={fallbackPath} replace />;
      }
    }
  }

  return children;
}
