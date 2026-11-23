package com.claimpilot.service;

import com.claimpilot.dto.analytics.AnalyticsOverviewDto;
import com.claimpilot.dto.analytics.ClaimReportPageDto;
import com.claimpilot.dto.analytics.ClaimStatusCountDto;
import com.claimpilot.dto.analytics.DailyClaimCountDto;
import com.claimpilot.dto.claim.ClaimDto;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.entity.DocumentStatus;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.ClaimDocumentRepository;
import com.claimpilot.repository.ClaimRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class AnalyticsService {

    private final ClaimRepository claimRepository;
    private final ClaimDocumentRepository documentRepository;

    public AnalyticsService(ClaimRepository claimRepository, ClaimDocumentRepository documentRepository) {
        this.claimRepository = claimRepository;
        this.documentRepository = documentRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsOverviewDto getOverview(LocalDate requestedFrom, LocalDate requestedTo) {
        DateRange range = resolveRange(requestedFrom, requestedTo);
        List<ClaimStatusCountDto> statusCounts =
                claimRepository.countByStatusBetween(range.from(), range.to());
        return new AnalyticsOverviewDto(
                range.from(),
                range.to(),
                claimRepository.countBySubmissionDateBetween(range.from(), range.to()),
                claimRepository.countByStatusAndSubmissionDateBetween(
                        ClaimStatus.PENDING_REVIEW, range.from(), range.to()),
                claimRepository.countByStatusAndSubmissionDateBetween(
                        ClaimStatus.APPROVED, range.from(), range.to()),
                claimRepository.countByStatusAndSubmissionDateBetween(
                        ClaimStatus.REJECTED, range.from(), range.to()),
                documentRepository.countByStatusNot(DocumentStatus.REMOVED),
                "INR",
                zeroIfNull(claimRepository.sumClaimAmountBetween(range.from(), range.to())),
                zeroIfNull(claimRepository.sumApprovedAmountBetween(range.from(), range.to())),
                claimRepository.averageDataQualityBetween(range.from(), range.to()),
                statusCounts
        );
    }

    @Transactional(readOnly = true)
    public List<DailyClaimCountDto> getDailyTrends(LocalDate requestedFrom, LocalDate requestedTo) {
        DateRange range = resolveRange(requestedFrom, requestedTo);
        return claimRepository.countBySubmissionDateGrouped(range.from(), range.to());
    }

    @Transactional(readOnly = true)
    public List<ClaimStatusCountDto> getClaimsByStatus(LocalDate requestedFrom, LocalDate requestedTo) {
        DateRange range = resolveRange(requestedFrom, requestedTo);
        return claimRepository.countByStatusBetween(range.from(), range.to());
    }

    @Transactional(readOnly = true)
    public ClaimReportPageDto getClaimReport(ClaimStatus status, LocalDate requestedFrom,
                                             LocalDate requestedTo, int page, int size) {
        DateRange range = resolveRange(requestedFrom, requestedTo);
        if (page < 0 || size < 1 || size > 200) {
            throw new ApiException("Page must be non-negative and size must be between 1 and 200.");
        }
        Specification<Claim> spec = (root, query, criteria) ->
                criteria.between(root.get("submissionDate"), range.from(), range.to());
        if (status != null) {
            spec = spec.and((root, query, criteria) -> criteria.equal(root.get("status"), status));
        }
        Page<ClaimDto> result = claimRepository.findAll(spec, PageRequest.of(
                        page, size, Sort.by(Sort.Direction.DESC, "submissionDate", "createdAt")))
                .map(claim -> ClaimDto.from(
                        claim,
                        Math.toIntExact(documentRepository.countByClaim_ClaimNumberAndStatusNot(
                                claim.getClaimNumber(), DocumentStatus.REMOVED))
                ));
        return ClaimReportPageDto.from(result, range.from(), range.to(),
                status == null ? null : status.label());
    }

    private static BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private static DateRange resolveRange(LocalDate from, LocalDate to) {
        LocalDate resolvedTo = to == null ? LocalDate.now() : to;
        LocalDate resolvedFrom = from == null ? resolvedTo.minusDays(29) : from;
        if (resolvedFrom.isAfter(resolvedTo)) {
            throw new ApiException("The from date cannot be after the to date.", HttpStatus.BAD_REQUEST);
        }
        if (resolvedFrom.plusYears(5).isBefore(resolvedTo)) {
            throw new ApiException("Date range cannot exceed five years.", HttpStatus.BAD_REQUEST);
        }
        return new DateRange(resolvedFrom, resolvedTo);
    }

    private record DateRange(LocalDate from, LocalDate to) { }
}
