package com.claimpilot.config;

import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import com.claimpilot.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Component
public class BootstrapAdminRunner implements ApplicationRunner {

    private final UserAccountRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public BootstrapAdminRunner(UserAccountRepository userRepository,
                                PasswordEncoder passwordEncoder,
                                @Value("${claimpilot.bootstrap.admin-email:}") String adminEmail,
                                @Value("${claimpilot.bootstrap.admin-password:}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        // 1. Admin Account: Dr. Thavimathi
        userRepository.findByEmailIgnoreCase("admin@claimpilot.ai").ifPresentOrElse(
                user -> {
                    if (!"Dr. Thavimathi".equals(user.getName())) {
                        user.setName("Dr. Thavimathi");
                        userRepository.save(user);
                    }
                },
                () -> {
                    UserAccount adminAccount = new UserAccount(
                            "admin@claimpilot.ai",
                            "Dr. Thavimathi",
                            passwordEncoder.encode("admin123"),
                            Set.of(UserRole.ADMIN)
                    );
                    userRepository.save(adminAccount);
                }
        );

        // 2. Reviewer Account: KirubhaShree
        userRepository.findByEmailIgnoreCase("reviewer@claimpilot.ai").ifPresentOrElse(
                user -> {
                    if (!"KirubhaShree".equals(user.getName())) {
                        user.setName("KirubhaShree");
                        userRepository.save(user);
                    }
                },
                () -> {
                    UserAccount reviewerAccount = new UserAccount(
                            "reviewer@claimpilot.ai",
                            "KirubhaShree",
                            passwordEncoder.encode("reviewer123"),
                            Set.of(UserRole.REVIEWER)
                    );
                    userRepository.save(reviewerAccount);
                }
        );

        // 3. Operator Account: Varshini
        userRepository.findByEmailIgnoreCase("operator@claimpilot.ai").ifPresentOrElse(
                user -> {
                    if (!"Varshini".equals(user.getName())) {
                        user.setName("Varshini");
                        userRepository.save(user);
                    }
                },
                () -> {
                    UserAccount operatorAccount = new UserAccount(
                            "operator@claimpilot.ai",
                            "Varshini",
                            passwordEncoder.encode("operator123"),
                            Set.of(UserRole.OPERATOR)
                    );
                    userRepository.save(operatorAccount);
                }
        );

        // 4. Custom Bootstrap Administrator (if configured and not already present)
        if (adminEmail != null && !adminEmail.isBlank()) {
            String normalizedEmail = adminEmail.trim().toLowerCase(Locale.ROOT);
            if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                String effectiveAdminPassword = adminPassword.isBlank() || adminPassword.length() < 12
                        ? "Admin@ClaimPilot2026!"
                        : adminPassword;
                UserAccount customAdmin = new UserAccount(
                        normalizedEmail,
                        "Dr. Thavimathi",
                        passwordEncoder.encode(effectiveAdminPassword),
                        Set.of(UserRole.ADMIN)
                );
                userRepository.save(customAdmin);
            }
        }
    }
}
