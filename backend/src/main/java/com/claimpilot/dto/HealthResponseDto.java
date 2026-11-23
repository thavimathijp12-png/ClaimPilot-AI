package com.claimpilot.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Health Status Data Transfer Object reporting backend operational health.
 */
public class HealthResponseDto {

    private String status;
    private String service;
    private String version;
    private String environment;
    private Instant timestamp;
    private Map<String, Object> systemDetails;
    private List<String> activeModules;

    public HealthResponseDto() {
        this.timestamp = Instant.now();
    }

    public HealthResponseDto(String status, String service, String version, String environment,
                             Map<String, Object> systemDetails, List<String> activeModules) {
        this.status = status;
        this.service = service;
        this.version = version;
        this.environment = environment;
        this.timestamp = Instant.now();
        this.systemDetails = systemDetails;
        this.activeModules = activeModules;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getSystemDetails() {
        return systemDetails;
    }

    public void setSystemDetails(Map<String, Object> systemDetails) {
        this.systemDetails = systemDetails;
    }

    public List<String> getActiveModules() {
        return activeModules;
    }

    public void setActiveModules(List<String> activeModules) {
        this.activeModules = activeModules;
    }
}

