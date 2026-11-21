package com.claimpilot.dto.approval;

import com.claimpilot.entity.ApprovalDecision;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ApprovalDecisionRequest(
        @NotNull ApprovalDecision decision,
        @Size(max = 2000) String reason,
        @DecimalMin(value = "0.00") BigDecimal approvedAmount
) {
}
