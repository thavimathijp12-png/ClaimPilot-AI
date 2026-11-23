package com.claimpilot;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Spring Boot Application Context Verification Test.
 */
@SpringBootTest
@ActiveProfiles("test")
class ClaimPilotApplicationTests {

    @Test
    void contextLoads() {
        // Confirms all Spring components, configurations, and security filter chains initialize cleanly.
    }
}

