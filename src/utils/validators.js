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

export const claimSchema = z.object({
  claimantName: z
    .string()
    .trim()
    .min(2, { message: 'Patient name must be at least 2 characters.' })
    .max(80, { message: 'Patient name cannot exceed 80 characters.' }),
  claimantDob: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date of birth format.' })
    .optional(),
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
  claimAmount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((n) => !isNaN(n) && n > 0, { message: 'Claim amount must be a positive number greater than ₹0.00.' }),
  copayAmount: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine((n) => !isNaN(n) && n >= 0, { message: 'Copay amount cannot be negative.' })
    .optional(),
  submissionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid submission date.' }),
  admissionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid admission date.' }),
  dischargeDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid discharge date.' }),
  status: claimStatusEnum,
  priority: claimPriorityEnum,
  description: z.string().max(500, { message: 'Description cannot exceed 500 characters.' }).optional(),
}).refine(
  (data) => {
    if (data.admissionDate && data.dischargeDate) {
      return new Date(data.dischargeDate) >= new Date(data.admissionDate);
    }
    return true;
  },
  {
    message: 'Discharge date must occur on or after admission date.',
    path: ['dischargeDate'],
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
export function validateDocumentUpload(docData) {
  const result = documentUploadSchema.safeParse(docData);
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Invalid document metadata.',
    };
  }
  return { success: true, data: result.data };
}
