package com.claimpilot.dto.analytics;

import com.claimpilot.entity.ClaimStatus;

public record ClaimStatusCountDto(ClaimStatus status, long count) {
    public String label() {
        return status.label();
    }
}
