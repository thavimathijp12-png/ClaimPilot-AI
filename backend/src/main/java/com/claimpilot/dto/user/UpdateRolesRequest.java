package com.claimpilot.dto.user;

import com.claimpilot.entity.UserRole;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UpdateRolesRequest(@NotEmpty Set<UserRole> roles) {
}
