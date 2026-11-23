# Duplicate Claim Encounter Fingerprinting Rules

## Fingerprint Components
- Normalized Policy Number + Hospital NPI + Date of Admission + Total Claim Amount
- SHA-256 digested to produce 64-character unique encounter fingerprint
