import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CLAIMS } from '../data/mockClaims';
import { INITIAL_DOCUMENTS } from '../data/mockDocuments';
import { INITIAL_ACTIVITIES } from '../data/mockActivity';
import { CLAIM_VALIDATION_RULES, DATAGUARD_SYSTEM_OVERVIEW } from '../data/mockDataGuard';
import { MOCK_EXTRACTION_SETS } from '../data/mockExtractions';
import { storage } from '../services/storageService';
import { useAuth } from './AuthContext';

const ClaimContext = createContext(null);
const PENDING_ADJUDICATION_STATUSES = ['Pending Review', 'Under AI Audit'];

const canAdjudicate = (claim) => claim && PENDING_ADJUDICATION_STATUSES.includes(claim.status);

export function ClaimProvider({ children }) {
  const { currentUser } = useAuth();

  const [claims, setClaims] = useState(() => storage.get('claims', INITIAL_CLAIMS));
  const [documents, setDocuments] = useState(() => storage.get('documents', INITIAL_DOCUMENTS));
  const [activities, setActivities] = useState(() => storage.get('activities', INITIAL_ACTIVITIES));
  const [validations, setValidations] = useState(() => storage.get('validations', CLAIM_VALIDATION_RULES));
  const [extractions, setExtractions] = useState(() => storage.get('extractions', MOCK_EXTRACTION_SETS));
  const [dataGuardSummary, setDataGuardSummary] = useState(() => storage.get('dataguard_summary', DATAGUARD_SYSTEM_OVERVIEW));

  // Sync to storage
  useEffect(() => {
    storage.set('claims', claims);
  }, [claims]);

  useEffect(() => {
    storage.set('documents', documents);
  }, [documents]);

  useEffect(() => {
    storage.set('activities', activities);
  }, [activities]);

  useEffect(() => {
    storage.set('validations', validations);
  }, [validations]);

  useEffect(() => {
    storage.set('extractions', extractions);
  }, [extractions]);

  // Activity logger helper
  const logActivity = ({ action, category, claimId, description, severity = 'info' }) => {
    const newActivity = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser?.name || 'Authorized User',
      userRole: currentUser?.role || 'Staff Operator',
      userAvatar: currentUser?.avatar || null,
      category,
      action,
      claimId: claimId || 'SYSTEM',
      description,
      severity,
    };
    setActivities(prev => [newActivity, ...prev]);
    return newActivity;
  };

  // Claim actions
  const createClaim = (claimData) => {
    const claimId = `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newClaim = {
      id: claimId,
      claimantName: claimData.claimantName,
      claimantDob: claimData.claimantDob || '1988-01-01',
      claimantGender: claimData.claimantGender || 'Unspecified',
      policyNumber: claimData.policyNumber,
      policyPlan: claimData.policyPlan || 'Standard Comprehensive Plan',
      hospitalName: claimData.hospitalName,
      hospitalNpi: claimData.hospitalNpi || '1099284711',
      claimType: claimData.claimType || 'Outpatient',
      admissionDate: claimData.admissionDate || new Date().toISOString().split('T')[0],
      dischargeDate: claimData.dischargeDate || new Date().toISOString().split('T')[0],
      submissionDate: new Date().toISOString().split('T')[0],
      claimAmount: parseFloat(claimData.claimAmount) || 0,
      approvedAmount: 0,
      copayAmount: parseFloat(claimData.copayAmount) || 50.00,
      status: claimData.status || 'Pending Review',
      priority: claimData.priority || 'Medium',
      dataQualityScore: 92,
      description: claimData.description || 'General healthcare encounter claim.',
      assignedTo: currentUser?.name || 'Sarah Jenkins, RN',
      diagnosisCodes: claimData.diagnosisCodes || [{ code: 'Z00.00', description: 'General adult medical examination' }],
      procedureCodes: claimData.procedureCodes || [{ code: '99213', description: 'Office outpatient visit 20-29 min' }],
      documentsCount: 0,
      reviewNotes: 'Newly ingested claim awaiting documentation and clinical verification.',
      timeline: [
        {
          id: `evt-${Date.now()}`,
          date: new Date().toISOString(),
          title: 'Claim Created',
          user: currentUser?.name || 'Marcus Chen',
          description: 'Electronic claim file initiated.'
        }
      ]
    };

    // Create baseline DataGuard record
    setValidations(prev => ({
      ...prev,
      [claimId]: {
        claimId,
        claimantName: newClaim.claimantName,
        score: 92,
        validCount: 18,
        missingCount: 0,
        invalidCount: 0,
        inconsistentCount: 1,
        duplicateWarningsCount: 0,
        lastChecked: new Date().toISOString(),
        items: [
          {
            id: `chk-${Date.now()}-1`,
            field: 'Claimant Full Legal Name',
            sourceDoc: 'Direct Electronic Intake Form',
            extractedValue: newClaim.claimantName,
            expectedValue: `${newClaim.claimantName} (Payer Eligibility Match)`,
            severity: 'valid',
            status: 'Valid',
            explanation: 'Name matches policyholder registration.',
            recommendation: 'No action required.'
          },
          {
            id: `chk-${Date.now()}-2`,
            field: 'Healthcare Facility Name & NPI',
            sourceDoc: 'Billing Intake Registry',
            extractedValue: `${newClaim.hospitalName} (${newClaim.hospitalNpi})`,
            expectedValue: 'Active Licensed Health Facility',
            severity: 'valid',
            status: 'Valid',
            explanation: 'Provider listed in active credentialed directory.',
            recommendation: 'No action required.'
          }
        ]
      }
    }));

    setClaims(prev => [newClaim, ...prev]);

    logActivity({
      action: 'Claim Created',
      category: 'Claims',
      claimId,
      description: `Created claim ${claimId} for ${newClaim.claimantName} ($${newClaim.claimAmount.toLocaleString()}).`,
      severity: 'info'
    });

    return newClaim;
  };

  const updateClaim = (id, updatedFields) => {
    setClaims(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updatedFields };
        if (updatedFields.status && updatedFields.status !== c.status) {
          updated.timeline = [
            {
              id: `evt-${Date.now()}`,
              date: new Date().toISOString(),
              title: `Status Changed to ${updatedFields.status}`,
              user: currentUser?.name || 'Authorized Staff',
              description: updatedFields.reviewNotes || `Status updated from ${c.status} to ${updatedFields.status}.`
            },
            ...(updated.timeline || [])
          ];
        }
        return updated;
      }
      return c;
    }));

    logActivity({
      action: 'Claim Updated',
      category: 'Claims',
      claimId: id,
      description: `Updated claim record details for ${id}.`,
      severity: 'info'
    });
  };

  const addClaimComment = (id, comment) => {
    const text = comment?.trim();
    const claim = claims.find((item) => item.id === id);
    if (!claim || !text) return false;

    const timelineItem = {
      id: `evt-${Date.now()}`,
      date: new Date().toISOString(),
      title: 'Reviewer Comment Added',
      user: currentUser?.name || 'Authorized User',
      description: text,
    };

    setClaims((prev) => prev.map((item) => item.id === id
      ? { ...item, timeline: [timelineItem, ...(item.timeline || [])], reviewNotes: text }
      : item
    ));
    logActivity({
      action: 'Reviewer Comment Added',
      category: 'Claims',
      claimId: id,
      description: `Added a reviewer note to claim ${id}: ${text}`,
      severity: 'info',
    });
    return true;
  };

  const approveClaim = (id, notes = '') => {
    const claim = claims.find((item) => item.id === id);
    if (!canAdjudicate(claim)) return false;

    setClaims(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Approved',
          approvedAmount: c.claimAmount,
          reviewNotes: notes.trim() || c.reviewNotes || 'Approved by clinical reviewer.',
          timeline: [
            {
              id: `evt-${Date.now()}`,
              date: new Date().toISOString(),
              title: 'Claim Approved',
              user: currentUser?.name || 'Clinical Adjudicator',
              description: notes ? `Approved with notes: "${notes}"` : 'All clinical criteria and medical necessity validated.'
            },
            ...(c.timeline || [])
          ]
        };
      }
      return c;
    }));

    logActivity({
      action: 'Claim Approved',
      category: 'Approvals',
      claimId: id,
      description: `Approved claim ${id} for ${claim.claimantName} ($${claim.claimAmount.toLocaleString()}).`,
      severity: 'success'
    });
    return true;
  };

  const rejectClaim = (id, reason) => {
    const claim = claims.find((item) => item.id === id);
    if (!canAdjudicate(claim) || !reason?.trim()) return false;

    setClaims(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Rejected',
          approvedAmount: 0,
          reviewNotes: reason.trim(),
          timeline: [
            {
              id: `evt-${Date.now()}`,
              date: new Date().toISOString(),
              title: 'Claim Rejected',
              user: currentUser?.name || 'Clinical Adjudicator',
              description: `Reason for rejection: "${reason.trim()}"`
            },
            ...(c.timeline || [])
          ]
        };
      }
      return c;
    }));

    logActivity({
      action: 'Claim Rejected',
      category: 'Approvals',
      claimId: id,
      description: `Rejected claim ${id} for ${claim.claimantName}. Reason: ${reason.trim()}`,
      severity: 'error'
    });
    return true;
  };

  const requestCorrection = (id, comment) => {
    const claim = claims.find((item) => item.id === id);
    if (!canAdjudicate(claim) || !comment?.trim()) return false;

    setClaims(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: 'Correction Requested',
          reviewNotes: comment.trim(),
          timeline: [
            {
              id: `evt-${Date.now()}`,
              date: new Date().toISOString(),
              title: 'Correction Requested',
              user: currentUser?.name || 'Clinical Adjudicator',
              description: `Correction request: "${comment.trim()}"`
            },
            ...(c.timeline || [])
          ]
        };
      }
      return c;
    }));

    logActivity({
      action: 'Correction Requested',
      category: 'Approvals',
      claimId: id,
      description: `Requested provider correction for ${id} (${claim.claimantName}): ${comment.trim()}`,
      severity: 'warning'
    });
    return true;
  };

  // Documents
  const uploadDocument = (docData) => {
    const newDocId = `DOC-${Date.now().toString().slice(-6)}`;
    const newDoc = {
      id: newDocId,
      claimId: docData.claimId,
      name: docData.name,
      category: docData.category || 'Other Supporting Documents',
      fileType: docData.fileType || (docData.name.endsWith('.pdf') ? 'PDF' : docData.name.endsWith('.png') ? 'PNG' : 'JPG'),
      sizeBytes: docData.sizeBytes || 1450000,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.name || 'Marcus Chen',
      status: 'Pending OCR',
      pageCount: docData.pageCount || 1,
      confidenceScore: null,
      previewUrl: docData.previewUrl || 'mock-document-preview',
      thumbnailType: docData.category === 'Hospital Bill' ? 'bill' : docData.category === 'Discharge Summary' ? 'summary' : docData.category === 'Prescription' ? 'rx' : 'form',
      description: docData.description || 'Uploaded supporting clinical document.'
    };

    setDocuments(prev => [newDoc, ...prev]);

    // Update claim documents count
    if (docData.claimId) {
      setClaims(prev => prev.map(c => {
        if (c.id === docData.claimId) {
          return { ...c, documentsCount: (c.documentsCount || 0) + 1 };
        }
        return c;
      }));
    }

    logActivity({
      action: 'Document Uploaded',
      category: 'Documents',
      claimId: docData.claimId || 'SYSTEM',
      description: `Uploaded "${newDoc.name}" (${newDoc.category}).`,
      severity: 'info'
    });

    return newDoc;
  };

  const deleteDocument = (id) => {
    const doc = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));

    if (doc?.claimId) {
      setClaims(prev => prev.map(c => {
        if (c.id === doc.claimId && c.documentsCount > 0) {
          return { ...c, documentsCount: c.documentsCount - 1 };
        }
        return c;
      }));
    }

    logActivity({
      action: 'Document Removed',
      category: 'Documents',
      claimId: doc?.claimId || 'SYSTEM',
      description: `Removed document "${doc?.name || id}".`,
      severity: 'warning'
    });
  };

  const updateDocument = (id, updates) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  // AI Extraction
  const updateExtractionField = (claimId, fieldId, newValue) => {
    setExtractions(prev => {
      const claimExtraction = prev[claimId];
      if (!claimExtraction) return prev;

      const updatedFields = claimExtraction.fields.map(f => {
        if (f.id === fieldId) {
          return {
            ...f,
            currentValue: newValue,
            edited: true,
            status: 'valid',
            validationMessage: 'Field manually modified and verified by operator.'
          };
        }
        return f;
      });

      return {
        ...prev,
        [claimId]: {
          ...claimExtraction,
          fields: updatedFields
        }
      };
    });
  };

  const verifyExtraction = (claimId) => {
    setExtractions(prev => {
      const claimExtraction = prev[claimId];
      if (!claimExtraction) return prev;

      return {
        ...prev,
        [claimId]: {
          ...claimExtraction,
          humanVerified: true,
          verifiedBy: currentUser?.name || 'Marcus Chen',
          verifiedAt: new Date().toISOString()
        }
      };
    });

    // Update claim status if it was under extraction or audit
    setClaims(prev => prev.map(c => {
      if (c.id === claimId && (c.status === 'Under AI Audit' || c.status === 'In Extraction')) {
        return {
          ...c,
          status: 'Pending Review',
          timeline: [
            {
              id: `evt-${Date.now()}`,
              date: new Date().toISOString(),
              title: 'AI Extraction Verified',
              user: currentUser?.name || 'Marcus Chen',
              description: 'Operator reviewed and confirmed all OCR fields.'
            },
            ...(c.timeline || [])
          ]
        };
      }
      return c;
    }));

    logActivity({
      action: 'Extraction Verified',
      category: 'Extraction',
      claimId,
      description: `Confirmed OCR extraction integrity for claim ${claimId}.`,
      severity: 'success'
    });
  };

  const rerunExtraction = (claimId) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setExtractions(prev => {
          const current = prev[claimId];
          if (!current) return prev;
          return {
            ...prev,
            [claimId]: {
              ...current,
              extractionDate: new Date().toISOString(),
              overallConfidence: 98.2,
              humanVerified: false,
              fields: current.fields.map(f => ({
                ...f,
                confidence: Math.min(99.8, f.confidence + 1.2),
                status: 'valid'
              }))
            }
          };
        });

        logActivity({
          action: 'Demo Extraction Re-run',
          category: 'Extraction',
          claimId,
          description: `Stored demo extraction sample refreshed for ${claimId}.`,
          severity: 'info'
        });

        resolve();
      }, 1000);
    });
  };

  // DataGuard IQ
  const rerunDataGuard = (claimId) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setValidations(prev => {
          const current = prev[claimId];
          if (!current) return prev;
          return {
            ...prev,
            [claimId]: {
              ...current,
              score: Math.min(100, (current.score || 85) + 5),
              lastChecked: new Date().toISOString(),
            }
          };
        });

        logActivity({
          action: 'DataGuard IQ Re-audit',
          category: 'DataGuard',
          claimId,
          description: `Automated quality rules re-evaluated for ${claimId}.`,
          severity: 'info'
        });

        resolve();
      }, 800);
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
        dataGuardSummary,
        createClaim,
        updateClaim,
        addClaimComment,
        approveClaim,
        rejectClaim,
        requestCorrection,
        uploadDocument,
        deleteDocument,
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
  if (!context) {
    throw new Error('useClaims must be used within a ClaimProvider');
  }
  return context;
}

