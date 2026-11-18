import { z } from 'zod';

export const claimTypeEnum = z.enum([
  'Inpatient',
  'Outpatient',
  'Emergency',
  'Pharmacy',
  'Specialist Consultation',
]);

export const claimStatusEnum = z.enum([
  'Pending Review',
  'Under AI Audit',
  'Approved',
  'Correction Requested',
  'Rejected',
]);

export const claimPriorityEnum = z.enum(['High', 'Medium', 'Low']);

const isValidDateOnly = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const dateOnly = (message) => z.string().refine(isValidDateOnly, { message });
const optionalDateOnly = z.preprocess(
  (value) => value === '' ? undefined : value,
  dateOnly('Invalid date of birth. Use YYYY-MM-DD.').optional()
);

export const claimSchema = z.object({
  claimantName: z
    .string()
    .trim()
    .min(2, { message: 'Patient name must be at least 2 characters.' })
    .max(80, { message: 'Patient name cannot exceed 80 characters.' }),
  claimantDob: optionalDateOnly,
  claimantGender: z.string().optional(),
  policyNumber: z
    .string()
    .trim()
    .min(5, { message: 'Policy reference must be at least 5 characters.' })
    .regex(/^POL-[A-Z0-9]+-\d+$/i, {
      message: 'Policy format should follow standard format: POL-XXX-0000',
    }),
  policyPlan: z.string().trim().min(3, { message: 'Insurance plan is required.' }),
  hospitalName: z
    .string()
    .trim()
    .min(3, { message: 'Hospital or healthcare facility name is required.' }),
  hospitalNpi: z
    .string()
    .trim()
    .regex(/^\d{10}$/, { message: 'National Provider Identifier (NPI) must be exactly 10 digits.' }),
  claimType: claimTypeEnum,
  claimAmount: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? Number.NaN : Number(value),
    z.number({ invalid_type_error: 'Claim amount must be a valid number.' })
      .finite({ message: 'Claim amount must be a finite number.' })
      .positive({ message: 'Claim amount must be greater than ₹0.00.' })
  ),
  copayAmount: z.preprocess(
    (value) => value === '' || value === undefined ? undefined : Number(value),
    z.number({ invalid_type_error: 'Copay must be a valid number.' })
      .finite({ message: 'Copay must be a finite number.' })
      .nonnegative({ message: 'Copay amount cannot be negative.' })
      .optional()
  ),
  submissionDate: dateOnly('Invalid submission date. Use YYYY-MM-DD.'),
  admissionDate: dateOnly('Invalid admission date. Use YYYY-MM-DD.'),
  dischargeDate: dateOnly('Invalid discharge date. Use YYYY-MM-DD.'),
  status: claimStatusEnum,
  priority: claimPriorityEnum,
  description: z.string().max(500, { message: 'Description cannot exceed 500 characters.' }).optional(),
}).refine(
  (data) => {
    return data.dischargeDate >= data.admissionDate;
  },
  {
    message: 'Discharge date must occur on or after admission date.',
    path: ['dischargeDate'],
  }
).refine(
  (data) => !data.claimantDob || (
    data.claimantDob <= data.admissionDate &&
    data.claimantDob <= new Date().toISOString().slice(0, 10)
  ),
  {
    message: 'Date of birth must be on or before the encounter date and cannot be in the future.',
    path: ['claimantDob'],
  }
);

/**
 * Validates a claim intake form dataset using Zod schema.
 * @param {Object} formData
 * @returns {{ success: boolean, data?: Object, errors: Record<string, string> }}
 */
export function validateClaimForm(formData) {
  const result = claimSchema.safeParse(formData);

  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (field && !errors[field]) {
        errors[field] = issue.message;
      }
    });
    return { success: false, errors };
  }

  return { success: true, data: result.data, errors: {} };
}

export const documentCategoryEnum = z.enum([
  'Hospital Bill',
  'Discharge Summary',
  'Prescription',
  'Claim Form',
  'Other Supporting Documents',
]);

export const documentFileTypeEnum = z.enum(['PDF', 'PNG', 'JPG', 'JPEG']);

export const documentUploadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: 'File name must be at least 3 characters.' })
    .regex(/\.(pdf|png|jpe?g)$/i, {
      message: 'File extension must be .pdf, .png, or .jpg/.jpeg.',
    }),
  category: documentCategoryEnum,
  sizeBytes: z
    .number()
    .positive({ message: 'File size must be greater than 0 bytes.' })
    .max(15 * 1024 * 1024, { message: 'File exceeds maximum limit of 15 MB.' }),
  claimId: z.string().trim().min(5, { message: 'Linked claim identifier is required.' }),
  description: z.string().max(300, { message: 'Description cannot exceed 300 characters.' }).optional(),
});

/**
 * Validates document metadata prior to upload processing using Zod.
 * @param {Object} docData
 * @returns {{ success: boolean, data?: Object, error?: string }}
 */
export function validateDocumentUpload(docData, maxSizeBytes = 15 * 1024 * 1024) {
  const uploadSchema = maxSizeBytes === 15 * 1024 * 1024
    ? documentUploadSchema
    : documentUploadSchema.extend({
      sizeBytes: z.number()
        .positive({ message: 'File size must be greater than 0 bytes.' })
        .max(maxSizeBytes, { message: `File exceeds maximum limit of ${maxSizeBytes} bytes.` }),
    });
  const result = uploadSchema.safeParse(docData);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Invalid document metadata.',
    };
  }
  return { success: true, data: result.data };
}
