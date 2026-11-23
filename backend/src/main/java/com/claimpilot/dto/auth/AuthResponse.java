package com.claimpilot.dto.auth;

import com.claimpilot.dto.user.UserDto;

public record AuthResponse(
        String tokenType,
        String accessToken,
        long expiresInMs,
        UserDto user
) {
}
