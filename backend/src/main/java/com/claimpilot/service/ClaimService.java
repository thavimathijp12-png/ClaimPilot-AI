package com.claimpilot.service;

import com.claimpilot.dto.claim.ClaimCodeRequest;
import com.claimpilot.dto.claim.ClaimDto;
import com.claimpilot.dto.claim.CreateClaimRequest;
import com.claimpilot.dto.claim.UpdateClaimRequest;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimCode;
import com.claimpilot.entity.ClaimEvent;
import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.entity.DocumentStatus;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.ClaimRepository;
import com.claimpilot.repository.ClaimDocumentRepository;
import com.claimpilot.repository.UserAccountRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ClaimDocumentRepository documentRepository;
    private final UserAccountRepository userRepository;
    private final AuditService auditService;

    public ClaimService(ClaimRepository claimRepository, ClaimDocumentRepository documentRepository,
                        UserAccountRepository userRepository, AuditService auditService) {
        this.claimRepository = claimRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<ClaimDto> listClaims(ClaimStatus status) {
        List<Claim> claims = status == null
                ? claimRepository.findAllByOrderByCreatedAtDesc()
                : claimRepository.findByStatusOrderByCreatedAtDesc(status);
        return claims.stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public ClaimDto getClaim(String claimNumber) {
        return toDto(requireClaim(claimNumber));
    }

    @Transactional
    public ClaimDto createClaim(CreateClaimRequest request, String actorId) {
        validateDates(request.admissionDate(), request.dischargeDate());
        UserAccount actor = requireUser(actorId);
        UserAccount assignee = request.assignedToId() == null
                ? null : requireUser(request.assignedToId());
        Claim claim = new Claim(
                request.claimantName().trim(),
                request.policyNumber().trim(),
                request.hospitalName().trim(),
                request.claimType().trim(),
                request.claimAmount(),
                actor
        );
        claim.setOptionalFields(
                request.claimantDob(),
                clean(request.claimantGender()),
                clean(request.policyPlan()),
                clean(request.hospitalNpi()),
                request.admissionDate(),
                request.dischargeDate(),
                request.copayAmount(),
                request.priority(),
                clean(request.description()),
                clean(request.reviewNotes()),
                assignee,
                toCodes(request.diagnosisCodes()),
                toCodes(request.procedureCodes())
        );
        claim.addTimelineEvent(new ClaimEvent(actor, "Claim Created", "Claim submitted for processing."));
        Claim saved = claimRepository.save(claim);
        auditService.record(actorId, "CLAIM_CREATED", "CLAIM", saved.getClaimNumber(),
                "Claim was created.");
        return toDto(saved);
    }

    @Transactional
    public ClaimDto updateClaim(String claimNumber, UpdateClaimRequest request, String actorId) {
        Claim claim = requireClaim(claimNumber);
        if (claim.getStatus() == ClaimStatus.APPROVED || claim.getStatus() == ClaimStatus.REJECTED) {
            throw new ApiException("A finalized claim cannot be edited.", HttpStatus.CONFLICT);
        }
        LocalDate admissionDate = request.admissionDate() == null
                ? claim.getAdmissionDate() : request.admissionDate();
        LocalDate dischargeDate = request.dischargeDate() == null
                ? claim.getDischargeDate() : request.dischargeDate();
        validateDates(admissionDate, dischargeDate);

        UserAccount assignee = null;
        if (request.assignedToId() != null) {
            assignee = request.assignedToId().isBlank() ? null : requireUser(request.assignedToId());
        }
        claim.updateDetails(
                clean(request.claimantName()),
                clean(request.policyNumber()),
                clean(request.hospitalName()),
                clean(request.claimType()),
                request.claimAmount(),
                request.claimantDob(),
                clean(request.claimantGender()),
                clean(request.policyPlan()),
                clean(request.hospitalNpi()),
                request.admissionDate(),
                request.dischargeDate(),
                request.copayAmount(),
                request.priority(),
                clean(request.description()),
                clean(request.reviewNotes()),
                assignee,
                request.diagnosisCodes() == null ? null : toCodes(request.diagnosisCodes()),
                request.procedureCodes() == null ? null : toCodes(request.procedureCodes())
        );
        if (request.assignedToId() != null) {
            claim.setAssignedTo(assignee);
        }
        UserAccount actor = requireUser(actorId);
        claim.addTimelineEvent(new ClaimEvent(actor, "Claim Updated", "Claim details were updated."));
        auditService.record(actorId, "CLAIM_UPDATED", "CLAIM", claim.getClaimNumber(),
                "Claim details were updated.");
        return toDto(claim);
    }

    @Transactional
    public ClaimDto updateStatus(String claimNumber, ClaimStatus nextStatus, String actorId) {
        Claim claim = requireClaim(claimNumber);
        if (!isAllowedIntakeTransition(claim.getStatus(), nextStatus)) {
            throw new ApiException(
                    "Claim status cannot transition from " + claim.getStatus().label()
                            + " to " + nextStatus.label() + ".",
                    HttpStatus.CONFLICT
            );
        }
        UserAccount actor = requireUser(actorId);
        ClaimStatus previousStatus = claim.getStatus();
        claim.setStatus(nextStatus);
        claim.addTimelineEvent(new ClaimEvent(actor, "Status Changed to " + nextStatus.label(),
                "Status updated from " + previousStatus.label() + " to " + nextStatus.label() + "."));
        auditService.record(actorId, "CLAIM_STATUS_CHANGED", "CLAIM", claim.getClaimNumber(),
                previousStatus.name() + " -> " + nextStatus.name());
        return toDto(claim);
    }

    @Transactional
    public ClaimDto addComment(String claimNumber, String comment, String actorId) {
        Claim claim = requireClaim(claimNumber);
        UserAccount actor = requireUser(actorId);
        String text = comment.trim();
        claim.setReviewNotes(text);
        claim.addTimelineEvent(new ClaimEvent(actor, "Reviewer Comment Added", text));
        auditService.record(actorId, "CLAIM_COMMENT_ADDED", "CLAIM", claim.getClaimNumber(),
                "A claim comment was added.");
        return toDto(claim);
    }

    private Claim requireClaim(String claimNumber) {
        return claimRepository.findByClaimNumber(claimNumber)
                .orElseThrow(() -> new ApiException("Claim not found.", HttpStatus.NOT_FOUND));
    }

    private UserAccount requireUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));
    }

    private ClaimDto toDto(Claim claim) {
        int documentsCount = Math.toIntExact(documentRepository.countByClaim_ClaimNumberAndStatusNot(
                claim.getClaimNumber(), DocumentStatus.REMOVED));
        return ClaimDto.from(claim, documentsCount);
    }

    private static List<ClaimCode> toCodes(List<ClaimCodeRequest> requests) {
        return requests == null ? List.of() : requests.stream()
                .map(request -> new ClaimCode(request.code().trim(), clean(request.description())))
                .toList();
    }

    private static String clean(String value) {
        return value == null ? null : value.trim();
    }

    private static void validateDates(LocalDate admissionDate, LocalDate dischargeDate) {
        if (admissionDate != null && dischargeDate != null && dischargeDate.isBefore(admissionDate)) {
            throw new ApiException("Discharge date cannot be before admission date.");
        }
    }

    private static boolean isAllowedIntakeTransition(ClaimStatus current, ClaimStatus next) {
        return switch (current) {
            case IN_EXTRACTION -> next == ClaimStatus.UNDER_AI_AUDIT;
            case UNDER_AI_AUDIT -> next == ClaimStatus.PENDING_REVIEW;
            case CORRECTION_REQUESTED -> next == ClaimStatus.PENDING_REVIEW;
            case PENDING_REVIEW -> next == ClaimStatus.IN_EXTRACTION
                    || next == ClaimStatus.UNDER_AI_AUDIT;
            case APPROVED, REJECTED -> false;
        };
    }
}
