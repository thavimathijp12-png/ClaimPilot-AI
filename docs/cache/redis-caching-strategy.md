# Redis Caching Strategy for Clinical Reference Codes

## Cache Configuration
- Cache ICD-10 and CPT reference dictionaries with TTL = 24 hours
- Eviction policy: `volatile-lru`
- Cache warm-up upon application boot via `ReferenceDataWarmupRunner`
