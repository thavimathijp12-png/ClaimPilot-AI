export const DATAGUARD_SYSTEM_OVERVIEW = {
  overallScore: 92,
  totalChecksRun: 1240,
  validFields: 1128,
  missingFields: 42,
  invalidFields: 34,
  inconsistentValues: 24,
  duplicateWarnings: 12, // Clarification: Duplicate warnings reflect potential overlap requiring human verification, not proof of fraud.
  lastAuditTimestamp: '2026-11-17T09:45:00Z',
  ruleCategories: [
    { name: 'Patient & Identity Consistency', score: 96, status: 'Healthy' },
    { name: 'Provider NPI & Accreditation', score: 98, status: 'Healthy' },
    { name: 'Financial & Ledger Calculation', score: 89, status: 'Moderate' },
    { name: 'Clinical Coding & Medical Necessity', score: 87, status: 'Attention Needed' },
    { name: 'Duplicate & Overlap Verification', score: 90, status: 'Healthy' },
  ]
};

export const CLAIM_VALIDATION_RULES = {
  'CLM-2026-8910': {
    claimId: 'CLM-2026-8910',
    claimantName: 'Jonathan Sterling',
    score: 94,
    validCount: 22,
    missingCount: 0,
    invalidCount: 0,
    inconsistentCount: 1,
    duplicateWarningsCount: 0,
    lastChecked: '2026-11-17T08:15:00Z',
    items: [
      {
        id: 'chk-1',
        field: 'Claimant Full Legal Name',
        sourceDoc: 'CMS_1500_Universal_Claim_Form.pdf (Box 2)',
        extractedValue: 'Jonathan Sterling',
        expectedValue: 'Jonathan Sterling (Payer Record Match)',
        severity: 'valid',
        status: 'Valid',
        explanation: 'Patient name perfectly matches policy enrollment ledger.',
        recommendation: 'No action required.'
      },
      {
        id: 'chk-2',
        field: 'Hospital National Provider Identifier (NPI)',
        sourceDoc: 'Metropolitan_Memorial_Itemized_Bill_8910.pdf (Header)',
        extractedValue: '1942859102',
        expectedValue: 'Active CMS NPPES Registered NPI',
        severity: 'valid',
        status: 'Valid',
        explanation: 'NPI registered to Metropolitan Memorial Hospital with active accreditation.',
        recommendation: 'No action required.'
      },
      {
        id: 'chk-3',
        field: 'Itemized Billing Ledger Sum',
        sourceDoc: 'Metropolitan_Memorial_Itemized_Bill_8910.pdf (Page 3)',
        extractedValue: '$14,850.50',
        expectedValue: '$14,850.50 (Calculated line item sum)',
        severity: 'valid',
        status: 'Valid',
        explanation: 'Sum of surgical, anesthesia, and room rates reconciles exactly with grand total.',
        recommendation: 'Reconciled successfully.'
      },
      {
        id: 'chk-4',
        field: 'Admission vs. Procedure Date',
        sourceDoc: 'Discharge_Summary_Operative_Note.pdf',
        extractedValue: 'Admission: 2026-10-28 / Procedure: 2026-10-29',
        expectedValue: 'Procedure occurred within admission window',
        severity: 'valid',
        status: 'Valid',
        explanation: 'Procedure date is logically sequenced within patient admission interval.',
        recommendation: 'No action required.'
      },
      {
        id: 'chk-5',
        field: 'Post-op Secondary Consultation Note',
        sourceDoc: 'Discharge_Summary_Operative_Note.pdf (Page 2)',
        extractedValue: 'Follow-up recommended in 14 days',
        expectedValue: 'Standard 7-day post-cholecystectomy milestone',
        severity: 'info',
        status: 'Inconsistent',
        explanation: 'Slight deviation from typical 7-day protocol timeline for recovery follow-up note.',
        recommendation: 'Reviewer should confirm if extended post-op interval was due to patient travel.'
      }
    ]
  },
  'CLM-2026-8912': {
    claimId: 'CLM-2026-8912',
    claimantName: 'David K. Miller',
    score: 68,
    validCount: 14,
    missingCount: 3,
    invalidCount: 2,
    inconsistentCount: 2,
    duplicateWarningsCount: 1,
    lastChecked: '2026-11-17T07:30:00Z',
    items: [
      {
        id: 'chk-201',
        field: 'Attending Physician Signature',
        sourceDoc: 'ER_Admission_Triage_Ledger.pdf (Page 2)',
        extractedValue: '[BLANK / MISSING]',
        expectedValue: 'Physician Digital or Physical Countersignature',
        severity: 'critical',
        status: 'Missing',
        explanation: 'Mandatory triage completion sign-off was not detected in Box 31 or ledger footer.',
        recommendation: 'Request correction from provider to submit signed clinical record.'
      },
      {
        id: 'chk-202',
        field: 'Itemized Medication Subtotal',
        sourceDoc: 'ER_Admission_Triage_Ledger.pdf',
        extractedValue: '$1,420.00 listed vs $1,180.00 itemized',
        expectedValue: '$1,420.00',
        severity: 'warning',
        status: 'Inconsistent',
        explanation: 'Line item sums in the emergency pharmacy table do not sum to the declared drug charge.',
        recommendation: 'Ask billing department for reconciled pharmacy breakdown.'
      },
      {
        id: 'chk-203',
        field: 'Potential Similar Encounter Warning',
        sourceDoc: 'Cross-Claim Historical Index',
        extractedValue: 'Encounter on 2026-10-29 ($8,750.00)',
        expectedValue: 'No identical episode within 14-day window',
        severity: 'warning',
        status: 'Duplicate Warning',
        explanation: 'A related emergency visit was recorded 5 days prior at St. Jude. This duplicate alert represents a possible overlapping episode of care requiring human adjudication, not proof of improper intent.',
        recommendation: 'Reviewer to verify if this is a separate readmission or a consolidated billing overlap.'
      },
      {
        id: 'chk-204',
        field: 'Primary ICD-10 Code Format',
        sourceDoc: 'ER_Admission_Triage_Ledger.pdf',
        extractedValue: 'R07.9 (Unspecified chest pain)',
        expectedValue: 'Specific etiology if known',
        severity: 'info',
        status: 'Valid',
        explanation: 'Diagnosis code is syntactically valid under CMS ICD-10-CM 2026 specifications.',
        recommendation: 'Accepted as primary symptom code.'
      }
    ]
  }
};

