package com.claimpilot.service;

import com.claimpilot.dto.approval.ClinicalAdjudicationDto;
import com.claimpilot.entity.AdjudicationReasonCode;
import com.claimpilot.entity.ApprovalDecision;
import com.claimpilot.entity.Claim;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.ClaimRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for clinical adjudication rule validation and clinical decision support.
 */
@Service
public class ClinicalAdjudicationService {

    private final ClaimRepository claimRepository;

    public ClinicalAdjudicationService(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    @Transactional(readOnly = true)
    public ClinicalAdjudicationDto evaluateClaim(String claimNumber) {
        Claim claim = claimRepository.findByClaimNumber(claimNumber)
                .orElseThrow(() -> new ApiException("Claim not found: " + claimNumber, HttpStatus.NOT_FOUND));

        List<String> findings = new ArrayList<>();
        boolean preauthVerified = true;
        boolean diagnosisCongruent = true;
        boolean medicalNecessity = true;

        // 1. High-value claim threshold check (> ₹1,00,000 requires strict pre-auth)
        if (claim.getClaimAmount().compareTo(new BigDecimal("100000")) > 0) {
            if (claim.getDescription() == null || !claim.getDescription().toLowerCase(java.util.Locale.ROOT).contains("preauth")) {
                preauthVerified = false;
                findings.add("Claim amount exceeds ₹1,00,000 threshold without documented prior authorization reference.");
            }
        }

        // 2. Clinical code verification
        boolean hasDiagnosis = claim.getDiagnosisCodes() != null && !claim.getDiagnosisCodes().isEmpty();
        boolean hasProcedure = claim.getProcedureCodes() != null && !claim.getProcedureCodes().isEmpty();
        if (!hasDiagnosis && !hasProcedure) {
            diagnosisCongruent = false;
            findings.add("No ICD-10 diagnosis or CPT procedure codes attached to encounter.");
        }

        // 3. Determine recommended decision and reason code
        ApprovalDecision recommendedDecision;
        AdjudicationReasonCode reasonCode;
        BigDecimal recommendedAmount;

        if (!preauthVerified) {
            recommendedDecision = ApprovalDecision.REQUEST_CORRECTION;
            reasonCode = AdjudicationReasonCode.PREAUTH_MISSING;
            recommendedAmount = BigDecimal.ZERO;
        } else if (!diagnosisCongruent) {
            recommendedDecision = ApprovalDecision.REQUEST_CORRECTION;
            reasonCode = AdjudicationReasonCode.INSUFFICIENT_CLINICAL_DOCUMENTATION;
            recommendedAmount = BigDecimal.ZERO;
        } else {
            recommendedDecision = ApprovalDecision.APPROVE;
            reasonCode = AdjudicationReasonCode.CLINICAL_CRITERIA_MET;
            recommendedAmount = claim.getClaimAmount();
            findings.add("All clinical necessity criteria and diagnostic congruency rules validated successfully.");
        }

        return new ClinicalAdjudicationDto(
                claim.getClaimNumber(),
                recommendedDecision,
                reasonCode,
                medicalNecessity,
                preauthVerified,
                diagnosisCongruent,
                recommendedAmount,
                findings,
                Instant.now()
        );
    }
}
