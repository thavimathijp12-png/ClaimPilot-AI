package com.claimpilot.dto.claim;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OperatorClaimIntakeDto(
        @NotBlank(message = "Claimant name is required")
        @Size(max = 160, message = "Claimant name must not exceed 160 characters")
        String claimantName,

        @NotBlank(message = "Policy number is required")
        @Size(max = 80, message = "Policy number must not exceed 80 characters")
        String policyNumber,

        @NotBlank(message = "Hospital name is required")
        @Size(max = 180, message = "Hospital name must not exceed 180 characters")
        String hospitalName,

        @NotBlank(message = "Claim type is required")
        String claimType,

        @NotNull(message = "Claim amount is required")
        @DecimalMin(value = "0.01", message = "Claim amount must be greater than zero")
        BigDecimal claimAmount,

        @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code")
        String currency,

        LocalDate admissionDate,
        LocalDate dischargeDate,
        String description
) {
    public OperatorClaimIntakeDto {
        if (currency == null || currency.isBlank()) {
            currency = "INR";
        }
    }
}
