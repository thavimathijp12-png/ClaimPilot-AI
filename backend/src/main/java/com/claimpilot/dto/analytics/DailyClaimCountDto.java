package com.claimpilot.dto.analytics;

import java.time.LocalDate;

public record DailyClaimCountDto(LocalDate date, long count) {
}
