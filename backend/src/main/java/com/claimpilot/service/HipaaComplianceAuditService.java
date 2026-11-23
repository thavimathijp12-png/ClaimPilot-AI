package com.claimpilot.service;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class HipaaComplianceAuditService {

    private static final Pattern SSN_PATTERN = Pattern.compile("\\b\\d{3}-\\d{2}-\\d{4}\\b");
    private static final Pattern AADHAAR_PATTERN = Pattern.compile("\\b\\d{4}\\s?\\d{4}\\s?\\d{4}\\b");
    private static final Pattern CREDIT_CARD_PATTERN = Pattern.compile("\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b");

    public List<String> inspectText(String text) {
        List<String> findings = new ArrayList<>();
        if (text == null || text.isBlank()) return findings;

        if (SSN_PATTERN.matcher(text).find()) {
            findings.add("Potential unmasked US Social Security Number (SSN) detected.");
        }
        if (AADHAAR_PATTERN.matcher(text).find()) {
            findings.add("Potential unmasked Indian National ID (Aadhaar) number detected.");
        }
        if (CREDIT_CARD_PATTERN.matcher(text).find()) {
            findings.add("Potential unmasked payment card number detected in clinical narrative.");
        }
        return findings;
    }
}
