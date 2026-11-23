# Docker Container Build & Deployment Runbook

## Build Strategy
- Multi-stage build with Eclipse Temurin JDK 21 Alpine for minimal image attack surface
- Non-root user execution (`claimpilot` uid: 10001)
- Healthcheck probe configured via Spring Boot Actuator `/actuator/health`
