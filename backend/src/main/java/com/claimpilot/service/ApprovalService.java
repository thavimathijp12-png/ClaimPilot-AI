package com.claimpilot.service;

import com.claimpilot.dto.approval.ApprovalDecisionRequest;
import com.claimpilot.dto.approval.ApprovalQueueItemDto;
import com.claimpilot.dto.approval.ClaimApprovalDto;
import com.claimpilot.dto.claim.ClaimDto;
import com.claimpilot.entity.ApprovalDecision;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimApproval;
import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.entity.DataGuardRun;
import com.claimpilot.entity.DocumentStatus;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.ClaimApprovalRepository;
import com.claimpilot.repository.ClaimDocumentRepository;
import com.claimpilot.repository.ClaimRepository;
import com.claimpilot.repository.DataGuardRunRepository;
import com.claimpilot.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class ApprovalService {

    private final ClaimRepository claimRepository;
    private final ClaimApprovalRepository approvalRepository;
    private final ClaimDocumentRepository documentRepository;
    private final DataGuardRunRepository dataGuardRunRepository;
    private final UserAccountRepository userRepository;
    private final AuditService auditService;

    public ApprovalService(ClaimRepository claimRepository,
                           ClaimApprovalRepository approvalRepository,
                           ClaimDocumentRepository documentRepository,
                           DataGuardRunRepository dataGuardRunRepository,
                           UserAccountRepository userRepository,
                           AuditService auditService) {
        this.claimRepository = claimRepository;
        this.approvalRepository = approvalRepository;
        this.documentRepository = documentRepository;
        this.dataGuardRunRepository = dataGuardRunRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<ApprovalQueueItemDto> getQueue() {
        return claimRepository.findByStatusOrderByCreatedAtDesc(ClaimStatus.PENDING_REVIEW)
                .stream().map(this::toQueueItem).toList();
    }

    @Transactional(readOnly = true)
    public List<ClaimApprovalDto> getHistory(String claimNumber) {
        if (!claimRepository.existsByClaimNumber(claimNumber)) {
            throw new ApiException("Claim not found.", HttpStatus.NOT_FOUND);
        }
        return approvalRepository.findByClaim_ClaimNumberOrderByDecidedAtDesc(claimNumber)
                .stream().map(ClaimApprovalDto::from).toList();
    }

    @Transactional
    public ClaimApprovalDto decide(String claimNumber, ApprovalDecisionRequest request, String actorId) {
        Claim claim = claimRepository.findByClaimNumberForUpdate(claimNumber)
                .orElseThrow(() -> new ApiException("Claim not found.", HttpStatus.NOT_FOUND));
        if (claim.getStatus() != ClaimStatus.PENDING_REVIEW) {
            throw new ApiException("Only claims pending review can receive an approval decision.",
                    HttpStatus.CONFLICT);
        }

        if (request.decision() == ApprovalDecision.APPROVE) {
            DataGuardRun latestRun = dataGuardRunRepository
                    .findTopByClaim_ClaimNumberOrderByLastCheckedDesc(claimNumber)
                    .orElseThrow(() -> new ApiException(
                            "Run DataGuard validation before approving this claim.", HttpStatus.CONFLICT));
            List<String> blockers = validationBlockers(latestRun);
            if (!blockers.isEmpty()) {
                throw new ApiException("Claim cannot be approved until DataGuard issues are resolved: "
                        + String.join("; ", blockers), HttpStatus.CONFLICT);
            }
        }

        UserAccount reviewer = userRepository.findById(actorId)
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));
        String reason = request.reason() == null ? null : request.reason().trim();
        BigDecimal approvedAmount = null;
        ClaimStatus nextStatus;
        switch (request.decision()) {
            case APPROVE -> {
                approvedAmount = request.approvedAmount() == null
                        ? claim.getClaimAmount() : request.approvedAmount();
                if (approvedAmount.signum() < 0 || approvedAmount.compareTo(claim.getClaimAmount()) > 0) {
                    throw new ApiException("Approved amount must be between zero and the claimed amount.");
                }
                nextStatus = ClaimStatus.APPROVED;
            }
            case REJECT -> {
                requireReason(reason);
                approvedAmount = BigDecimal.ZERO;
                nextStatus = ClaimStatus.REJECTED;
            }
            case REQUEST_CORRECTION -> {
                requireReason(reason);
                approvedAmount = BigDecimal.ZERO;
                nextStatus = ClaimStatus.CORRECTION_REQUESTED;
            }
            default -> throw new ApiException("Unsupported approval decision.");
        }

        claim.applyApprovalDecision(nextStatus, approvedAmount, reason);
        claim.addTimelineEvent(new com.claimpilot.entity.ClaimEvent(
                reviewer,
                titleFor(request.decision()),
                reason == null || reason.isBlank() ? "Claim " + nextStatus.label().toLowerCase() + "."
                        : reason
        ));
        ClaimApproval approval = approvalRepository.saveAndFlush(new ClaimApproval(
                claim, reviewer, request.decision(), reason, approvedAmount
        ));
        auditService.record(actorId, "APPROVAL_DECIDED", "CLAIM", claimNumber,
                "Decision=" + request.decision().name() + ".");
        return ClaimApprovalDto.from(approval);
    }

    private ApprovalQueueItemDto toQueueItem(Claim claim) {
        DataGuardRun latest = dataGuardRunRepository
                .findTopByClaim_ClaimNumberOrderByLastCheckedDesc(claim.getClaimNumber())
                .orElse(null);
        List<String> blockers = latest == null
                ? List.of("DataGuard validation has not been run.")
                : validationBlockers(latest);
        int documentCount = Math.toIntExact(documentRepository.countByClaim_ClaimNumberAndStatusNot(
                claim.getClaimNumber(), DocumentStatus.REMOVED));
        return new ApprovalQueueItemDto(
                ClaimDto.from(claim, documentCount),
                blockers.isEmpty(),
                latest == null ? null : latest.getScore(),
                blockers
        );
    }

    private static List<String> validationBlockers(DataGuardRun run) {
        List<String> blockers = new ArrayList<>();
        if (run.getMissingCount() > 0) blockers.add("missing data");
        if (run.getInvalidCount() > 0) blockers.add("invalid data");
        if (run.getInconsistentCount() > 0) blockers.add("inconsistent data");
        if (run.getDuplicateWarningsCount() > 0) blockers.add("possible duplicate claim");
        return blockers;
    }

    private static void requireReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new ApiException("A reason is required for rejection or correction.");
        }
    }

    private static String titleFor(ApprovalDecision decision) {
        return switch (decision) {
            case APPROVE -> "Claim Approved";
            case REJECT -> "Claim Rejected";
            case REQUEST_CORRECTION -> "Correction Requested";
        };
    }
}
