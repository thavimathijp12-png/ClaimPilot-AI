package com.claimpilot.service;

import com.claimpilot.dto.approval.ClinicalAdjudicationDto;
import com.claimpilot.entity.AdjudicationReasonCode;
import com.claimpilot.entity.ApprovalDecision;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimCode;
import com.claimpilot.entity.ClaimPriority;
import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.repository.ClaimRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClinicalAdjudicationServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    private ClinicalAdjudicationService adjudicationService;
    private UserAccount testUser;

    @BeforeEach
    void setUp() {
        adjudicationService = new ClinicalAdjudicationService(claimRepository);
        testUser = new UserAccount("reviewer.test@example.com", "Test Reviewer", "password-hash", Set.of(UserRole.REVIEWER));
    }

    @Test
    @DisplayName("Should recommend correction when high-value claim lacks pre-authorization reference")
    void shouldRequirePreauthForHighValueClaim() {
        Claim claim = new Claim(
                "Patient X",
                "POL-999-001",
                "Apollo Hospitals",
                "INPATIENT",
                new BigDecimal("150000.00"),
                testUser
        );

        List<ClaimCode> diagnosisCodes = Collections.singletonList(
                new ClaimCode("I21.0", "Acute transmural myocardial infarction")
        );
        List<ClaimCode> procedureCodes = Collections.singletonList(
                new ClaimCode("0210093", "Coronary artery bypass")
        );

        claim.setOptionalFields(
                LocalDate.of(1985, 5, 20),
                "Female",
                "Gold Comprehensive",
                "1234567890",
                LocalDate.now().minusDays(3),
                LocalDate.now(),
                BigDecimal.ZERO,
                ClaimPriority.HIGH,
                "Major cardiac procedure without authorization reference",
                null,
                null,
                diagnosisCodes,
                procedureCodes
        );
        claim.setStatus(ClaimStatus.PENDING_REVIEW);

        when(claimRepository.findByClaimNumber(claim.getClaimNumber())).thenReturn(Optional.of(claim));

        ClinicalAdjudicationDto result = adjudicationService.evaluateClaim(claim.getClaimNumber());

        assertNotNull(result);
        assertEquals(ApprovalDecision.REQUEST_CORRECTION, result.decision());
        assertEquals(AdjudicationReasonCode.PREAUTH_MISSING, result.reasonCode());
        assertFalse(result.preauthVerified());
    }

    @Test
    @DisplayName("Should recommend approval when clinical criteria are met")
    void shouldApproveWhenCriteriaMet() {
        Claim claim = new Claim(
                "Patient Y",
                "POL-111-001",
                "City Clinic",
                "OUTPATIENT",
                new BigDecimal("5000.00"),
                testUser
        );

        List<ClaimCode> diagnosisCodes = Collections.singletonList(
                new ClaimCode("J00", "Acute nasopharyngitis")
        );
        List<ClaimCode> procedureCodes = Collections.emptyList();

        claim.setOptionalFields(
                LocalDate.of(1990, 1, 1),
                "Male",
                "Silver Standard",
                "1234567890",
                LocalDate.now(),
                LocalDate.now(),
                BigDecimal.ZERO,
                ClaimPriority.LOW,
                "Standard consultation with clinical records attached",
                null,
                null,
                diagnosisCodes,
                procedureCodes
        );
        claim.setStatus(ClaimStatus.PENDING_REVIEW);

        when(claimRepository.findByClaimNumber(claim.getClaimNumber())).thenReturn(Optional.of(claim));

        ClinicalAdjudicationDto result = adjudicationService.evaluateClaim(claim.getClaimNumber());

        assertNotNull(result);
        assertEquals(ApprovalDecision.APPROVE, result.decision());
        assertEquals(AdjudicationReasonCode.CLINICAL_CRITERIA_MET, result.reasonCode());
        assertTrue(result.medicalNecessityVerified());
        assertTrue(result.diagnosisProcedureCongruent());
        assertEquals(new BigDecimal("5000.00"), result.recommendedAmount());
    }
}
