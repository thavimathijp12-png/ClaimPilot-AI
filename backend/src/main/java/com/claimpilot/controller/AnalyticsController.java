package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.analytics.AnalyticsOverviewDto;
import com.claimpilot.dto.analytics.ClaimReportPageDto;
import com.claimpilot.dto.analytics.DailyClaimCountDto;
import com.claimpilot.dto.analytics.ClaimStatusCountDto;
import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN','ANALYST','AUDITOR','OPERATOR','REVIEWER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<ApiResponse<AnalyticsOverviewDto>> overview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverview(from, to)));
    }

    @GetMapping("/analytics/claims-by-status")
    public ResponseEntity<ApiResponse<List<ClaimStatusCountDto>>> claimsByStatus(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getClaimsByStatus(from, to)));
    }

    @GetMapping("/analytics/trends")
    public ResponseEntity<ApiResponse<List<DailyClaimCountDto>>> trends(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDailyTrends(from, to)));
    }

    @GetMapping("/reports/claims")
    @PreAuthorize("hasAnyRole('ADMIN','ANALYST','AUDITOR','OPERATOR','REVIEWER')")
    public ResponseEntity<ApiResponse<ClaimReportPageDto>> report(
            @RequestParam(required = false) ClaimStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getClaimReport(status, from, to, page, size)
        ));
    }
}
