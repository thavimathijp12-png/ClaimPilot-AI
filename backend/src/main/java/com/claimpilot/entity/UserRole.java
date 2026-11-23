package com.claimpilot.entity;

public enum UserRole {
    USER("User", "user"),
    ADMIN("Admin", "admin"),
    OPERATOR("Claims Operator", "operator"),
    REVIEWER("Claims Reviewer", "reviewer"),
    AUDITOR("Auditor", "auditor"),
    ANALYST("Analyst", "analyst"),
    DATA_STEWARD("Data Steward", "data_steward");

    private final String label;
    private final String code;

    UserRole(String label, String code) {
        this.label = label;
        this.code = code;
    }

    public String label() {
        return label;
    }

    public String code() {
        return code;
    }

    public String authority() {
        return "ROLE_" + name();
    }
}
