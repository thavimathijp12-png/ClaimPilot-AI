package com.claimpilot.dto.claim;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClaimCommentRequest(@NotBlank @Size(max = 2000) String comment) {
}
