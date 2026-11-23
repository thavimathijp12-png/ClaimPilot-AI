package com.claimpilot.service;

import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;

class AdminRbacSafetyGuardTest {

    private AdminRbacSafetyGuard safetyGuard;

    @BeforeEach
    void setUp() {
        safetyGuard = new AdminRbacSafetyGuard();
    }

    @Test
    void shouldPreventDemotingLastAdmin() {
        UserAccount admin = new UserAccount("admin@example.com", "Admin User", "hash", Set.of(UserRole.ADMIN));
        assertThrows(ApiException.class, () ->
            safetyGuard.validateRoleUpdate(admin, Set.of(UserRole.OPERATOR), 1)
        );
    }

    @Test
    void shouldAllowDemotingAdminWhenMultipleAdminsExist() {
        UserAccount admin = new UserAccount("admin@example.com", "Admin User", "hash", Set.of(UserRole.ADMIN));
        assertDoesNotThrow(() ->
            safetyGuard.validateRoleUpdate(admin, Set.of(UserRole.OPERATOR), 2)
        );
    }

    @Test
    void shouldPreventSelfDeactivation() {
        assertThrows(ApiException.class, () ->
            safetyGuard.validateSelfDeactivation("user-123", "user-123")
        );
    }
}
