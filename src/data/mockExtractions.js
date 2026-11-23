export const MOCK_EXTRACTION_SETS = {
  'CLM-2026-8910': {
    claimId: 'CLM-2026-8910',
    documentId: 'DOC-8910-1',
    documentName: 'Metropolitan_Memorial_Itemized_Bill_8910.pdf',
    totalPages: 3,
    currentPage: 1,
    extractionDate: '2026-11-04T09:16:30Z',
    overallConfidence: 97.2,
    humanVerified: false,
    verifiedBy: null,
    verifiedAt: null,
    fields: [
      {
        id: 'f-1',
        label: 'Claimant Full Name',
        category: 'Patient Info',
        extractedValue: 'Jonathan Sterling',
        currentValue: 'Jonathan Sterling',
        confidence: 99.4,
        status: 'valid',
        page: 1,
        bbox: { top: 18, left: 24, width: 32, height: 4 },
        validationMessage: 'Exact match with payer eligibility record.'
      },
      {
        id: 'f-2',
        label: 'Patient Date of Birth',
        category: 'Patient Info',
        extractedValue: '1982-04-12',
        currentValue: '1982-04-12',
        confidence: 98.8,
        status: 'valid',
        page: 1,
        bbox: { top: 23, left: 24, width: 22, height: 3.5 },
        validationMessage: 'Standard ISO format verified.'
      },
      {
        id: 'f-3',
        label: 'Facility / Hospital Name',
        category: 'Provider Info',
        extractedValue: 'Metropolitan Memorial Hospital',
        currentValue: 'Metropolitan Memorial Hospital',
        confidence: 99.1,
        status: 'valid',
        page: 1,
        bbox: { top: 8, left: 15, width: 45, height: 5 },
        validationMessage: 'Accredited acute care health facility.'
      },
      {
        id: 'f-4',
        label: 'National Provider Identifier (NPI)',
        category: 'Provider Info',
        extractedValue: '1942859102',
        currentValue: '1942859102',
        confidence: 99.6,
        status: 'valid',
        page: 1,
        bbox: { top: 14, left: 70, width: 20, height: 3.5 },
        validationMessage: 'Validated via NPPES directory.'
      },
      {
        id: 'f-5',
        label: 'Admission Date',
        category: 'Encounter Dates',
        extractedValue: '2026-10-28',
        currentValue: '2026-10-28',
        confidence: 96.5,
        status: 'valid',
        page: 1,
        bbox: { top: 32, left: 20, width: 18, height: 3.5 },
        validationMessage: 'Encounter timeframe aligned.'
      },
      {
        id: 'f-6',
        label: 'Discharge Date',
        category: 'Encounter Dates',
        extractedValue: '2026-11-02',
        currentValue: '2026-11-02',
        confidence: 96.0,
        status: 'valid',
        page: 1,
        bbox: { top: 32, left: 55, width: 18, height: 3.5 },
        validationMessage: 'Length of stay: 5 inpatient days.'
      },
      {
        id: 'f-7',
        label: 'Total Billed Amount',
        category: 'Financial Summary',
        extractedValue: '14850.50',
        currentValue: '14850.50',
        confidence: 99.2,
        status: 'valid',
        page: 2,
        bbox: { top: 82, left: 65, width: 25, height: 4.5 },
        validationMessage: 'Matches summation of 14 itemized surgical lines.'
      },
      {
        id: 'f-8',
        label: 'Primary Procedure Code (CPT)',
        category: 'Clinical Coding',
        extractedValue: '47562',
        currentValue: '47562',
        confidence: 92.4,
        status: 'valid',
        page: 2,
        bbox: { top: 44, left: 18, width: 16, height: 3.5 },
        validationMessage: 'Laparoscopic cholecystectomy surgical procedure.'
      },
      {
        id: 'f-9',
        label: 'Primary Diagnosis Code (ICD-10)',
        category: 'Clinical Coding',
        extractedValue: 'K80.20',
        currentValue: 'K80.20',
        confidence: 94.7,
        status: 'valid',
        page: 2,
        bbox: { top: 50, left: 18, width: 16, height: 3.5 },
        validationMessage: 'Calculus of gallbladder without cholecystitis.'
      },
      {
        id: 'f-10',
        label: 'Attending Physician Signature Indicator',
        category: 'Signatures & Attestation',
        extractedValue: 'Dr. Gregory Harrison, MD [Cryptographically Verified]',
        currentValue: 'Dr. Gregory Harrison, MD [Cryptographically Verified]',
        confidence: 98.1,
        status: 'valid',
        page: 3,
        bbox: { top: 88, left: 40, width: 45, height: 6 },
        validationMessage: 'Valid digital certificate signature stamp.'
      }
    ]
  },
  'CLM-2026-8912': {
    claimId: 'CLM-2026-8912',
    documentId: 'DOC-8912-1',
    documentName: 'ER_Admission_Triage_Ledger.pdf',
    totalPages: 2,
    currentPage: 1,
    extractionDate: '2026-11-05T08:35:00Z',
    overallConfidence: 81.4,
    humanVerified: false,
    verifiedBy: null,
    verifiedAt: null,
    fields: [
      {
        id: 'f-201',
        label: 'Claimant Full Name',
        category: 'Patient Info',
        extractedValue: 'David K. Miller',
        currentValue: 'David K. Miller',
        confidence: 98.0,
        status: 'valid',
        page: 1,
        bbox: { top: 15, left: 20, width: 30, height: 4 },
        validationMessage: 'Verified against insurance roster.'
      },
      {
        id: 'f-202',
        label: 'ER Admission Timestamp',
        category: 'Encounter Dates',
        extractedValue: '2026-11-02 23:45',
        currentValue: '2026-11-02 23:45',
        confidence: 89.2,
        status: 'valid',
        page: 1,
        bbox: { top: 22, left: 20, width: 25, height: 3.5 },
        validationMessage: 'Late night emergency intake.'
      },
      {
        id: 'f-203',
        label: 'Total Emergency Charge',
        category: 'Financial Summary',
        extractedValue: '8920.75',
        currentValue: '8920.75',
        confidence: 95.0,
        status: 'valid',
        page: 2,
        bbox: { top: 75, left: 60, width: 25, height: 4.5 },
        validationMessage: 'Total ledger amount extracted.'
      },
      {
        id: 'f-204',
        label: 'Attending Physician Signature',
        category: 'Signatures & Attestation',
        extractedValue: '',
        currentValue: '',
        confidence: 25.0,
        status: 'missing',
        page: 2,
        bbox: { top: 88, left: 50, width: 35, height: 6 },
        validationMessage: 'Field appears blank or signature unreadable.'
      }
    ]
  }
};

