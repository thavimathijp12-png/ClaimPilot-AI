package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.HealthResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.lang.management.ManagementFactory;

/**
 * Health Check Controller for ClaimPilot AI.
 * Provides public monitoring of backend service status, operational readiness,
 * and live database connectivity.
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    private final String activeProfile;
    private final DataSource dataSource;

    private static final List<String> ACTIVE_MODULES = Arrays.asList(
            "Health Check",
            "Database Connectivity",
            "Authentication and User Management",
            "Claims Management",
            "Document Management",
            "DataGuard Validation",
            "Human Approval Workflow",
            "Audit Logging",
            "Analytics and Reporting"
    );

    public HealthController(@Value("${spring.profiles.active:default}") String activeProfile,
                            DataSource dataSource) {
        this.activeProfile = activeProfile;
        this.dataSource = dataSource;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<HealthResponseDto>> getHealthStatus() {
        Map<String, Object> details = new HashMap<>();

        boolean dbConnected = false;
        String dbStatusMessage;

        if (dataSource != null) {
            try (Connection conn = dataSource.getConnection()) {
                if (conn != null && conn.isValid(2)) {
                    dbConnected = true;
                    dbStatusMessage = "UP";
                } else {
                    dbStatusMessage = "DOWN: Connection validation failed";
                }
            } catch (SQLException ex) {
                dbConnected = false;
                log.warn("Health check could not validate the database connection", ex);
                dbStatusMessage = "DOWN";
            }
        } else {
            dbStatusMessage = "UNKNOWN: No DataSource configured";
        }

        details.put("database", "MySQL 8 (Hibernate / Spring Data JPA)");
        details.put("databaseStatus", dbStatusMessage);
        details.put("security", "Spring Security 6 (Stateless JWT)");
        details.put("javaVersion", System.getProperty("java.version"));
        details.put("jvmVendor", System.getProperty("java.vendor"));
        details.put("uptimeMs", ManagementFactory.getRuntimeMXBean().getUptime());

        String overallStatus = dbConnected ? "UP" : "DEGRADED";

        HealthResponseDto healthDto = new HealthResponseDto(
                overallStatus,
                "ClaimPilot AI Backend",
                "1.0.0",
                activeProfile,
                details,
                ACTIVE_MODULES
        );

        return ResponseEntity.ok(ApiResponse.success("ClaimPilot AI backend services are operational.", healthDto));
    }
}

