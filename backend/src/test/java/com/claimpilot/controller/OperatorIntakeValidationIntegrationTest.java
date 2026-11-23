package com.claimpilot.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
class OperatorIntakeValidationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldRejectClaimCreationWithoutAuthentication() throws Exception {
        mockMvc.perform(post("/api/claims")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"claimantName\":\"Test\",\"policyNumber\":\"POL-1\"}"))
                .andExpect(status().isUnauthorized());
    }
}
