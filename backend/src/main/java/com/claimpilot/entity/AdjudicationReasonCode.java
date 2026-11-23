package com.claimpilot.entity;

/**
 * Standardized clinical adjudication reason codes for claim decision workflows.
 */
public enum AdjudicationReasonCode {
    CLINICAL_CRITERIA_MET("Clinical necessity criteria fully satisfied and documented"),
    MEDICAL_NECESSITY_UNPROVEN("Clinical records do not demonstrate medical necessity for procedure"),
    PREAUTH_MISSING("Required prior authorization reference is missing or expired"),
    PROCEDURE_DIAGNOSIS_MISMATCH("CPT procedure code does not align with reported ICD-10 diagnosis"),
    DUPLICATE_CLAIM_SUBMISSION("Identical encounter and service billed within timely filing window"),
    INSUFFICIENT_CLINICAL_DOCUMENTATION("Supporting clinical notes, operative report, or discharge summary missing"),
    TIMELY_FILING_EXCEEDED("Encounter date exceeds standard 90-day payer filing limitation"),
    POLICY_BENEFIT_EXHAUSTED("Patient annual or lifetime benefit maximum exceeded for plan tier");

    private final String description;

    AdjudicationReasonCode(String description) {
        this.description = description;
    }

    public String description() {
        return description;
    }
}
