package com.claimpilot.service;

import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class ClaimDateChronologyValidator {

    public boolean isValidEncounterDates(LocalDate admissionDate, LocalDate dischargeDate, LocalDate submissionDate) {
        if (admissionDate != null && dischargeDate != null && admissionDate.isAfter(dischargeDate)) {
            return false;
        }
        if (dischargeDate != null && submissionDate != null && dischargeDate.isAfter(submissionDate)) {
            return false;
        }
        if (admissionDate != null && submissionDate != null && admissionDate.isAfter(submissionDate)) {
            return false;
        }
        return true;
    }
}
