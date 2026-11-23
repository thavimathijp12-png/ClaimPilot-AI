package com.claimpilot.dto.claim;

import com.claimpilot.entity.ClaimPriority;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateClaimRequest(
        @Size(min = 1, max = 160) String claimantName,
        LocalDate claimantDob,
        @Size(max = 40) String claimantGender,
        @Size(min = 1, max = 80) String policyNumber,
        @Size(max = 160) String policyPlan,
        @Size(min = 1, max = 180) String hospitalName,
        @Pattern(regexp = "\\d{10}", message = "must be a 10-digit NPI") String hospitalNpi,
        @Size(min = 1, max = 80) String claimType,
        LocalDate admissionDate,
        LocalDate dischargeDate,
        @DecimalMin(value = "0.00") BigDecimal claimAmount,
        @DecimalMin(value = "0.00") BigDecimal copayAmount,
        ClaimPriority priority,
        @Size(max = 2000) String description,
        @Size(max = 4000) String reviewNotes,
        String assignedToId,
        List<@Valid ClaimCodeRequest> diagnosisCodes,
        List<@Valid ClaimCodeRequest> procedureCodes
) {
}
