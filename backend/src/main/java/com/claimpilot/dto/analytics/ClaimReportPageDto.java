package com.claimpilot.dto.analytics;

import com.claimpilot.dto.claim.ClaimDto;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.util.List;

public record ClaimReportPageDto(
        List<ClaimDto> content,
        long totalElements,
        int totalPages,
        int page,
        int size,
        LocalDate from,
        LocalDate to,
        String status
) {
    public static ClaimReportPageDto from(Page<ClaimDto> result, LocalDate from, LocalDate to,
                                          String status) {
        return new ClaimReportPageDto(
                result.getContent(), result.getTotalElements(), result.getTotalPages(),
                result.getNumber(), result.getSize(), from, to, status
        );
    }
}
