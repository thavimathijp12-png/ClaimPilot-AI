package com.claimpilot.entity;

import java.util.Map;
import java.util.Set;

public final class ClaimStatusTransitionGuard {

    private static final Map<ClaimStatus, Set<ClaimStatus>> ALLOWED_TRANSITIONS = Map.of(
            ClaimStatus.PENDING_REVIEW, Set.of(ClaimStatus.APPROVED, ClaimStatus.REJECTED, ClaimStatus.CORRECTION_REQUESTED),
            ClaimStatus.CORRECTION_REQUESTED, Set.of(ClaimStatus.PENDING_REVIEW, ClaimStatus.REJECTED),
            ClaimStatus.APPROVED, Set.of(),
            ClaimStatus.REJECTED, Set.of()
    );

    private ClaimStatusTransitionGuard() {}

    public static boolean canTransition(ClaimStatus from, ClaimStatus to) {
        if (from == null || to == null) return false;
        if (from == to) return true;
        Set<ClaimStatus> targetStatuses = ALLOWED_TRANSITIONS.get(from);
        return targetStatuses != null && targetStatuses.contains(to);
    }
}
