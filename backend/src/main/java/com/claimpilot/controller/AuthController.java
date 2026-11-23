package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.auth.AuthResponse;
import com.claimpilot.dto.auth.LoginRequest;
import com.claimpilot.dto.auth.RegisterRequest;
import com.claimpilot.dto.user.UserDto;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.AuthService;
import com.claimpilot.service.UserAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserAccountService userAccountService;

    public AuthController(AuthService authService, UserAccountService userAccountService) {
        this.authService = authService;
        this.userAccountService = userAccountService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Account created.", authService.register(request))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Authenticated.", authService.login(request)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto>> currentUser(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                userAccountService.getUser(principal.id())
        ));
    }
}
