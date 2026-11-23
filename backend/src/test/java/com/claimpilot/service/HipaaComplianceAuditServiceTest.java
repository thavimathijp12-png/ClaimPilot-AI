package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class HipaaComplianceAuditServiceTest {

    private HipaaComplianceAuditService auditService;

    @BeforeEach
    void setUp() {
        auditService = new HipaaComplianceAuditService();
    }

    @Test
    void shouldDetectUnmaskedSsn() {
        List<String> findings = auditService.inspectText("Patient SSN is 123-45-6789 on intake form");
        assertFalse(findings.isEmpty());
        assertTrue(findings.get(0).contains("SSN"));
    }

    @Test
    void shouldPassCleanClinicalText() {
        List<String> findings = auditService.inspectText("Patient presented with acute fever and mild cough.");
        assertTrue(findings.isEmpty());
    }
}
