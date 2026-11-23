package com.claimpilot.dto.claim;

import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ClaimDto(
        String id,
        String claimantName,
        LocalDate claimantDob,
        String claimantGender,
        String policyNumber,
        String policyPlan,
        String hospitalName,
        String hospitalNpi,
        String claimType,
        LocalDate admissionDate,
        LocalDate dischargeDate,
        LocalDate submissionDate,
        BigDecimal claimAmount,
        BigDecimal approvedAmount,
        String currency,
        BigDecimal copayAmount,
        String status,
        String priority,
        BigDecimal dataQualityScore,
        String description,
        String assignedTo,
        List<ClaimCodeRequest> diagnosisCodes,
        List<ClaimCodeRequest> procedureCodes,
        int documentsCount,
        String reviewNotes,
        List<ClaimEventDto> timeline
) {
    public static ClaimDto from(Claim claim, int documentsCount) {
        return new ClaimDto(
                claim.getClaimNumber(),
                claim.getClaimantName(),
                claim.getClaimantDob(),
                claim.getClaimantGender(),
                claim.getPolicyNumber(),
                claim.getPolicyPlan(),
                claim.getHospitalName(),
                claim.getHospitalNpi(),
                claim.getClaimType(),
                claim.getAdmissionDate(),
                claim.getDischargeDate(),
                claim.getSubmissionDate(),
                claim.getClaimAmount(),
                claim.getApprovedAmount(),
                claim.getCurrency(),
                claim.getCopayAmount(),
                claim.getStatus().label(),
                claim.getPriority().label(),
                claim.getDataQualityScore(),
                claim.getDescription(),
                claim.getAssignedTo() == null ? null : claim.getAssignedTo().getName(),
                toRequests(claim.getDiagnosisCodes()),
                toRequests(claim.getProcedureCodes()),
                documentsCount,
                claim.getReviewNotes(),
                claim.getTimeline().stream().map(ClaimEventDto::from).toList()
        );
    }

    private static List<ClaimCodeRequest> toRequests(List<ClaimCode> codes) {
        return codes.stream().map(code -> new ClaimCodeRequest(code.getCode(), code.getDescription())).toList();
    }
}
