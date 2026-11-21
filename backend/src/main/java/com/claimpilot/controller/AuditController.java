package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.audit.AuditPageDto;
import com.claimpilot.dto.audit.AuditEventDto;
import com.claimpilot.service.AuditService;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AuditPageDto>> search(
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) String resourceId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<AuditEventDto> result = auditService.search(resourceType, resourceId, from, to, page, size);
        return ResponseEntity.ok(ApiResponse.success(AuditPageDto.from(result)));
    }
}
