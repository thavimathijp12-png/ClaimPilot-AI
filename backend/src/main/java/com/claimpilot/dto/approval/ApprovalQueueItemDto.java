package com.claimpilot.dto.approval;

import com.claimpilot.dto.claim.ClaimDto;

import java.util.List;

public record ApprovalQueueItemDto(
        ClaimDto claim,
        boolean eligible,
        Integer dataGuardScore,
        List<String> blockers
) {
}
