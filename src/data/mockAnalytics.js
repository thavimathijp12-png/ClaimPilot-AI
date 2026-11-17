export const MONTHLY_TREND_DATA = [
  { month: 'Jun', totalClaims: 1420, approved: 1210, rejected: 140, correction: 70, volumeUsd: 4200000 },
  { month: 'Jul', totalClaims: 1580, approved: 1360, rejected: 150, correction: 70, volumeUsd: 4850000 },
  { month: 'Aug', totalClaims: 1710, approved: 1490, rejected: 130, correction: 90, volumeUsd: 5300000 },
  { month: 'Sep', totalClaims: 1890, approved: 1650, rejected: 160, correction: 80, volumeUsd: 5920000 },
  { month: 'Oct', totalClaims: 2150, approved: 1880, rejected: 170, correction: 100, volumeUsd: 6810000 },
  { month: 'Nov', totalClaims: 2340, approved: 2060, rejected: 180, correction: 100, volumeUsd: 7420000 },
];

export const STATUS_DISTRIBUTION_DATA = [
  { name: 'Approved', value: 2060, color: '#16A34A' },
  { name: 'Pending Review', value: 245, color: '#2563EB' },
  { name: 'Under AI Audit', value: 120, color: '#0D9488' },
  { name: 'Correction Needed', value: 100, color: '#F59E0B' },
  { name: 'Rejected', value: 180, color: '#DC2626' },
];

export const CLAIM_TYPE_DISTRIBUTION = [
  { name: 'Inpatient Care', count: 980, amount: 4820000, color: '#10233F' },
  { name: 'Outpatient Surgery', count: 640, amount: 1620000, color: '#2563EB' },
  { name: 'Emergency Room', count: 420, amount: 890000, color: '#0D9488' },
  { name: 'Specialist Consults', count: 180, amount: 90000, color: '#F59E0B' },
];

export const DATA_QUALITY_DISTRIBUTION = [
  { name: 'High Quality (90-100%)', count: 1980, percentage: 84.6, color: '#16A34A' },
  { name: 'Moderate Review (75-89%)', count: 260, percentage: 11.1, color: '#2563EB' },
  { name: 'Manual Correction (<75%)', count: 100, percentage: 4.3, color: '#F59E0B' },
];

export const DOCUMENT_PROCESSING_METRICS = {
  totalProcessedThisMonth: 8940,
  ocrAccuracyRate: 98.7,
  avgProcessingTimeSec: 3.4,
  humanTouchRate: 14.2, // % of docs requiring manual field edit
  documentsByCategory: [
    { category: 'Hospital Bills', count: 3200, avgPages: 3.2 },
    { category: 'Discharge Summaries', count: 2400, avgPages: 2.1 },
    { category: 'Prescriptions', count: 1850, avgPages: 1.0 },
    { category: 'Claim Forms (CMS-1500)', count: 1100, avgPages: 1.0 },
    { category: 'Other Supporting Docs', count: 390, avgPages: 2.4 }
  ]
};

