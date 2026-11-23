package com.claimpilot.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimApproval;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.repository.ClaimApprovalRepository;
import com.claimpilot.repository.ClaimRepository;
import com.claimpilot.repository.UserAccountRepository;
import com.claimpilot.security.JwtTokenService;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.UserAccountDetailsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@Transactional
class ApprovalApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ClaimApprovalRepository approvalRepository;

    @Autowired
    private UserAccountDetailsService userDetailsService;

    @Autowired
    private JwtTokenService tokenService;

    @Test
    void reviewerCanApproveValidatedClaimAndDecisionIsPersisted() throws Exception {
        String operatorToken = createToken("approval.operator@example.com", UserRole.OPERATOR);
        String reviewerToken = createToken("approval.reviewer@example.com", UserRole.REVIEWER);
        String claimNumber = createClaim(operatorToken);
        mockMvc.perform(post("/api/claims/" + claimNumber + "/validations")
                        .header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.score").value(100));

        mockMvc.perform(get("/api/approvals").header("Authorization", "Bearer " + reviewerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].eligible").value(true));

        String response = mockMvc.perform(post("/api/approvals/" + claimNumber + "/decisions")
                        .header("Authorization", "Bearer " + reviewerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"decision":"APPROVE","approvedAmount":900.00,"reason":"Clinical review complete."}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.decision").value("APPROVE"))
                .andExpect(jsonPath("$.data.approvedAmount").value(900.00))
                .andReturn().getResponse().getContentAsString();
        String approvalId = objectMapper.readTree(response).path("data").path("id").asText();

        Claim claim = claimRepository.findByClaimNumber(claimNumber).orElseThrow();
        assertEquals(com.claimpilot.entity.ClaimStatus.APPROVED, claim.getStatus());
        assertEquals(new BigDecimal("900.00"), claim.getApprovedAmount());
        ClaimApproval approval = approvalRepository.findById(approvalId).orElseThrow();
        assertEquals("approval.reviewer@example.com", approval.getReviewer().getEmail());
        mockMvc.perform(get("/api/claims/" + claimNumber + "/approvals")
                        .header("Authorization", "Bearer " + reviewerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void decisionsRequireCleanDataGuardRunAndReviewerRole() throws Exception {
        String operatorToken = createToken("approval.blocked.operator@example.com", UserRole.OPERATOR);
        String reviewerToken = createToken("approval.blocked.reviewer@example.com", UserRole.REVIEWER);
        String claimNumber = createClaim(operatorToken);

        mockMvc.perform(get("/api/approvals").header("Authorization", "Bearer " + reviewerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].eligible").value(false))
                .andExpect(jsonPath("$.data[0].blockers[0]").value("DataGuard validation has not been run."));

        mockMvc.perform(post("/api/approvals/" + claimNumber + "/decisions")
                        .header("Authorization", "Bearer " + reviewerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"APPROVE\"}"))
                .andExpect(status().isConflict());
        mockMvc.perform(post("/api/approvals/" + claimNumber + "/decisions")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"APPROVE\"}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/approvals/" + claimNumber + "/decisions")
                        .header("Authorization", "Bearer " + reviewerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"REJECT\",\"reason\":\"Duplicate submission.\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.decision").value("REJECT"));
    }

    @Test
    void rejectionAndCorrectionRequireAReason() throws Exception {
        String operatorToken = createToken("approval.reason.operator@example.com", UserRole.OPERATOR);
        String reviewerToken = createToken("approval.reason.reviewer@example.com", UserRole.REVIEWER);
        String claimNumber = createClaim(operatorToken);
        mockMvc.perform(post("/api/claims/" + claimNumber + "/validations")
                        .header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/approvals/" + claimNumber + "/decisions")
                        .header("Authorization", "Bearer " + reviewerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"decision\":\"REJECT\"}"))
                .andExpect(status().isBadRequest());
    }

    private String createToken(String email, UserRole role) {
        UserAccount user = userRepository.saveAndFlush(new UserAccount(
                email, "Approval Test User", "unused-test-hash", Set.of(role)
        ));
        return tokenService.issueToken((UserPrincipal) userDetailsService.loadUserByUsername(user.getEmail()));
    }

    private String createClaim(String token) throws Exception {
        String response = mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "claimantName":"Approval Patient",
                                  "policyNumber":"POL-APPROVAL",
                                  "hospitalName":"Approval Hospital",
                                  "hospitalNpi":"1839201948",
                                  "claimType":"Outpatient",
                                  "admissionDate":"2026-11-18",
                                  "dischargeDate":"2026-11-18",
                                  "claimAmount":1000.00,
                                  "copayAmount":50.00,
                                  "diagnosisCodes":[{"code":"K80.20"}],
                                  "procedureCodes":[{"code":"47562"}]
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("data").path("id").asText();
    }
}
