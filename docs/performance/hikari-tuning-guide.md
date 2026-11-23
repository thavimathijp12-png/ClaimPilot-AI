# HikariCP Database Connection Pool Tuning Guidelines

## Recommendations
- `maximum-pool-size: 20`
- `minimum-idle: 10`
- `idle-timeout: 300000` (5 minutes)
- `max-lifetime: 1800000` (30 minutes)
- `connection-timeout: 20000` (20 seconds)
