package com.claimpilot.entity;

public enum ClaimStatus {
    IN_EXTRACTION("In Extraction"),
    UNDER_AI_AUDIT("Under AI Audit"),
    PENDING_REVIEW("Pending Review"),
    CORRECTION_REQUESTED("Correction Requested"),
    APPROVED("Approved"),
    REJECTED("Rejected");

    private final String label;

    ClaimStatus(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
