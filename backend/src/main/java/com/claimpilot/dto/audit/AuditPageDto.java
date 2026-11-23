package com.claimpilot.dto.audit;

import org.springframework.data.domain.Page;

import java.util.List;

public record AuditPageDto(
        List<AuditEventDto> content,
        long totalElements,
        int totalPages,
        int page,
        int size
) {
    public static AuditPageDto from(Page<AuditEventDto> result) {
        return new AuditPageDto(
                result.getContent(), result.getTotalElements(), result.getTotalPages(),
                result.getNumber(), result.getSize()
        );
    }
}
