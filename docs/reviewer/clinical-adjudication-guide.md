# ClaimPilot AI — Clinical Adjudication & Reviewer Handbook

## 1. Overview
The ClaimPilot AI Reviewer module empowers clinical adjudicators to review claims requiring human-in-the-loop oversight. This handbook outlines standardized reason codes, pre-authorization verification policies, and audit evaluation procedures.

## 2. Standardized Reason Codes (`AdjudicationReasonCode`)

| Code | Trigger Criteria | Recommended Decision | Next Action |
| :--- | :--- | :--- | :--- |
| `CLINICAL_CRITERIA_MET` | Complete documentation, congruent codes, valid pre-auth. | `APPROVE` | Route to payment settlement queue. |
| `MEDICAL_NECESSITY_UNPROVEN` | Encounter notes do not justify level of care or inpatient admission. | `REJECT` | Issue denial notice with clinical rationale. |
| `PREAUTH_MISSING` | Claim exceeds ₹1,00,000 threshold without prior authorization token. | `REQUEST_CORRECTION` | Notify operator to request pre-auth retro-review. |
| `PROCEDURE_DIAGNOSIS_MISMATCH` | Incompatible CPT and ICD-10 pair. | `REQUEST_CORRECTION` | Operator clinical recoding. |
| `INSUFFICIENT_CLINICAL_DOCUMENTATION` | Operative notes, lab results, or discharge summary missing. | `REQUEST_CORRECTION` | Operator document intake upload. |
| `TIMELY_FILING_EXCEEDED` | Submission date exceeds 90-day payer policy limit. | `REJECT` | Administrative denial. |
| `POLICY_BENEFIT_EXHAUSTED` | Annual or lifetime policy maximum reached. | `REJECT` | Partial payment or patient responsibility notice. |

## 3. High-Value Adjudication Thresholds
- **Tier 1 (≤ ₹50,000)**: Auto-audit eligible; spot-check review.
- **Tier 2 (₹50,001 – ₹1,00,000)**: Standard human adjudication; verify diagnostic codes.
- **Tier 3 (> ₹1,00,000)**: Mandatory clinical review; verified prior authorization reference required.

## 4. Audit Trail Integration
Every decision committed by a reviewer automatically generates an immutable `AuditEvent` logged with the reviewer's user ID, timestamp, decision payload, and IP address.
