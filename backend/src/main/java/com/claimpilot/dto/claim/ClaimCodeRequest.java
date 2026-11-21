package com.claimpilot.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClaimCodeRequest(
        @NotBlank @Size(max = 32) String code,
        @Size(max = 500) String description
) {
}
