package com.claimpilot.controller;

import com.claimpilot.entity.Claim;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@Transactional
class AnalyticsApiIntegrationTest {

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
    void overviewTrendsAndFilteredReportUsePersistedClaims() throws Exception {
        UserAccount analyst = userRepository.saveAndFlush(new UserAccount(
                "analytics@example.com", "Analytics User", "unused-test-hash", Set.of(UserRole.ANALYST)
        ));
        createClaim(analyst, "POL-ANALYTICS-1", "100.00", ClaimStatus.APPROVED,
                "80.00", "92.00");
        createClaim(analyst, "POL-ANALYTICS-2", "50.00", ClaimStatus.PENDING_REVIEW,
                "0.00", "80.00");
        String token = tokenService.issueToken(
                (UserPrincipal) userDetailsService.loadUserByUsername(analyst.getEmail()));
        String from = LocalDate.now().minusDays(1).toString();
        String to = LocalDate.now().plusDays(1).toString();

        mockMvc.perform(get("/api/analytics/overview")
                        .param("from", from).param("to", to)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalClaims").value(2))
                .andExpect(jsonPath("$.data.pendingClaims").value(1))
                .andExpect(jsonPath("$.data.approvedClaims").value(1))
                .andExpect(jsonPath("$.data.totalClaimedAmount").value(150.00))
                .andExpect(jsonPath("$.data.totalApprovedAmount").value(80.00))
                .andExpect(jsonPath("$.data.averageDataQualityScore").value(86.00))
                .andExpect(jsonPath("$.data.totalDocuments").value(0))
                .andExpect(jsonPath("$.data.currency").value("INR"));

        mockMvc.perform(get("/api/analytics/trends")
                        .param("from", from).param("to", to)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].count").value(2));

        mockMvc.perform(get("/api/reports/claims")
                        .param("status", "PENDING_REVIEW")
                        .param("from", from).param("to", to)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1))
                .andExpect(jsonPath("$.data.content[0].policyNumber").value("POL-ANALYTICS-2"));
    }

    @Test
    void analyticsRejectInvalidRangesAndRequirePrivilegedRole() throws Exception {
        UserAccount basic = userRepository.saveAndFlush(new UserAccount(
                "analytics.basic@example.com", "Basic User", "unused-test-hash", Set.of(UserRole.USER)
        ));
        String token = tokenService.issueToken(
                (UserPrincipal) userDetailsService.loadUserByUsername(basic.getEmail()));

        mockMvc.perform(get("/api/analytics/overview").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        UserAccount analyst = userRepository.saveAndFlush(new UserAccount(
                "analytics.admin@example.com", "Analytics Admin", "unused-test-hash", Set.of(UserRole.ANALYST)
        ));
        String analystToken = tokenService.issueToken(
                (UserPrincipal) userDetailsService.loadUserByUsername(analyst.getEmail()));
        mockMvc.perform(get("/api/analytics/overview")
                        .param("from", LocalDate.now().toString())
                        .param("to", LocalDate.now().minusDays(1).toString())
                        .header("Authorization", "Bearer " + analystToken))
                .andExpect(status().isBadRequest());
    }

    private void createClaim(UserAccount creator, String policyNumber, String amount,
                             ClaimStatus status, String approvedAmount, String qualityScore) {
        Claim claim = new Claim("Analytics Patient", policyNumber, "Analytics Hospital",
                "Outpatient", new BigDecimal(amount), creator);
        claim.setStatus(status);
        claim.setApprovedAmount(new BigDecimal(approvedAmount));
        claim.setDataQualityScore(new BigDecimal(qualityScore));
        claimRepository.saveAndFlush(claim);
    }
}
