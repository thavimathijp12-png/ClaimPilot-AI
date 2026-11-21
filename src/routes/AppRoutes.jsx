import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../hooks/useAuth';

import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { OperatorDashboardPage } from '../pages/OperatorDashboardPage';
import { ReviewerDashboardPage } from '../pages/ReviewerDashboardPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ClaimsPage } from '../pages/ClaimsPage';
import { ClaimDetailsPage } from '../pages/ClaimDetailsPage';
import { DocumentsPage } from '../pages/DocumentsPage';
import { DataGuardPage } from '../pages/DataGuardPage';
import { ExtractionReviewPage } from '../pages/ExtractionReviewPage';
import { ApprovalsPage } from '../pages/ApprovalsPage';
import { ActivityHistoryPage } from '../pages/ActivityHistoryPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { HelpPage } from '../pages/HelpPage';
import { NotFoundPage } from '../pages/NotFoundPage';

/**
 * Automatically routes the logged-in user to their designated role dashboard.
 */
function RoleDashboardRedirect() {
  const { currentUser } = useAuth();
  const roleCode = (currentUser?.roleCode || '').toLowerCase();

  if (roleCode === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (roleCode === 'operator') {
    return <Navigate to="/operator/dashboard" replace />;
  }
  if (roleCode === 'reviewer') {
    return <Navigate to="/reviewer/dashboard" replace />;
  }
  return <Navigate to="/admin/dashboard" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Application Routes inside AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleDashboardRedirect />} />
        <Route path="dashboard" element={<RoleDashboardRedirect />} />

        {/* Dedicated Role-Based Dashboards */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="operator/dashboard"
          element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <OperatorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="reviewer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['reviewer', 'admin']}>
              <ReviewerDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* General / Role-Guarded Subsections */}
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="claims/:id" element={<ClaimDetailsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route
          path="dataguard"
          element={
            <ProtectedRoute allowedRoles={['reviewer', 'admin']}>
              <DataGuardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="extraction"
          element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <ExtractionReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="approvals"
          element={
            <ProtectedRoute allowedRoles={['reviewer', 'admin']}>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route path="activity" element={<ActivityHistoryPage />} />
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'reviewer']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="help" element={<HelpPage />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
