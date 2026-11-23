package com.claimpilot.service;

import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AdminRbacSafetyGuard {

    public void validateRoleUpdate(UserAccount targetUser, Set<UserRole> newRoles, long totalActiveAdmins) {
        if (targetUser.getRoles().contains(UserRole.ADMIN) && !newRoles.contains(UserRole.ADMIN)) {
            if (totalActiveAdmins <= 1) {
                throw new ApiException("Cannot demote the last remaining active administrator.", HttpStatus.CONFLICT);
            }
        }
    }

    public void validateSelfDeactivation(String actorId, String targetUserId) {
        if (actorId != null && actorId.equals(targetUserId)) {
            throw new ApiException("Administrators cannot deactivate their own user account.", HttpStatus.BAD_REQUEST);
        }
    }
}
