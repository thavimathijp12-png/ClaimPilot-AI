# Document OCR Confidence Scoring & Fallback Rules

## Thresholds
- Confidence >= 0.85: Automated field extraction & ingestion
- 0.60 <= Confidence < 0.85: Flag for Operator manual verification
- Confidence < 0.60: Prompt operator for manual keying or higher-res scan upload
