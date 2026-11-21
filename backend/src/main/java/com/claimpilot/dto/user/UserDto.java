package com.claimpilot.dto.user;

import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

public record UserDto(
        String id,
        String email,
        String name,
        String role,
        String roleCode,
        Set<String> roles,
        boolean active,
        Instant createdAt
) {
    public static UserDto from(UserAccount user) {
        UserRole primaryRole = user.getRoles().stream()
                .filter(role -> role != UserRole.USER)
                .sorted()
                .findFirst()
                .orElse(UserRole.USER);
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                primaryRole.label(),
                primaryRole.code(),
                user.getRoles().stream().map(Enum::name).collect(Collectors.toUnmodifiableSet()),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
