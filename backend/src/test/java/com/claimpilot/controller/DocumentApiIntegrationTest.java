package com.claimpilot.controller;

import com.claimpilot.entity.Claim;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.repository.ClaimDocumentRepository;
import com.claimpilot.repository.ClaimRepository;
import com.claimpilot.repository.AuditEventRepository;
import com.claimpilot.repository.UserAccountRepository;
import com.claimpilot.security.JwtTokenService;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.UserAccountDetailsService;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@Transactional
class DocumentApiIntegrationTest {

    private static final Path TEST_STORAGE = Path.of("target", "claimpilot-test-documents");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ClaimDocumentRepository documentRepository;

    @Autowired
    private AuditEventRepository auditRepository;

    @Autowired
    private UserAccountDetailsService userDetailsService;

    @Autowired
    private JwtTokenService tokenService;

    @Test
    void uploadDownloadAndSoftRemovalUseClaimLinkedPersistence() throws Exception {
        UserAccount operator = userRepository.saveAndFlush(new UserAccount(
                "documents.operator@example.com", "Document Operator", "test-hash", Set.of(UserRole.OPERATOR)
        ));
        Claim claim = claimRepository.saveAndFlush(new Claim(
                "Document Patient", "POL-DOC-1", "Test Hospital", "Outpatient",
                new java.math.BigDecimal("100.00"), operator
        ));
        String claimNumber = claim.getClaimNumber();
        String token = tokenService.issueToken((UserPrincipal)
                userDetailsService.loadUserByUsername(operator.getEmail()));
        byte[] pdf = "%PDF-1.7\nClaim evidence\n".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        MockMultipartFile file = new MockMultipartFile(
                "file", "..\\sensitive\\bill.pdf", "application/pdf", pdf
        );

        String result = mockMvc.perform(multipart("/api/claims/" + claimNumber + "/documents")
                        .file(file)
                        .param("category", "Hospital Bill")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("bill.pdf"))
                .andExpect(jsonPath("$.data.fileType").value("PDF"))
                .andExpect(jsonPath("$.data.claimId").value(claimNumber))
                .andReturn().getResponse().getContentAsString();
        String documentId = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(result).path("data").path("id").asText();

        byte[] downloaded = mockMvc.perform(get("/api/documents/" + documentId + "/content")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andReturn().getResponse().getContentAsByteArray();
        assertArrayEquals(pdf, downloaded);
        assertEquals(1, documentRepository.count());
        assertTrue(auditRepository.findAll().stream()
                .anyMatch(event -> event.getAction().equals("DOCUMENT_DOWNLOADED")));

        mockMvc.perform(get("/api/claims/" + claimNumber)
                        .header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.data.documentsCount").value(1));

        mockMvc.perform(delete("/api/documents/" + documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/documents/" + documentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
        assertEquals(1, documentRepository.count());
    }

    @Test
    void rejectsUnsupportedContentEvenWhenFilenameClaimsPdf() throws Exception {
        UserAccount operator = userRepository.saveAndFlush(new UserAccount(
                "unsupported.operator@example.com", "Document Operator", "test-hash", Set.of(UserRole.OPERATOR)
        ));
        Claim claim = claimRepository.saveAndFlush(new Claim(
                "Unsupported Patient", "POL-DOC-2", "Test Hospital", "Outpatient",
                new java.math.BigDecimal("100.00"), operator
        ));
        String token = tokenService.issueToken((UserPrincipal)
                userDetailsService.loadUserByUsername(operator.getEmail()));
        MockMultipartFile file = new MockMultipartFile("file", "malware.pdf", "application/pdf", new byte[]{1, 2, 3});

        mockMvc.perform(multipart("/api/claims/" + claim.getClaimNumber() + "/documents")
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnsupportedMediaType());
        assertEquals(0, documentRepository.count());
    }

    @AfterAll
    static void removeTestDocuments() throws Exception {
        if (Files.exists(TEST_STORAGE)) {
            try (var paths = Files.walk(TEST_STORAGE)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
                    Files.deleteIfExists(path);
                }
            }
        }
    }
}
