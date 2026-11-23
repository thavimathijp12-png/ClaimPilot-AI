package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class ClaimDuplicateDetectorServiceTest {

    private ClaimDuplicateDetectorService detector;

    @BeforeEach
    void setUp() {
        detector = new ClaimDuplicateDetectorService();
    }

    @Test
    void shouldGenerateConsistentFingerprint() {
        LocalDate date = LocalDate.of(2026, 11, 20);
        String fp1 = detector.generateFingerprint("POL-123", "1234567890", date);
        String fp2 = detector.generateFingerprint("pol-123", "1234567890", date);
        assertNotNull(fp1);
        assertEquals(fp1, fp2);
    }
}
