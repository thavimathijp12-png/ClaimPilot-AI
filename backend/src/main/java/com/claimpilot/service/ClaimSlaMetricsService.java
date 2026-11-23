package com.claimpilot.service;

import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;

@Service
public class ClaimSlaMetricsService {

    private static final Duration SLA_THRESHOLD = Duration.ofHours(48);

    public boolean isSlaBreached(Instant createdAt, Instant resolvedAt) {
        if (createdAt == null) return false;
        Instant end = resolvedAt != null ? resolvedAt : Instant.now();
        return Duration.between(createdAt, end).compareTo(SLA_THRESHOLD) > 0;
    }

    public long calculateTurnaroundHours(Instant createdAt, Instant resolvedAt) {
        if (createdAt == null || resolvedAt == null) return 0;
        return Duration.between(createdAt, resolvedAt).toHours();
    }
}
