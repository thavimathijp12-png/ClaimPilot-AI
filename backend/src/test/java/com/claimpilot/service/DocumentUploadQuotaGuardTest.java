package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DocumentUploadQuotaGuardTest {

    private DocumentUploadQuotaGuard quotaGuard;

    @BeforeEach
    void setUp() {
        quotaGuard = new DocumentUploadQuotaGuard();
    }

    @Test
    void shouldAllowUploadWithinLimits() {
        assertTrue(quotaGuard.canUpload(3, 10_000_000L, 5_000_000L));
    }

    @Test
    void shouldRejectWhenExceedingMaxDocsOrBytes() {
        assertFalse(quotaGuard.canUpload(10, 1_000L, 1_000L));
        assertFalse(quotaGuard.canUpload(2, 51_000_000L, 2_000_000L));
    }
}
