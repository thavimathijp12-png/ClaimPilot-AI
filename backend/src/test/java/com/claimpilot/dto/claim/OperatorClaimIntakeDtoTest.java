package com.claimpilot.dto.claim;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class OperatorClaimIntakeDtoTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void shouldValidateValidIntakePayload() {
        OperatorClaimIntakeDto dto = new OperatorClaimIntakeDto(
                "Jane Doe", "POL-992-001", "Apollo Hospitals", "INPATIENT",
                new BigDecimal("45000.00"), "INR",
                LocalDate.now().minusDays(2), LocalDate.now(), "Routine admission"
        );
        Set<ConstraintViolation<OperatorClaimIntakeDto>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty(), "Should have no violations for valid payload");
    }

    @Test
    void shouldRejectZeroOrNegativeAmount() {
        OperatorClaimIntakeDto dto = new OperatorClaimIntakeDto(
                "Jane Doe", "POL-992-001", "Apollo Hospitals", "INPATIENT",
                BigDecimal.ZERO, "INR",
                LocalDate.now().minusDays(2), LocalDate.now(), "Routine admission"
        );
        Set<ConstraintViolation<OperatorClaimIntakeDto>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty(), "Should fail on zero amount");
    }
}
