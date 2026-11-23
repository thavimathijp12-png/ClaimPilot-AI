package com.claimpilot.controller;

import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
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

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@Transactional
class ClaimApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private UserAccountDetailsService userDetailsService;

    @Autowired
    private JwtTokenService tokenService;

    @Test
    void operatorCreatesAndRetrievesPersistedClaimWithTimeline() throws Exception {
        String token = createToken("claim.operator@example.com", UserRole.OPERATOR);
        String body = """
                {
                  "claimantName":"Taylor Patient",
                  "claimantDob":"1982-04-12",
                  "claimantGender":"Female",
                  "policyNumber":"POL-TEST-100",
                  "policyPlan":"Comprehensive PPO",
                  "hospitalName":"Central Test Hospital",
                  "hospitalNpi":"1942859102",
                  "claimType":"Inpatient",
                  "admissionDate":"2026-10-28",
                  "dischargeDate":"2026-11-02",
                  "claimAmount":14850.50,
                  "copayAmount":350.00,
                  "priority":"HIGH",
                  "diagnosisCodes":[{"code":"K80.20","description":"Gallbladder calculus"}],
                  "procedureCodes":[{"code":"47562","description":"Laparoscopic surgery"}]
                }
                """;

        String response = mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.claimantName").value("Taylor Patient"))
                .andExpect(jsonPath("$.data.status").value("Pending Review"))
                .andExpect(jsonPath("$.data.diagnosisCodes[0].code").value("K80.20"))
                .andExpect(jsonPath("$.data.timeline[0].title").value("Claim Created"))
                .andReturn().getResponse().getContentAsString();
        String claimNumber = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(response).path("data").path("id").asText();

        mockMvc.perform(get("/api/claims/" + claimNumber)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.claimAmount").value(14850.50));
        assertEquals(1, claimRepository.count());
    }

    @Test
    void rejectsInvalidDatesAndUnauthorizedClaimCreation() throws Exception {
        String operatorToken = createToken("date.operator@example.com", UserRole.OPERATOR);
        String invalidDateRequest = """
                {
                  "claimantName":"Taylor Patient",
                  "policyNumber":"POL-TEST-101",
                  "hospitalName":"Central Test Hospital",
                  "claimType":"Outpatient",
                  "admissionDate":"2026-11-02",
                  "dischargeDate":"2026-10-28",
                  "claimAmount":100.00
                }
                """;
        mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidDateRequest))
                .andExpect(status().isBadRequest());

        String userToken = createToken("basic.user@example.com", UserRole.USER);
        mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidDateRequest))
                .andExpect(status().isForbidden());
    }

    @Test
    void onlyPermittedIntakeStatusTransitionsAreAccepted() throws Exception {
        String token = createToken("status.operator@example.com", UserRole.OPERATOR);
        String created = mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"claimantName":"Status Patient","policyNumber":"POL-STATUS",
                                "hospitalName":"Test Hospital","claimType":"Outpatient","claimAmount":75.00}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String claimNumber = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(created).path("data").path("id").asText();

        mockMvc.perform(patch("/api/claims/" + claimNumber + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"UNDER_AI_AUDIT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("Under AI Audit"));

        mockMvc.perform(patch("/api/claims/" + claimNumber + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPROVED\"}"))
                .andExpect(status().isConflict());
        assertEquals(ClaimStatus.UNDER_AI_AUDIT,
                claimRepository.findByClaimNumber(claimNumber).orElseThrow().getStatus());
    }

    private String createToken(String email, UserRole role) {
        UserAccount user = userRepository.saveAndFlush(new UserAccount(
                email, "Test User", "unused-test-hash", Set.of(role)
        ));
        return tokenService.issueToken((UserPrincipal) userDetailsService.loadUserByUsername(user.getEmail()));
    }
}
