package com.claimpilot.repository;

import com.claimpilot.dto.analytics.ClaimStatusCountDto;
import com.claimpilot.dto.analytics.DailyClaimCountDto;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimStatus;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.math.BigDecimal;

public interface ClaimRepository extends JpaRepository<Claim, String>, JpaSpecificationExecutor<Claim> {

        Optional<Claim> findByClaimNumber(String claimNumber);

        boolean existsByClaimNumber(String claimNumber);

        boolean existsByPolicyNumberIgnoreCaseAndClaimantNameIgnoreCaseAndHospitalNameIgnoreCaseAndAdmissionDateAndIdNot(
                        String policyNumber, String claimantName, String hospitalName,
                        java.time.LocalDate admissionDate, String id);

        List<Claim> findAllByOrderByCreatedAtDesc();

        List<Claim> findByStatusOrderByCreatedAtDesc(ClaimStatus status);

        @Lock(LockModeType.PESSIMISTIC_WRITE)
        @Query("select c from Claim c where c.claimNumber = :claimNumber")
        Optional<Claim> findByClaimNumberForUpdate(@Param("claimNumber") String claimNumber);

        long countBySubmissionDateBetween(LocalDate from, LocalDate to);

        long countByStatusAndSubmissionDateBetween(ClaimStatus status, LocalDate from, LocalDate to);

        @Query("select new com.claimpilot.dto.analytics.ClaimStatusCountDto(c.status, count(c)) "
                        + "from Claim c where c.submissionDate between :from and :to group by c.status")
        List<ClaimStatusCountDto> countByStatusBetween(
                        @Param("from") LocalDate from, @Param("to") LocalDate to);

        @Query("select new com.claimpilot.dto.analytics.DailyClaimCountDto(c.submissionDate, count(c)) "
                        + "from Claim c where c.submissionDate between :from and :to "
                        + "group by c.submissionDate order by c.submissionDate")
        List<DailyClaimCountDto> countBySubmissionDateGrouped(
                        @Param("from") LocalDate from, @Param("to") LocalDate to);

        @Query("select sum(c.claimAmount) from Claim c where c.submissionDate between :from and :to")
        BigDecimal sumClaimAmountBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

        @Query("select sum(c.approvedAmount) from Claim c where c.submissionDate between :from and :to")
        BigDecimal sumApprovedAmountBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

        @Query("select avg(c.dataQualityScore) from Claim c where c.submissionDate between :from and :to")
        BigDecimal averageDataQualityBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
