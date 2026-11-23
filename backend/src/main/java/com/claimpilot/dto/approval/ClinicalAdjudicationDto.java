package com.claimpilot.dto.approval;

import com.claimpilot.entity.AdjudicationReasonCode;
import com.claimpilot.entity.ApprovalDecision;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Detailed clinical adjudication result returned to reviewer workflows.
 */
public record ClinicalAdjudicationDto(
        String claimNumber,
        ApprovalDecision decision,
        AdjudicationReasonCode reasonCode,
        boolean medicalNecessityVerified,
        boolean preauthVerified,
        boolean diagnosisProcedureCongruent,
        BigDecimal recommendedAmount,
        List<String> clinicalFindings,
        Instant evaluatedAt
) {
}
