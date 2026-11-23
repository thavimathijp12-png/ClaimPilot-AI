# Claim Priority Scoring Engine Architecture

## Overview
Defines weighted priority scoring for incoming healthcare claims based on patient risk, SLA proximity, claim amount, and fraud flags.

### Scoring Algorithm
- High Severity / ICU: +40 pts
- SLA Expiry < 24h: +30 pts
- Claim Amount > $10,000: +20 pts
- AI Confidence < 0.70: +10 pts
