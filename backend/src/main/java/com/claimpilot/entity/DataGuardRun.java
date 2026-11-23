package com.claimpilot.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dataguard_runs")
@EntityListeners(AuditingEntityListener.class)
public class DataGuardRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "triggered_by_id", nullable = false)
    private UserAccount triggeredBy;

    @Column(nullable = false)
    private int score;

    @Column(name = "valid_count", nullable = false)
    private int validCount;

    @Column(name = "missing_count", nullable = false)
    private int missingCount;

    @Column(name = "invalid_count", nullable = false)
    private int invalidCount;

    @Column(name = "inconsistent_count", nullable = false)
    private int inconsistentCount;

    @Column(name = "duplicate_warnings_count", nullable = false)
    private int duplicateWarningsCount;

    @CreatedDate
    @Column(name = "last_checked", nullable = false, updatable = false)
    private Instant lastChecked;

    @OneToMany(mappedBy = "run", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<DataGuardCheck> items = new ArrayList<>();

    protected DataGuardRun() {
    }

    public DataGuardRun(Claim claim, UserAccount triggeredBy, int score,
                        int validCount, int missingCount, int invalidCount,
                        int inconsistentCount, int duplicateWarningsCount) {
        this.claim = claim;
        this.triggeredBy = triggeredBy;
        this.score = score;
        this.validCount = validCount;
        this.missingCount = missingCount;
        this.invalidCount = invalidCount;
        this.inconsistentCount = inconsistentCount;
        this.duplicateWarningsCount = duplicateWarningsCount;
    }

    public void addItem(DataGuardCheck item) {
        items.add(item);
        item.setRun(this);
    }

    public String getId() { return id; }
    public Claim getClaim() { return claim; }
    public UserAccount getTriggeredBy() { return triggeredBy; }
    public int getScore() { return score; }
    public int getValidCount() { return validCount; }
    public int getMissingCount() { return missingCount; }
    public int getInvalidCount() { return invalidCount; }
    public int getInconsistentCount() { return inconsistentCount; }
    public int getDuplicateWarningsCount() { return duplicateWarningsCount; }
    public Instant getLastChecked() { return lastChecked; }
    public List<DataGuardCheck> getItems() { return List.copyOf(items); }
}
