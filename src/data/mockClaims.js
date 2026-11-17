export const INITIAL_CLAIMS = [
  {
    id: 'CLM-2026-8910',
    claimantName: 'Jonathan Sterling',
    claimantDob: '1982-04-12',
    claimantGender: 'Male',
    policyNumber: 'POL-BCBS-9042',
    policyPlan: 'BlueCross Comprehensive Gold PPO',
    hospitalName: 'Metropolitan Memorial Hospital',
    hospitalNpi: '1942859102',
    claimType: 'Inpatient',
    admissionDate: '2026-10-28',
    dischargeDate: '2026-11-02',
    submissionDate: '2026-11-04',
    claimAmount: 14850.50,
    approvedAmount: 0,
    copayAmount: 350.00,
    status: 'Pending Review',
    priority: 'High',
    dataQualityScore: 94,
    description: 'Post-operative inpatient stay following laparoscopic cholecystectomy with secondary ultrasound evaluation.',
    assignedTo: 'Sarah Jenkins, RN',
    diagnosisCodes: [
      { code: 'K80.20', description: 'Calculus of gallbladder without cholecystitis without obstruction' },
      { code: 'Z98.890', description: 'Other specified postprocedural states' }
    ],
    procedureCodes: [
      { code: '47562', description: 'Laparoscopic cholecystectomy surgical procedure' },
      { code: '99232', description: 'Subsequent hospital care, typically 25 minutes' }
    ],
    documentsCount: 4,
    reviewNotes: 'Discharge summary signed by Dr. Harrison. Verification of pre-authorization pending reviewer confirmation.',
    timeline: [
      { id: 'evt-1', date: '2026-11-04T09:15:00Z', title: 'Claim Created', user: 'Marcus Chen', description: 'Submitted via electronic portal intake.' },
      { id: 'evt-2', date: '2026-11-04T09:16:30Z', title: 'DataGuard IQ Audit Completed', user: 'System Engine', description: 'Initial quality score calculated: 94/100.' },
      { id: 'evt-3', date: '2026-11-05T14:20:00Z', title: 'AI Extraction Verified', user: 'Marcus Chen', description: 'Itemized billing extraction approved.' },
      { id: 'evt-4', date: '2026-11-06T10:00:00Z', title: 'Assigned to Reviewer', user: 'Dr. Eleanor Vance', description: 'Routing to clinical reviewer Sarah Jenkins, RN.' }
    ]
  },
  {
    id: 'CLM-2026-8911',
    claimantName: 'Elena Rostova',
    claimantDob: '1990-09-18',
    claimantGender: 'Female',
    policyNumber: 'POL-AET-5512',
    policyPlan: 'Aetna Signature Health HMO',
    hospitalName: 'Pinecrest Orthopedic Center',
    hospitalNpi: '1839201948',
    claimType: 'Outpatient',
    admissionDate: '2026-11-08',
    dischargeDate: '2026-11-08',
    submissionDate: '2026-11-09',
    claimAmount: 3240.00,
    approvedAmount: 3240.00,
    copayAmount: 50.00,
    status: 'Approved',
    priority: 'Medium',
    dataQualityScore: 98,
    description: 'Outpatient MRI scan of right knee with contrast and orthopedic follow-up consult.',
    assignedTo: 'Sarah Jenkins, RN',
    diagnosisCodes: [
      { code: 'M23.22', description: 'Derangement of meniscus due to old tear or injury, right knee' }
    ],
    procedureCodes: [
      { code: '73721', description: 'Magnetic resonance imaging, any joint of lower extremity' },
      { code: '99214', description: 'Office or other outpatient visit, 30-39 minutes' }
    ],
    documentsCount: 2,
    reviewNotes: 'All clinical criteria satisfied. Coverage verified under outpatient radiology schedule.',
    timeline: [
      { id: 'evt-11', date: '2026-11-09T11:00:00Z', title: 'Claim Created', user: 'Marcus Chen', description: 'Document intake uploaded from hospital portal.' },
      { id: 'evt-12', date: '2026-11-09T11:02:00Z', title: 'DataGuard IQ Verified', user: 'System Engine', description: 'Score: 98/100. No discrepancies detected.' },
      { id: 'evt-13', date: '2026-11-10T16:30:00Z', title: 'Adjudication Approved', user: 'Sarah Jenkins, RN', description: 'Approved for full eligible payment of $3,240.00.' }
    ]
  },
  {
    id: 'CLM-2026-8912',
    claimantName: 'David K. Miller',
    claimantDob: '1975-12-03',
    claimantGender: 'Male',
    policyNumber: 'POL-UHC-8192',
    policyPlan: 'UnitedHealthcare Choice Plus',
    hospitalName: 'St. Jude Regional Medical Center',
    hospitalNpi: '1092837482',
    claimType: 'Emergency',
    admissionDate: '2026-11-02',
    dischargeDate: '2026-11-03',
    submissionDate: '2026-11-05',
    claimAmount: 8920.75,
    approvedAmount: 0,
    copayAmount: 200.00,
    status: 'Correction Requested',
    priority: 'High',
    dataQualityScore: 68,
    description: 'Acute chest pain emergency room evaluation and overnight telemetry observation.',
    assignedTo: 'Sarah Jenkins, RN',
    diagnosisCodes: [
      { code: 'R07.9', description: 'Chest pain, unspecified' },
      { code: 'I10', description: 'Essential (primary) hypertension' }
    ],
    procedureCodes: [
      { code: '99285', description: 'Emergency department visit, high severity' },
      { code: '93000', description: 'Electrocardiogram, routine ECG with at least 12 leads' }
    ],
    documentsCount: 3,
    reviewNotes: 'Missing primary physician diagnostic summary signature on emergency ledger. Itemized pharmacy breakdown incomplete.',
    timeline: [
      { id: 'evt-21', date: '2026-11-05T08:30:00Z', title: 'Claim Created', user: 'Marcus Chen', description: 'Direct fax intake digitized.' },
      { id: 'evt-22', date: '2026-11-05T08:35:00Z', title: 'DataGuard IQ Flagged', user: 'System Engine', description: 'Warning: Missing doctor signature detected in document page 2.' },
      { id: 'evt-23', date: '2026-11-07T13:45:00Z', title: 'Correction Requested', user: 'Sarah Jenkins, RN', description: 'Returned to provider for countersigned clinical attestation.' }
    ]
  },
  {
    id: 'CLM-2026-8913',
    claimantName: 'Rachel Green-Solis',
    claimantDob: '1988-06-25',
    claimantGender: 'Female',
    policyNumber: 'POL-CIG-2291',
    policyPlan: 'Cigna Open Access Plus',
    hospitalName: "Valley Children's Clinic",
    hospitalNpi: '1294820194',
    claimType: 'Specialist Consultation',
    admissionDate: '2026-11-10',
    dischargeDate: '2026-11-10',
    submissionDate: '2026-11-11',
    claimAmount: 780.00,
    approvedAmount: 0,
    copayAmount: 40.00,
    status: 'Pending Review',
    priority: 'Low',
    dataQualityScore: 92,
    description: 'Pediatric allergy testing and immunotherapy consultation report.',
    assignedTo: 'Sarah Jenkins, RN',
    diagnosisCodes: [
      { code: 'J45.20', description: 'Mild intermittent asthma, uncomplicated' },
      { code: 'T78.40XA', description: 'Allergy, unspecified, initial encounter' }
    ],
    procedureCodes: [
      { code: '95004', description: 'Percutaneous tests (scratch, puncture, prick) with allergenic extracts' }
    ],
    documentsCount: 2,
    reviewNotes: 'All clear. Ready for final review queue.',
    timeline: [
      { id: 'evt-31', date: '2026-11-11T14:10:00Z', title: 'Claim Created', user: 'Marcus Chen', description: 'Clinic electronic transmission received.' }
    ]
  },
  {
    id: 'CLM-2026-8914',
    claimantName: 'Arthur Pendelton',
    claimantDob: '1961-02-14',
    claimantGender: 'Male',
    policyNumber: 'POL-HUM-6612',
    policyPlan: 'Humana Gold Plus Medicare HMO',
    hospitalName: 'Bayfront Cardiovascular Institute',
    hospitalNpi: '1482910395',
    claimType: 'Inpatient',
    admissionDate: '2026-10-15',
    dischargeDate: '2026-10-20',
    submissionDate: '2026-10-24',
    claimAmount: 26400.00,
    approvedAmount: 0,
    copayAmount: 500.00,
    status: 'Rejected',
    priority: 'High',
    dataQualityScore: 54,
    description: 'Cardiac catheterization with stent placement. Discrepancy in pre-authorization documentation and out-of-network facility billing.',
    assignedTo: 'Dr. Eleanor Vance',
    diagnosisCodes: [
      { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery' }
    ],
    procedureCodes: [
      { code: '92928', description: 'Percutaneous transcatheter placement of intracoronary stent' }
    ],
    documentsCount: 5,
    reviewNotes: 'Claim rejected due to lack of prior authorization code match and non-covered facility rider.',
    timeline: [
      { id: 'evt-41', date: '2026-10-24T10:00:00Z', title: 'Claim Created', user: 'Marcus Chen', description: 'Initial file upload received.' },
      { id: 'evt-42', date: '2026-10-28T11:15:00Z', title: 'Claim Formally Rejected', user: 'Dr. Eleanor Vance', description: 'Denied under non-contracted protocol Section 4.2.' }
    ]
  },
  {
    id: 'CLM-2026-8915',
    claimantName: 'Amara Okafor',
    claimantDob: '1995-11-30',
    claimantGender: 'Female',
    policyNumber: 'POL-BCBS-1102',
    policyPlan: 'BlueCross BlueShield Federal Plan',
    hospitalName: 'Metropolitan Memorial Hospital',
    hospitalNpi: '1942859102',
    claimType: 'Pharmacy',
    admissionDate: '2026-11-12',
    dischargeDate: '2026-11-12',
    submissionDate: '2026-11-13',
    claimAmount: 1850.20,
    approvedAmount: 0,
    copayAmount: 25.00,
    status: 'Under AI Audit',
    priority: 'Medium',
    dataQualityScore: 88,
    description: 'Specialty injectable biologic medication dispensation for autoimmune arthritis.',
    assignedTo: 'Marcus Chen',
    diagnosisCodes: [
      { code: 'M06.9', description: 'Rheumatoid arthritis, unspecified' }
    ],
    procedureCodes: [
      { code: 'J0135', description: 'Injection, adalimumab, 20 mg' }
    ],
    documentsCount: 2,
    reviewNotes: 'AI extraction running itemized NDC verification against pharmacy benefit formulary.',
    timeline: [
      { id: 'evt-51', date: '2026-11-13T08:00:00Z', title: 'Claim Created', user: 'Marcus Chen', description: 'Pharmacy claims batch uploaded.' },
      { id: 'evt-52', date: '2026-11-13T08:02:00Z', title: 'AI Extraction Triggered', user: 'System Engine', description: 'Optical character recognition processing prescription slip.' }
    ]
  },
  {
    id: 'CLM-2026-8916',
    claimantName: 'Liam O’Connor',
    claimantDob: '1985-08-05',
    claimantGender: 'Male',
    policyNumber: 'POL-AET-7729',
    policyPlan: 'Aetna Premier Choice',
    hospitalName: 'Highland Park Surgical Hospital',
    hospitalNpi: '1592039481',
    claimType: 'Outpatient',
    admissionDate: '2026-11-06',
    dischargeDate: '2026-11-06',
    submissionDate: '2026-11-07',
    claimAmount: 4120.00,
    approvedAmount: 4120.00,
    copayAmount: 150.00,
    status: 'Approved',
    priority: 'Low',
    dataQualityScore: 97,
    description: 'Outpatient arthroscopic repair of left rotator cuff tendon.',
    assignedTo: 'Sarah Jenkins, RN',
    diagnosisCodes: [
      { code: 'M75.12', description: 'Complete rotator cuff tear or rupture of left shoulder' }
    ],
    procedureCodes: [
      { code: '29827', description: 'Arthroscopy, shoulder, surgical; with rotator cuff repair' }
    ],
    documentsCount: 3,
    reviewNotes: 'Clinical indications and operative report verified. In-network provider confirmed.',
    timeline: [
      { id: 'evt-61', date: '2026-11-07T12:00:00Z', title: 'Claim Created', user: 'Marcus Chen', description: 'Surgical center submitted records.' },
      { id: 'evt-62', date: '2026-11-09T14:30:00Z', title: 'Claim Approved', user: 'Sarah Jenkins, RN', description: 'Authorization validated, claim approved for disbursement.' }
    ]
  },
  {
    id: 'CLM-2026-8917',
    claimantName: 'Sofia Martinez-Diaz',
    claimantDob: '2001-03-22',
    claimantGender: 'Female',
    policyNumber: 'POL-UHC-9921',
    policyPlan: 'UnitedHealthcare Bronze Value',
    hospitalName: 'St. Jude Regional Medical Center',
    hospitalNpi: '1092837482',
    claimType: 'Emergency',
    admissionDate: '2026-11-14',
    dischargeDate: '2026-11-15',
    submissionDate: '2026-11-15',
    claimAmount: 5670.30,
    approvedAmount: 0,
    copayAmount: 250.00,
    status: 'Pending Review',
    priority: 'Medium',
    dataQualityScore: 91,
    description: 'Acute appendicitis diagnosis, ultrasound confirmation, and supportive hydration.',
    assignedTo: 'Sarah Jenkins, RN',
    diagnosisCodes: [
      { code: 'K35.80', description: 'Unspecified acute appendicitis' }
    ],
    procedureCodes: [
      { code: '76705', description: 'Ultrasound, abdominal, real time with image documentation' }
    ],
    documentsCount: 3,
    reviewNotes: 'Ultrasound images attached. In queue for final clinical adjudication.',
    timeline: [
      { id: 'evt-71', date: '2026-11-15T10:00:00Z', title: 'Claim Intake', user: 'Marcus Chen', description: 'Transmitted from emergency admitting wing.' }
    ]
  }
];
