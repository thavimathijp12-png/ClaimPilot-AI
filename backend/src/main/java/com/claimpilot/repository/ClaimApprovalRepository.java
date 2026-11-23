package com.claimpilot.repository;

import com.claimpilot.entity.ClaimApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClaimApprovalRepository extends JpaRepository<ClaimApproval, String> {

    List<ClaimApproval> findByClaim_ClaimNumberOrderByDecidedAtDesc(String claimNumber);
}
