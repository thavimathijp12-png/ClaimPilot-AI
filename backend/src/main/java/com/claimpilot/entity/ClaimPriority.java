package com.claimpilot.entity;

public enum ClaimPriority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High");

    private final String label;

    ClaimPriority(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
