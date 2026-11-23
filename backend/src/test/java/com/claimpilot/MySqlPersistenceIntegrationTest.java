package com.claimpilot;

import com.claimpilot.dto.approval.ApprovalDecisionRequest;
import com.claimpilot.dto.claim.ClaimCodeRequest;
import com.claimpilot.dto.claim.ClaimDto;
import com.claimpilot.dto.claim.CreateClaimRequest;
import com.claimpilot.dto.dataguard.DataGuardRunDto;
import com.claimpilot.entity.ApprovalDecision;
import com.claimpilot.entity.ClaimApproval;
import com.claimpilot.entity.ClaimStatus;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.repository.AuditEventRepository;
import com.claimpilot.repository.ClaimApprovalRepository;
import com.claimpilot.repository.ClaimDocumentRepository;
import com.claimpilot.repository.ClaimRepository;
import com.claimpilot.repository.DataGuardRunRepository;
import com.claimpilot.repository.UserAccountRepository;
import com.claimpilot.service.ApprovalService;
import com.claimpilot.service.AuditService;
import com.claimpilot.service.ClaimService;
import com.claimpilot.service.DataGuardService;
import com.claimpilot.service.DocumentService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=update")
@ActiveProfiles("mysql")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@EnabledIfEnvironmentVariable(named = "MYSQL_IT_ENABLED", matches = "true")
@Transactional
class MySqlPersistenceIntegrationTest {

    private static final Path TEST_STORAGE = Path.of("target", "claimpilot-mysql-it-documents");

    @Autowired
    private DataSource dataSource;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ClaimDocumentRepository documentRepository;

    @Autowired
    private DataGuardRunRepository dataGuardRunRepository;

    @Autowired
    private ClaimApprovalRepository approvalRepository;

    @Autowired
    private AuditEventRepository auditRepository;

    @Autowired
    private ClaimService claimService;

    @Autowired
    private DocumentService documentService;

    @Autowired
    private DataGuardService dataGuardService;

    @Autowired
    private ApprovalService approvalService;

    @Autowired
    private AuditService auditService;

    @Test
    void persistsAndReadsDomainWorkflowThroughTheExistingMySqlDatabase() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            assertEquals("MySQL", connection.getMetaData().getDatabaseProductName());
            assertEquals("claimpilot_db", connection.getCatalog());
        }

        UserAccount operator = userRepository.saveAndFlush(new UserAccount(
                "mysql-it-operator-" + java.util.UUID.randomUUID() + "@example.test",
                "MySQL Integration Operator", "not-used", Set.of(UserRole.OPERATOR)
        ));
        UserAccount reviewer = userRepository.saveAndFlush(new UserAccount(
                "mysql-it-reviewer-" + java.util.UUID.randomUUID() + "@example.test",
                "MySQL Integration Reviewer", "not-used", Set.of(UserRole.REVIEWER)
        ));
        ClaimDto createdClaim = claimService.createClaim(new CreateClaimRequest(
                "MySQL Integration Patient",
                LocalDate.of(1982, 4, 12),
                "Unspecified",
                "POL-MYSQL-" + java.util.UUID.randomUUID(),
                "Integration Test Plan",
                "MySQL Integration Hospital",
                "1839201948",
                "Outpatient",
                LocalDate.now().minusDays(1),
                LocalDate.now(),
                new BigDecimal("125.50"),
                new BigDecimal("10.00"),
                com.claimpilot.entity.ClaimPriority.MEDIUM,
                "MySQL persistence integration test",
                null,
                null,
                List.of(new ClaimCodeRequest("K80.20", "Test diagnosis")),
                List.of(new ClaimCodeRequest("47562", "Test procedure"))
        ), operator.getId());

        DataGuardRunDto dataGuardRun = dataGuardService.run(createdClaim.id(), operator.getId());
        assertEquals(100, dataGuardRun.score());

        byte[] pdf = "%PDF-1.7\nMySQL integration evidence\n".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        documentService.upload(
                createdClaim.id(),
                new MockMultipartFile("file", "mysql-it.pdf", "application/pdf", pdf),
                "Integration Test",
                "Temporary test content.",
                operator.getId()
        );
        approvalService.decide(createdClaim.id(), new ApprovalDecisionRequest(
                ApprovalDecision.APPROVE, "Integration test approval.", null
        ), reviewer.getId());

        ClaimStatus storedStatus = claimRepository.findByClaimNumber(createdClaim.id())
                .orElseThrow().getStatus();
        assertEquals(ClaimStatus.APPROVED, storedStatus);
        assertEquals(1, documentRepository.countByClaim_ClaimNumberAndStatusNot(
                createdClaim.id(), com.claimpilot.entity.DocumentStatus.REMOVED));
        assertEquals(1, dataGuardRunRepository.findByClaim_ClaimNumberOrderByLastCheckedDesc(
                createdClaim.id()).size());
        List<ClaimApproval> approvals =
                approvalRepository.findByClaim_ClaimNumberOrderByDecidedAtDesc(createdClaim.id());
        assertEquals(1, approvals.size());
        assertEquals(ApprovalDecision.APPROVE, approvals.get(0).getDecision());
        assertTrue(auditRepository.count() >= 4);
        assertTrue(auditService.search("CLAIM", createdClaim.id(), null, null, 0, 20)
                .getContent().stream().anyMatch(event -> event.action().equals("APPROVAL_DECIDED")));
    }

    @AfterAll
    static void removeMySqlTestDocuments() throws Exception {
        if (Files.exists(TEST_STORAGE)) {
            try (var paths = Files.walk(TEST_STORAGE)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
                    Files.deleteIfExists(path);
                }
            }
        }
    }
}
