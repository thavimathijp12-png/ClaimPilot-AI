# SHA-256 Audit Trail Tamper-Evidence Specification

## Chain Hashing
Each audit log entry computes `Hash(n) = SHA256(EventData(n) + Hash(n-1))`, guaranteeing cryptographic immutability.
