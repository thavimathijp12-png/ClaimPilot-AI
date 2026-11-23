package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class ClaimDateChronologyValidatorTest {

    private ClaimDateChronologyValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ClaimDateChronologyValidator();
    }

    @Test
    void shouldApproveValidChronology() {
        LocalDate adm = LocalDate.now().minusDays(5);
        LocalDate dis = LocalDate.now().minusDays(2);
        LocalDate sub = LocalDate.now();
        assertTrue(validator.isValidEncounterDates(adm, dis, sub));
    }

    @Test
    void shouldRejectAdmissionAfterDischarge() {
        LocalDate adm = LocalDate.now().minusDays(1);
        LocalDate dis = LocalDate.now().minusDays(3);
        LocalDate sub = LocalDate.now();
        assertFalse(validator.isValidEncounterDates(adm, dis, sub));
    }
}
