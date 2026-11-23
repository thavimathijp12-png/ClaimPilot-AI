package com.claimpilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ClaimCode {

    @Column(name = "code", length = 32, nullable = false)
    private String code;

    @Column(name = "description", length = 500)
    private String description;

    protected ClaimCode() {
    }

    public ClaimCode(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }
}
