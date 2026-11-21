package com.claimpilot.service;

import com.claimpilot.dto.auth.AuthResponse;
import com.claimpilot.dto.auth.LoginRequest;
import com.claimpilot.dto.auth.RegisterRequest;
import com.claimpilot.dto.user.UserDto;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.UserAccountRepository;
import com.claimpilot.security.JwtTokenService;
import com.claimpilot.security.UserPrincipal;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.Locale;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService tokenService;
    private final UserAccountDetailsService userDetailsService;
    private final AuditService auditService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserAccountRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenService tokenService,
                       UserAccountDetailsService userDetailsService,
                       AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.userDetailsService = userDetailsService;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ApiException("An account already exists for this email.", HttpStatus.CONFLICT);
        }

        UserAccount user = new UserAccount(
                email,
                request.name().trim(),
                passwordEncoder.encode(request.password()),
                Set.of(UserRole.USER)
        );
        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ApiException("An account already exists for this email.", ex, HttpStatus.CONFLICT);
        }

        UserPrincipal principal = (UserPrincipal) userDetailsService.loadUserByUsername(email);
        auditService.record(user.getId(), "USER_REGISTERED", "USER", user.getId(),
                "A self-service account was registered.");
        return createAuthResponse(principal);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(
                        normalizeEmail(request.email()), request.password()
                )
        );
        UserDetails user = (UserDetails) authentication.getPrincipal();
        UserPrincipal principal = (UserPrincipal) user;
        auditService.record(principal.id(), "AUTH_LOGIN", "USER", principal.id(),
                "Authentication succeeded.");
        return createAuthResponse(principal);
    }

    private AuthResponse createAuthResponse(UserPrincipal principal) {
        UserAccount user = userRepository.findByEmailIgnoreCase(principal.username())
                .orElseThrow(() -> new ApiException("Authenticated account could not be loaded.",
                        HttpStatus.INTERNAL_SERVER_ERROR));
        return new AuthResponse("Bearer", tokenService.issueToken(principal),
                tokenService.getExpirationMs(), UserDto.from(user));
    }

    public static String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
