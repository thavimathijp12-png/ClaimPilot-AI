package com.claimpilot.service;

import com.claimpilot.entity.ClaimStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ClaimLifecycleEventPublisherTest {

    private ClaimLifecycleEventPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new ClaimLifecycleEventPublisher();
    }

    @Test
    void shouldRecordStatusChangeEvent() {
        publisher.publishStatusChangeEvent("CLM-001", ClaimStatus.PENDING_REVIEW, ClaimStatus.APPROVED, "reviewer-1");
        assertEquals(1, publisher.getEventLog().size());
        assertTrue(publisher.getEventLog().get(0).contains("CLM-001"));
        assertTrue(publisher.getEventLog().get(0).contains("APPROVED"));
    }
}
