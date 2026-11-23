package com.claimpilot.dto.analytics;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AnalyticsOverviewDto(
        LocalDate from,
        LocalDate to,
        long totalClaims,
        long pendingClaims,
        long approvedClaims,
        long rejectedClaims,
        long totalDocuments,
        String currency,
        BigDecimal totalClaimedAmount,
        BigDecimal totalApprovedAmount,
        BigDecimal averageDataQualityScore,
        List<ClaimStatusCountDto> claimsByStatus
) {
}
