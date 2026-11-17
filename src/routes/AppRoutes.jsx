import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

import { LoginPage } from '../pages/LoginPage';
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
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="claims" element={<ClaimsPage />} />
        <Route path="claims/:id" element={<ClaimDetailsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="dataguard" element={<DataGuardPage />} />
        <Route path="extraction" element={<ExtractionReviewPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="activity" element={<ActivityHistoryPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

