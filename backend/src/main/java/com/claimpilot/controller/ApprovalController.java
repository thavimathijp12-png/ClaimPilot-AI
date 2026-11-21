package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.approval.ApprovalDecisionRequest;
import com.claimpilot.dto.approval.ApprovalQueueItemDto;
import com.claimpilot.dto.approval.ClaimApprovalDto;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.ApprovalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN','REVIEWER','AUDITOR')")
public class ApprovalController {

    private final ApprovalService approvalService;

    public ApprovalController(ApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping("/approvals")
    public ResponseEntity<ApiResponse<List<ApprovalQueueItemDto>>> queue() {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getQueue()));
    }

    @GetMapping("/claims/{claimNumber}/approvals")
    public ResponseEntity<ApiResponse<List<ClaimApprovalDto>>> history(@PathVariable String claimNumber) {
        return ResponseEntity.ok(ApiResponse.success(approvalService.getHistory(claimNumber)));
    }

    @PostMapping("/approvals/{claimNumber}/decisions")
    @PreAuthorize("hasAnyRole('ADMIN','REVIEWER')")
    public ResponseEntity<ApiResponse<ClaimApprovalDto>> decide(
            @PathVariable String claimNumber,
            @Valid @RequestBody ApprovalDecisionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Approval decision recorded.",
                approvalService.decide(claimNumber, request, principal.id())
        ));
    }
}
