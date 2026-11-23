package com.claimpilot.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ClaimStatusTransitionGuardTest {

    @Test
    void shouldAllowPendingReviewToTerminalStates() {
        assertTrue(ClaimStatusTransitionGuard.canTransition(ClaimStatus.PENDING_REVIEW, ClaimStatus.APPROVED));
        assertTrue(ClaimStatusTransitionGuard.canTransition(ClaimStatus.PENDING_REVIEW, ClaimStatus.REJECTED));
        assertTrue(ClaimStatusTransitionGuard.canTransition(ClaimStatus.PENDING_REVIEW, ClaimStatus.CORRECTION_REQUESTED));
    }

    @Test
    void shouldRejectTransitionsFromTerminalStates() {
        assertFalse(ClaimStatusTransitionGuard.canTransition(ClaimStatus.APPROVED, ClaimStatus.PENDING_REVIEW));
        assertFalse(ClaimStatusTransitionGuard.canTransition(ClaimStatus.REJECTED, ClaimStatus.APPROVED));
    }
}
