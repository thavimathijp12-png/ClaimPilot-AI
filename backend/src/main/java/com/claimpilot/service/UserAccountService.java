package com.claimpilot.service;

import com.claimpilot.dto.user.CreateUserRequest;
import com.claimpilot.dto.user.UpdateRolesRequest;
import com.claimpilot.dto.user.UserDto;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.UserAccountRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class UserAccountService {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserAccountService(UserAccountRepository userRepository, PasswordEncoder passwordEncoder,
                              AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<UserDto> listUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream().map(UserDto::from).toList();
    }

    @Transactional(readOnly = true)
    public UserDto getUser(String id) {
        return UserDto.from(requireUser(id));
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request, String actorId) {
        String email = AuthService.normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("An account already exists for this email.", HttpStatus.CONFLICT);
        }
        UserAccount user;
        try {
            user = userRepository.saveAndFlush(new UserAccount(
                    email, request.name().trim(), passwordEncoder.encode(request.password()), request.roles()
            ));
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException("An account already exists for this email.", ex, HttpStatus.CONFLICT);
        }
        auditService.record(actorId, "USER_CREATED", "USER", user.getId(),
                "Administrator created a user account.");
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateRoles(String id, UpdateRolesRequest request, String actorId) {
        UserAccount user = requireUser(id);
        Set<UserRole> newRoles = request.roles();
        if (user.isActive() && user.getRoles().contains(UserRole.ADMIN)
                && !newRoles.contains(UserRole.ADMIN)
                && userRepository.countByRolesContainingAndActiveTrue(UserRole.ADMIN) <= 1) {
            throw new ApiException("The last active administrator cannot be demoted.", HttpStatus.CONFLICT);
        }
        user.replaceRoles(newRoles);
        auditService.record(actorId, "USER_ROLES_UPDATED", "USER", id,
                "User roles were updated.");
        return UserDto.from(user);
    }

    @Transactional
    public UserDto updateActive(String id, boolean active, String actorId) {
        UserAccount user = requireUser(id);
        if (!active && user.isActive() && user.getRoles().contains(UserRole.ADMIN)
                && userRepository.countByRolesContainingAndActiveTrue(UserRole.ADMIN) <= 1) {
            throw new ApiException("The last active administrator cannot be deactivated.", HttpStatus.CONFLICT);
        }
        user.setActive(active);
        auditService.record(actorId, active ? "USER_ACTIVATED" : "USER_DEACTIVATED", "USER", id,
                "User active status was changed.");
        return UserDto.from(user);
    }

    private UserAccount requireUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));
    }
}
