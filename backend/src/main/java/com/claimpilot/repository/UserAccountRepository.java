package com.claimpilot.repository;

import com.claimpilot.entity.UserAccount;
import com.claimpilot.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserAccountRepository extends JpaRepository<UserAccount, String> {

    Optional<UserAccount> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    long countByRolesContainingAndActiveTrue(UserRole role);

    List<UserAccount> findAllByOrderByCreatedAtDesc();
}
