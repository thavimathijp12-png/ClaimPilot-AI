package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.claim.ClaimCommentRequest;
import com.claimpilot.dto.claim.ClaimDto;
import com.claimpilot.dto.claim.CreateClaimRequest;
import com.claimpilot.dto.claim.UpdateClaimRequest;
import com.claimpilot.dto.claim.UpdateClaimStatusRequest;
import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.ClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/claims")
@PreAuthorize("hasAnyRole('ADMIN','OPERATOR','REVIEWER','AUDITOR')")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClaimDto>>> listClaims(
            @RequestParam(required = false) ClaimStatus status) {
        return ResponseEntity.ok(ApiResponse.success(claimService.listClaims(status)));
    }

    @GetMapping("/{claimNumber}")
    public ResponseEntity<ApiResponse<ClaimDto>> getClaim(@PathVariable String claimNumber) {
        return ResponseEntity.ok(ApiResponse.success(claimService.getClaim(claimNumber)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<ClaimDto>> createClaim(
            @Valid @RequestBody CreateClaimRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Claim created.", claimService.createClaim(request, principal.id()))
        );
    }

    @PutMapping("/{claimNumber}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<ClaimDto>> updateClaim(
            @PathVariable String claimNumber,
            @Valid @RequestBody UpdateClaimRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Claim updated.", claimService.updateClaim(claimNumber, request, principal.id())
        ));
    }

    @PatchMapping("/{claimNumber}/status")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<ClaimDto>> updateStatus(
            @PathVariable String claimNumber,
            @Valid @RequestBody UpdateClaimStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Claim status updated.",
                claimService.updateStatus(claimNumber, request.status(), principal.id())
        ));
    }

    @PostMapping("/{claimNumber}/comments")
    public ResponseEntity<ApiResponse<ClaimDto>> addComment(
            @PathVariable String claimNumber,
            @Valid @RequestBody ClaimCommentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "Comment added.", claimService.addComment(claimNumber, request.comment(), principal.id())
        ));
    }
}
