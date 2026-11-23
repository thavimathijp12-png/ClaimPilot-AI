# ClaimPilot AI High Availability & Disaster Recovery Topology

## Architecture
- Multi-AZ Kubernetes cluster deployment
- Read-replica PostgreSQL database with automated failover (< 30s RTO)
- Offsite daily encrypted backups to dual cloud storage (RPO < 1 hour)
