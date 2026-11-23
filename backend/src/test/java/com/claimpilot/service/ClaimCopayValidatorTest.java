package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;

class ClaimCopayValidatorTest {

    private ClaimCopayValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ClaimCopayValidator();
    }

    @Test
    void shouldAcceptCopayLessThanClaimAmount() {
        assertTrue(validator.isValidCopay(new BigDecimal("1000.00"), new BigDecimal("200.00")));
    }

    @Test
    void shouldRejectCopayExceedingClaimAmount() {
        assertFalse(validator.isValidCopay(new BigDecimal("500.00"), new BigDecimal("600.00")));
        assertFalse(validator.isValidCopay(new BigDecimal("500.00"), new BigDecimal("-10.00")));
    }
}
