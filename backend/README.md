# ClaimPilot AI — Backend Service

> **Note**: Comprehensive project documentation, full-stack architecture, database schema, REST API specifications, and troubleshooting guides have been consolidated into the root [README.md](../README.md).

## Quick Backend Execution

From the repository root in PowerShell:

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:DB_URL = "jdbc:mysql://localhost:3306/claimpilot_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your_mysql_password"

& ".\.mvn-portable\bin\mvn.cmd" -f "backend\pom.xml" spring-boot:run
```

- Public Health Check: `http://localhost:8081/api/health`
- Full API Reference: See [README.md](../README.md#4-rest-api-reference)
