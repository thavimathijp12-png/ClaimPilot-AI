package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.dataguard.DataGuardRunDto;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.DataGuardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN','OPERATOR','REVIEWER','AUDITOR','DATA_STEWARD')")
public class DataGuardController {

    private final DataGuardService dataGuardService;

    public DataGuardController(DataGuardService dataGuardService) {
        this.dataGuardService = dataGuardService;
    }

    @PostMapping("/claims/{claimNumber}/validations")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR','DATA_STEWARD')")
    public ResponseEntity<ApiResponse<DataGuardRunDto>> run(
            @PathVariable String claimNumber,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "DataGuard validation completed.",
                dataGuardService.run(claimNumber, principal.id())
        ));
    }

    @GetMapping("/claims/{claimNumber}/validations")
    public ResponseEntity<ApiResponse<List<DataGuardRunDto>>> list(@PathVariable String claimNumber) {
        return ResponseEntity.ok(ApiResponse.success(dataGuardService.listForClaim(claimNumber)));
    }

    @GetMapping("/validations/{runId}")
    public ResponseEntity<ApiResponse<DataGuardRunDto>> get(@PathVariable String runId) {
        return ResponseEntity.ok(ApiResponse.success(dataGuardService.getRun(runId)));
    }
}
