package com.claimpilot.dto.user;

import com.claimpilot.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateUserRequest(
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 2, max = 120) String name,
        @NotBlank @Size(min = 12, max = 128) String password,
        @NotEmpty Set<UserRole> roles
) {
}
