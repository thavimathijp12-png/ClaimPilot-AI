package com.claimpilot.controller;

import com.claimpilot.config.CorsConfig;
import com.claimpilot.security.SecurityConfig;
import com.claimpilot.security.RestAccessDeniedHandler;
import com.claimpilot.security.RestAuthenticationEntryPoint;
import com.claimpilot.security.JwtTokenService;
import com.claimpilot.service.UserAccountDetailsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.boot.test.mock.mockito.MockBean;
import javax.sql.DataSource;
import java.sql.Connection;

import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(HealthController.class)
@Import({ SecurityConfig.class, CorsConfig.class, RestAuthenticationEntryPoint.class,
        RestAccessDeniedHandler.class })
@ActiveProfiles("test")
@TestPropertySource(properties = "claimpilot.jwt.secret=claimpilot-test-only-secret-key-1234567890abcdef")
class HealthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DataSource dataSource;

    @MockBean
    private UserAccountDetailsService userAccountDetailsService;

    @MockBean
    private JwtTokenService jwtTokenService;

    @Test
    @DisplayName("GET /api/health should return 200 OK and valid health payload")
    void shouldReturnHealthStatus() throws Exception {
        Connection connection = org.mockito.Mockito.mock(Connection.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(2)).thenReturn(true);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"))
                .andExpect(jsonPath("$.data.service").value("ClaimPilot AI Backend"))
                .andExpect(jsonPath("$.data.version").value("1.0.0"))
                .andExpect(jsonPath("$.data.systemDetails.databaseStatus").value("UP"))
                .andExpect(jsonPath("$.data.activeModules").value(
                        org.hamcrest.Matchers.hasItem("Document Management")));
    }

    @Test
    @DisplayName("GET /api/health should report degraded when the database is unavailable")
    void shouldReportDatabaseUnavailable() throws Exception {
        Connection connection = org.mockito.Mockito.mock(Connection.class);
        when(dataSource.getConnection()).thenReturn(connection);
        when(connection.isValid(2)).thenReturn(false);

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("DEGRADED"))
                .andExpect(jsonPath("$.data.systemDetails.databaseStatus")
                        .value("DOWN: Connection validation failed"));
    }
}
