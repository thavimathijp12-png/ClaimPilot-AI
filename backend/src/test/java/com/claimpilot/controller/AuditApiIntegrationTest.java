package com.claimpilot.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@Transactional
class AuditApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private UserAccountDetailsService userDetailsService;

    @Autowired
    private JwtTokenService tokenService;

    @Test
    void domainMutationCreatesRestrictedAndFilterableAuditEvent() throws Exception {
        String operatorToken = createToken("audit.operator@example.com", UserRole.OPERATOR);
        String adminToken = createToken("audit.admin@example.com", UserRole.ADMIN);

        String claimResponse = mockMvc.perform(post("/api/claims")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"claimantName":"Private Patient Name","policyNumber":"POL-AUDIT",
                                "hospitalName":"Audit Hospital","claimType":"Outpatient","claimAmount":25.00}
                                """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String claimNumber = objectMapper.readTree(claimResponse).path("data").path("id").asText();

        mockMvc.perform(get("/api/audit")
                        .param("resourceType", "claim")
                        .param("resourceId", claimNumber)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].action").value("CLAIM_CREATED"))
                .andExpect(jsonPath("$.data.content[0].resourceId").value(claimNumber))
                .andExpect(jsonPath("$.data.content[0].details").value("Claim was created."));

        mockMvc.perform(get("/api/audit").header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isForbidden());
    }

    private String createToken(String email, UserRole role) {
        UserAccount user = userRepository.saveAndFlush(new UserAccount(
                email, "Audit Test User", "unused-test-hash", Set.of(role)
        ));
        return tokenService.issueToken((UserPrincipal) userDetailsService.loadUserByUsername(user.getEmail()));
    }
}
