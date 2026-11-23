package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.user.CreateUserRequest;
import com.claimpilot.dto.user.UpdateRolesRequest;
import com.claimpilot.dto.user.UpdateUserStatusRequest;
import com.claimpilot.dto.user.UserDto;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.UserAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAccountController {

    private final UserAccountService userAccountService;

    public UserAccountController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.success(userAccountService.listUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(userAccountService.getUser(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody CreateUserRequest request,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created.",
                        userAccountService.createUser(request, principal.id())));
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<ApiResponse<UserDto>> updateRoles(@PathVariable String id,
                                                            @Valid @RequestBody UpdateRolesRequest request,
                                                            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "User roles updated.", userAccountService.updateRoles(id, request, principal.id())
        ));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<ApiResponse<UserDto>> updateActive(@PathVariable String id,
                                                             @Valid @RequestBody UpdateUserStatusRequest request,
                                                             @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success(
                "User status updated.",
                userAccountService.updateActive(id, request.active(), principal.id())
        ));
    }
}
