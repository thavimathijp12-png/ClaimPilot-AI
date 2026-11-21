package com.claimpilot.dto.approval;

import com.claimpilot.entity.ClaimApproval;

import java.math.BigDecimal;
import java.time.Instant;

public record ClaimApprovalDto(
        String id,
        String claimId,
        String reviewer,
        String decision,
        String reason,
        BigDecimal approvedAmount,
        Instant decidedAt
) {
    public static ClaimApprovalDto from(ClaimApproval approval) {
        return new ClaimApprovalDto(
                approval.getId(),
                approval.getClaim().getClaimNumber(),
                approval.getReviewer().getName(),
                approval.getDecision().name(),
                approval.getReason(),
                approval.getApprovedAmount(),
                approval.getDecidedAt()
        );
    }
}
