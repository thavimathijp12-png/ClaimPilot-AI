package com.claimpilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "dataguard_checks")
public class DataGuardCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "run_id", nullable = false)
    private DataGuardRun run;

    @Column(name = "field_name", length = 120, nullable = false)
    private String field;

    @Column(name = "source_document", length = 255)
    private String sourceDoc;

    @Column(name = "extracted_value", length = 1000)
    private String extractedValue;

    @Column(name = "expected_value", length = 1000)
    private String expectedValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DataGuardSeverity severity;

    @Column(length = 40, nullable = false)
    private String status;

    @Column(length = 1000, nullable = false)
    private String explanation;

    @Column(length = 1000, nullable = false)
    private String recommendation;

    protected DataGuardCheck() {
    }

    public DataGuardCheck(String field, String sourceDoc, String extractedValue,
                          String expectedValue, DataGuardSeverity severity, String status,
                          String explanation, String recommendation) {
        this.field = field;
        this.sourceDoc = sourceDoc;
        this.extractedValue = extractedValue;
        this.expectedValue = expectedValue;
        this.severity = severity;
        this.status = status;
        this.explanation = explanation;
        this.recommendation = recommendation;
    }

    void setRun(DataGuardRun run) {
        this.run = run;
    }

    public String getId() { return id; }
    public String getField() { return field; }
    public String getSourceDoc() { return sourceDoc; }
    public String getExtractedValue() { return extractedValue; }
    public String getExpectedValue() { return expectedValue; }
    public DataGuardSeverity getSeverity() { return severity; }
    public String getStatus() { return status; }
    public String getExplanation() { return explanation; }
    public String getRecommendation() { return recommendation; }
}
