package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.Duration;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class ClaimSlaMetricsServiceTest {

    private ClaimSlaMetricsService slaService;

    @BeforeEach
    void setUp() {
        slaService = new ClaimSlaMetricsService();
    }

    @Test
    void shouldDetectSlaBreachWhenOver48Hours() {
        Instant created = Instant.now().minus(Duration.ofHours(50));
        Instant resolved = Instant.now();
        assertTrue(slaService.isSlaBreached(created, resolved));
    }

    @Test
    void shouldPassWhenWithin48Hours() {
        Instant created = Instant.now().minus(Duration.ofHours(24));
        Instant resolved = Instant.now();
        assertFalse(slaService.isSlaBreached(created, resolved));
        assertEquals(24, slaService.calculateTurnaroundHours(created, resolved));
    }
}
