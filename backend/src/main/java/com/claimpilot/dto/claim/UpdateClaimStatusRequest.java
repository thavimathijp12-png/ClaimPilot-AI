package com.claimpilot.dto.claim;

import com.claimpilot.entity.ClaimStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateClaimStatusRequest(@NotNull ClaimStatus status) {
}
