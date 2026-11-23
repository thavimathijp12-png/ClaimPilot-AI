package com.claimpilot.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.repository.DataGuardRunRepository;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@Transactional
class DataGuardApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private DataGuardRunRepository runRepository;

    @Autowired
    private UserAccountDetailsService userDetailsService;

    @Autowired
    private JwtTokenService tokenService;

    @Test
    void validClaimProducesPersistedDataGuardRunAndScore() throws Exception {
        String token = createToken("dataguard.operator@example.com");
        String claimNumber = createClaim(token, "1839201948", "K80.20", "47562");

        String runResponse = mockMvc.perform(post("/api/claims/" + claimNumber + "/validations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.score").value(100))
                .andExpect(jsonPath("$.data.invalidCount").value(0))
                .andExpect(jsonPath("$.data.duplicateWarningsCount").value(0))
                .andExpect(jsonPath("$.data.items.length()").value(13))
                .andReturn().getResponse().getContentAsString();
        JsonNode runJson = objectMapper.readTree(runResponse);
        String runId = runJson.path("data").path("id").asText();

        mockMvc.perform(get("/api/validations/" + runId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.claimId").value(claimNumber));

        String duplicateClaimNumber = createClaim(token, "1839201948", "K80.20", "47562");
        mockMvc.perform(post("/api/claims/" + duplicateClaimNumber + "/validations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.score").value(95))
                .andExpect(jsonPath("$.data.duplicateWarningsCount").value(1));
        assertEquals(2, runRepository.count());
    }

    @Test
    void rejectsMalformedCodesAndNpiAndPersistsFailedChecks() throws Exception {
        String token = createToken("dataguard.invalid@example.com");
        String claimNumber = createClaim(token, "1942859102", "NOT-A-CODE", "ABC");

        mockMvc.perform(post("/api/claims/" + claimNumber + "/validations")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.invalidCount").value(3))
                .andExpect(jsonPath("$.data.score").value(55))
                .andExpect(jsonPath("$.data.items[4].status").value("Invalid"));
        assertEquals(1, runRepository.count());
    }

    private String createToken(String email) {
        UserAccount operator = userRepository.saveAndFlush(new UserAccount(
                email, "Data Steward", "unused-test-hash", Set.of(UserRole.OPERATOR)
        ));
        return tokenService.issueToken((UserPrincipal)
                userDetailsService.loadUserByUsername(operator.getEmail()));
    }

    private String createClaim(String token, String npi, String diagnosis, String procedure) throws Exception {
        String response = mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "claimantName":"Data Guard Patient",
                                  "claimantDob":"1982-04-12",
                                  "policyNumber":"POL-DG-1",
                                  "hospitalName":"Data Guard Hospital",
                                  "hospitalNpi":"%s",
                                  "claimType":"Inpatient",
                                  "admissionDate":"2026-10-28",
                                  "dischargeDate":"2026-11-02",
                                  "claimAmount":1000.00,
                                  "copayAmount":50.00,
                                  "diagnosisCodes":[{"code":"%s","description":"Test diagnosis"}],
                                  "procedureCodes":[{"code":"%s","description":"Test procedure"}]
                                }
                                """.formatted(npi, diagnosis, procedure)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).path("data").path("id").asText();
    }
}
