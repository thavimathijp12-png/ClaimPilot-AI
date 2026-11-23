package com.claimpilot.service;

import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.HexFormat;

@Service
public class ClaimDuplicateDetectorService {

    public String generateFingerprint(String policyNumber, String hospitalNpi, LocalDate admissionDate) {
        if (policyNumber == null || hospitalNpi == null || admissionDate == null) {
            return null;
        }
        String raw = policyNumber.trim().toUpperCase() + "|" + hospitalNpi.trim() + "|" + admissionDate.toString();
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
