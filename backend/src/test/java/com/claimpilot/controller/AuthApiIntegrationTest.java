package com.claimpilot.controller;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
@Transactional
class AuthApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserAccountRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenService tokenService;

    @Autowired
    private UserAccountDetailsService userDetailsService;

    @Test
    void registrationIssuesJwtThatAuthenticatesCurrentUser() throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new.user@example.com","name":"New User","password":"StrongPassword123"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.user.email").value("new.user@example.com"))
                .andExpect(jsonPath("$.data.user.roles[0]").value("USER"))
                .andReturn().getResponse().getContentAsString();
        JsonNode responseJson = objectMapper.readTree(response);
        String token = responseJson.path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("New User"));
    }

    @Test
    void loginAuthenticatesPasswordAndRoleProtectedUserApiDeniesNonAdmin() throws Exception {
        userRepository.saveAndFlush(new UserAccount(
                "operator@example.com", "Operator", passwordEncoder.encode("StrongPassword123"),
                Set.of(UserRole.OPERATOR)
        ));

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"OPERATOR@example.com","password":"StrongPassword123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = objectMapper.readTree(response).path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void protectedEndpointsRejectMissingAndInvalidTokens() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void administratorsCanCreateAndManageUserRolesWithoutExposingPasswordHashes() throws Exception {
        UserAccount admin = userRepository.saveAndFlush(new UserAccount(
                "users.admin@example.com", "User Administrator",
                passwordEncoder.encode("AdminPassword123"), Set.of(UserRole.ADMIN)
        ));
        String adminToken = tokenService.issueToken(
                (UserPrincipal) userDetailsService.loadUserByUsername(admin.getEmail()));

        String created = mockMvc.perform(post("/api/users")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new.operator@example.com","name":"New Operator",
                                "password":"OperatorPassword123","roles":["OPERATOR"]}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.roleCode").value("operator"))
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        String userId = objectMapper.readTree(created).path("data").path("id").asText();

        mockMvc.perform(put("/api/users/" + userId + "/roles")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"roles\":[\"REVIEWER\"]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roleCode").value("reviewer"));

        String userToken = objectMapper.readTree(mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"new.operator@example.com","password":"OperatorPassword123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(patch("/api/users/" + userId + "/active")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.active").value(false));

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }
}
