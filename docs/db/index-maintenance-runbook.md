# PostgreSQL Index Maintenance & Vacuum Runbook

## Scheduled Tasks
- Daily autovacuum tuning for high-throughput claims table
- Weekly REINDEX CONCURRENTLY on `claims_status_idx` and `audit_log_timestamp_idx`
