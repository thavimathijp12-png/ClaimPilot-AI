package com.claimpilot.repository;

import com.claimpilot.entity.DataGuardRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DataGuardRunRepository extends JpaRepository<DataGuardRun, String> {

    List<DataGuardRun> findByClaim_ClaimNumberOrderByLastCheckedDesc(String claimNumber);

    Optional<DataGuardRun> findTopByClaim_ClaimNumberOrderByLastCheckedDesc(String claimNumber);
}
