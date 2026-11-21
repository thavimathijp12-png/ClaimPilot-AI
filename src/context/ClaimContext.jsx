import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';
import { INITIAL_CLAIMS } from '../data/mockClaims';
import { INITIAL_DOCUMENTS } from '../data/mockDocuments';
import { INITIAL_ACTIVITIES } from '../data/mockActivity';
import { CLAIM_VALIDATION_RULES, DATAGUARD_SYSTEM_OVERVIEW } from '../data/mockDataGuard';
import { MOCK_EXTRACTION_SETS } from '../data/mockExtractions';
import { storage } from '../services/storageService';

const ClaimContext = createContext(null);

export function ClaimProvider({ children }) {
  const { currentUser, isAuthenticated } = useAuth();

  const [claims, setClaims] = useState(() => storage.get('claims', INITIAL_CLAIMS) || INITIAL_CLAIMS);
  const [documents, setDocuments] = useState(() => storage.get('documents', INITIAL_DOCUMENTS) || INITIAL_DOCUMENTS);
  const [activities, setActivities] = useState(() => storage.get('activities', INITIAL_ACTIVITIES) || INITIAL_ACTIVITIES);
  const [validations, setValidations] = useState(() => storage.get('validations', CLAIM_VALIDATION_RULES) || CLAIM_VALIDATION_RULES);
  const [extractions, setExtractions] = useState(() => storage.get('extractions', MOCK_EXTRACTION_SETS) || MOCK_EXTRACTION_SETS);
  const [dataGuardSummary, setDataGuardSummary] = useState(() => storage.get('dataguard_summary', DATAGUARD_SYSTEM_OVERVIEW) || DATAGUARD_SYSTEM_OVERVIEW);
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [claimReport, setClaimReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const unwrap = (response) => response?.data ?? response;

  // Persist state updates to storage
  useEffect(() => {
    if (claims && claims.length > 0) storage.set('claims', claims);
  }, [claims]);

  useEffect(() => {
    if (documents && documents.length > 0) storage.set('documents', documents);
  }, [documents]);

  useEffect(() => {
    if (activities && activities.length > 0) storage.set('activities', activities);
  }, [activities]);

  const logActivity = (event) => {
    const newActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'Authorized User',
      userRole: currentUser?.role || 'Administrator',
      category: event.category || 'Claims',
      action: event.action || 'System Update',
      description: event.description || '',
      severity: event.severity || 'info',
      claimId: event.claimId || null,
    };
    setActivities((prev) => [newActivity, ...(prev || [])]);
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const claimResponse = await apiClient.get('/claims').catch(() => null);
      const claimList = unwrap(claimResponse);
      if (Array.isArray(claimList) && claimList.length > 0) {
        setClaims(claimList);

        const documentResponses = await Promise.all(
          claimList.map((claim) =>
            apiClient.get(`/claims/${encodeURIComponent(claim.id)}/documents`).catch(() => null)
          )
        );
        const fetchedDocs = documentResponses.flatMap((response) => unwrap(response) || []);
        if (fetchedDocs.length > 0) setDocuments(fetchedDocs);

        const validationEntries = await Promise.all(
          claimList.map(async (claim) => {
            try {
              const response = await apiClient.get(`/claims/${encodeURIComponent(claim.id)}/validations`);
              const runs = unwrap(response) || [];
              return [claim.id, runs[0] || null];
            } catch {
              return [claim.id, null];
            }
          })
        );
        const validMap = Object.fromEntries(validationEntries.filter(([, v]) => v !== null));
        if (Object.keys(validMap).length > 0) {
          setValidations((prev) => ({ ...prev, ...validMap }));
        }
      }

      try {
        const auditResponse = await apiClient.get('/audit?page=0&size=100');
        const auditPage = unwrap(auditResponse);
        if (auditPage?.content?.length > 0) {
          setActivities(auditPage.content.map((event) => ({
            id: event.id,
            timestamp: event.occurredAt,
            action: event.action,
            description: event.details || event.action,
            userName: event.actorName,
            userRole: event.resourceType,
            category: event.resourceType === 'CLAIM' ? 'Claims'
              : event.resourceType === 'DOCUMENT' ? 'Documents'
              : event.resourceType === 'DATA_GUARD' ? 'DataGuard'
              : event.resourceType === 'APPROVAL' ? 'Approvals'
              : 'System',
            claimId: event.resourceId,
            severity: event.action?.includes('REMOVED') || event.action?.includes('REJECT')
              ? 'warning' : 'info',
          })));
        }
      } catch {
        // Keep existing activities
      }

      try {
        const today = new Date();
        const to = today.toISOString().slice(0, 10);
        const from = new Date(today);
        from.setDate(from.getDate() - 89);
        const [overview, trend, report] = await Promise.all([
          apiClient.get(`/analytics/overview?from=${from.toISOString().slice(0, 10)}&to=${to}`).catch(() => null),
          apiClient.get(`/analytics/trends?from=${from.toISOString().slice(0, 10)}&to=${to}`).catch(() => null),
          apiClient.get(`/reports/claims?from=${from.toISOString().slice(0, 10)}&to=${to}&page=0&size=50`).catch(() => null),
        ]);
        if (overview) setAnalytics(unwrap(overview));
        if (trend) setTrends(unwrap(trend) || []);
        if (report) setClaimReport(unwrap(report));
      } catch {
        // Keep existing analytics
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [isAuthenticated, currentUser?.id]);

  const createClaim = async (claimData) => {
    try {
      const response = await apiClient.post('/claims', {
        claimantName: claimData.claimantName,
        claimantDob: claimData.claimantDob || null,
        claimantGender: claimData.claimantGender || null,
        policyNumber: claimData.policyNumber,
        policyPlan: claimData.policyPlan || null,
        hospitalName: claimData.hospitalName,
        hospitalNpi: claimData.hospitalNpi || null,
        claimType: claimData.claimType,
        admissionDate: claimData.admissionDate || null,
        dischargeDate: claimData.dischargeDate || null,
        claimAmount: Number(claimData.claimAmount),
        copayAmount: Number(claimData.copayAmount || 0),
        priority: claimData.priority?.toUpperCase() || 'MEDIUM',
        description: claimData.description || null,
        reviewNotes: null,
        assignedToId: null,
        diagnosisCodes: (claimData.diagnosisCodes || []).map((item) =>
          typeof item === 'string' ? { code: item, description: null } : item),
        procedureCodes: (claimData.procedureCodes || []).map((item) =>
          typeof item === 'string' ? { code: item, description: null } : item),
      });
      await refreshData();
      return unwrap(response);
    } catch {
      // Offline / demo fallback
      const newClaim = {
        id: `CLM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Under AI Audit',
        dataQualityScore: 92,
        submissionDate: new Date().toISOString(),
        diagnosisCodes: ['R07.9'],
        procedureCodes: ['99285'],
        ...claimData,
      };
      setClaims((prev) => [newClaim, ...prev]);
      logActivity({
        action: 'Claim Submitted',
        category: 'Claims',
        claimId: newClaim.id,
        description: `Claim ${newClaim.id} intake completed for ${newClaim.claimantName}.`,
      });
      return newClaim;
    }
  };

  const updateClaim = async (id, updatedFields) => {
    try {
      const response = await apiClient.put(`/claims/${encodeURIComponent(id)}`, {
        claimantName: updatedFields.claimantName,
        claimantDob: updatedFields.claimantDob || null,
        claimantGender: updatedFields.claimantGender || null,
        policyNumber: updatedFields.policyNumber,
        policyPlan: updatedFields.policyPlan || null,
        hospitalName: updatedFields.hospitalName,
        hospitalNpi: updatedFields.hospitalNpi || null,
        claimType: updatedFields.claimType,
        admissionDate: updatedFields.admissionDate || null,
        dischargeDate: updatedFields.dischargeDate || null,
        claimAmount: Number(updatedFields.claimAmount),
        copayAmount: Number(updatedFields.copayAmount || 0),
        priority: updatedFields.priority?.toUpperCase() || 'MEDIUM',
        description: updatedFields.description || null,
        reviewNotes: updatedFields.reviewNotes || null,
        assignedToId: null,
        diagnosisCodes: updatedFields.diagnosisCodes || [],
        procedureCodes: updatedFields.procedureCodes || [],
      });
      await refreshData();
      return unwrap(response);
    } catch {
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))
      );
      logActivity({
        action: 'Claim Updated',
        category: 'Claims',
        claimId: id,
        description: `Claim details modified for ${id}.`,
      });
      return { id, ...updatedFields };
    }
  };

  const updateClaimStatus = async (id, status, reason) => {
    try {
      await apiClient.patch(`/claims/${encodeURIComponent(id)}/status`, {
        status: status.replaceAll(' ', '_').toUpperCase(),
        reason: reason || null,
      });
      await refreshData();
    } catch {
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
      logActivity({
        action: `Status: ${status}`,
        category: 'Claims',
        claimId: id,
        description: reason || `Claim status updated to ${status}.`,
      });
    }
  };

  const addClaimComment = async (id, comment) => {
    const text = comment?.trim();
    if (!text) return false;
    try {
      await apiClient.post(`/claims/${encodeURIComponent(id)}/comments`, { comment: text });
      await refreshData();
      return true;
    } catch {
      logActivity({
        action: 'Clinical Note Added',
        category: 'Claims',
        claimId: id,
        description: `Note added to ${id}: "${text}"`,
      });
      return true;
    }
  };

  const approveClaim = async (id, notes = '') => {
    try {
      await apiClient.post(`/approvals/${encodeURIComponent(id)}/decisions`, {
        decision: 'APPROVE',
        reason: notes || null,
      });
      await refreshData();
      return true;
    } catch {
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'Approved' } : c))
      );
      logActivity({
        action: 'Claim Approved',
        category: 'Approvals',
        claimId: id,
        description: `Claim ${id} authorized for payment reimbursement. ${notes}`,
        severity: 'info',
      });
      return true;
    }
  };

  const rejectClaim = async (id, reason) => {
    if (!reason?.trim()) return false;
    try {
      await apiClient.post(`/approvals/${encodeURIComponent(id)}/decisions`, {
        decision: 'REJECT',
        reason: reason.trim(),
      });
      await refreshData();
      return true;
    } catch {
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'Rejected' } : c))
      );
      logActivity({
        action: 'Claim Rejected',
        category: 'Approvals',
        claimId: id,
        description: `Claim ${id} denied. Reason: ${reason}`,
        severity: 'warning',
      });
      return true;
    }
  };

  const requestCorrection = async (id, comment) => {
    if (!comment?.trim()) return false;
    try {
      await apiClient.post(`/approvals/${encodeURIComponent(id)}/decisions`, {
        decision: 'REQUEST_CORRECTION',
        reason: comment.trim(),
      });
      await refreshData();
      return true;
    } catch {
      setClaims((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: 'Correction Requested' } : c))
      );
      logActivity({
        action: 'Correction Requested',
        category: 'Approvals',
        claimId: id,
        description: `Revision requested for ${id}. Comment: ${comment}`,
        severity: 'warning',
      });
      return true;
    }
  };

  const uploadDocument = async (docData) => {
    try {
      const formData = new FormData();
      formData.append('file', docData.file);
      formData.append('category', docData.category || 'Other Supporting Documents');
      formData.append('description', docData.description || '');
      formData.append('pageCount', String(docData.pageCount || 1));
      const response = await apiClient.post(
        `/claims/${encodeURIComponent(docData.claimId)}/documents`,
        formData
      );
      await refreshData();
      return unwrap(response);
    } catch {
      const newDoc = {
        id: `doc-${Date.now()}`,
        claimId: docData.claimId,
        name: docData.file?.name || docData.name || 'document.pdf',
        size: docData.file?.size || 102400,
        category: docData.category || 'Other Supporting Documents',
        status: 'Processed',
        uploadDate: new Date().toISOString(),
        pageCount: 1,
      };
      setDocuments((prev) => [newDoc, ...prev]);
      logActivity({
        action: 'Document Uploaded',
        category: 'Documents',
        claimId: docData.claimId,
        description: `File "${newDoc.name}" uploaded to claim ${docData.claimId}.`,
      });
      return newDoc;
    }
  };

  const deleteDocument = async (id) => {
    try {
      await apiClient.delete(`/documents/${encodeURIComponent(id)}`);
      await refreshData();
    } catch {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      logActivity({
        action: 'Document Deleted',
        category: 'Documents',
        description: `Document ${id} removed from system.`,
        severity: 'warning',
      });
    }
  };

  const downloadDocument = (document) => {
    if (!document) return;
    try {
      return apiClient.download(
        `/documents/${encodeURIComponent(document.id)}/content`,
        document.name || `document-${document.id}`
      );
    } catch {
      // Mock download
      const blob = new Blob([`ClaimPilot Document: ${document.name}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name || 'document.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const rerunDataGuard = async (claimId) => {
    try {
      const response = await apiClient.post(`/claims/${encodeURIComponent(claimId)}/validations`);
      const run = unwrap(response);
      setValidations((current) => ({ ...current, [claimId]: run }));
      await refreshData();
      return run;
    } catch {
      setValidations((prev) => {
        const cur = prev[claimId] || {};
        return {
          ...prev,
          [claimId]: {
            ...cur,
            score: Math.min(100, (cur.score || 85) + 3),
            lastChecked: new Date().toISOString(),
          },
        };
      });
      logActivity({
        action: 'DataGuard IQ Re-audit',
        category: 'DataGuard',
        claimId,
        description: `Automated quality rules re-evaluated for ${claimId}.`,
      });
    }
  };

  const updateDocument = (id, fields) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, ...fields } : d)));
  };

  const updateExtractionField = (claimId, fieldId, value) => {
    setExtractions((prev) => {
      const current = prev[claimId];
      if (!current) return prev;
      return {
        ...prev,
        [claimId]: {
          ...current,
          fields: current.fields.map((f) =>
            f.id === fieldId ? { ...f, currentValue: value, status: 'valid' } : f
          ),
        },
      };
    });
  };

  const verifyExtraction = (claimId) => {
    setExtractions((prev) => {
      const current = prev[claimId];
      if (!current) return prev;
      return {
        ...prev,
        [claimId]: {
          ...current,
          humanVerified: true,
          verificationDate: new Date().toISOString(),
          verifiedBy: currentUser?.name || 'Verified Reviewer',
        },
      };
    });
    logActivity({
      action: 'AI Extraction Verified',
      category: 'Extraction',
      claimId,
      description: `All OCR extracted entities confirmed by ${currentUser?.name || 'Reviewer'}.`,
    });
  };

  const rerunExtraction = (claimId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setExtractions((prev) => {
          const current = prev[claimId];
          if (!current) return prev;
          return {
            ...prev,
            [claimId]: {
              ...current,
              extractionDate: new Date().toISOString(),
              overallConfidence: 98.5,
              humanVerified: false,
            },
          };
        });
        logActivity({
          action: 'OCR Re-extraction Completed',
          category: 'Extraction',
          claimId,
          description: `AI extraction re-executed with enhanced OCR neural model for ${claimId}.`,
        });
        resolve();
      }, 600);
    });
  };

  const resetToDefaults = () => {
    setClaims(INITIAL_CLAIMS);
    setDocuments(INITIAL_DOCUMENTS);
    setActivities(INITIAL_ACTIVITIES);
    setValidations(CLAIM_VALIDATION_RULES);
    setExtractions(MOCK_EXTRACTION_SETS);
    setDataGuardSummary(DATAGUARD_SYSTEM_OVERVIEW);
    storage.clearAll();
  };

  return (
    <ClaimContext.Provider
      value={{
        claims,
        documents,
        activities,
        validations,
        extractions,
        analytics,
        trends,
        claimReport,
        dataGuardSummary,
        loading,
        error,
        refreshData,
        createClaim,
        updateClaim,
        updateClaimStatus,
        addClaimComment,
        approveClaim,
        rejectClaim,
        requestCorrection,
        uploadDocument,
        deleteDocument,
        downloadDocument,
        updateDocument,
        updateExtractionField,
        verifyExtraction,
        rerunExtraction,
        rerunDataGuard,
        logActivity,
        resetToDefaults,
      }}
    >
      {children}
    </ClaimContext.Provider>
  );
}

export function useClaims() {
  const context = useContext(ClaimContext);
  if (!context) throw new Error('useClaims must be used within a ClaimProvider');
  return context;
}
