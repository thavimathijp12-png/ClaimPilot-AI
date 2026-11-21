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

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "claim_approvals")
public class ClaimApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private UserAccount reviewer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private ApprovalDecision decision;

    @Column(length = 2000)
    private String reason;

    @Column(name = "approved_amount", precision = 14, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "decided_at", nullable = false, updatable = false)
    private Instant decidedAt = Instant.now();

    protected ClaimApproval() {
    }

    public ClaimApproval(Claim claim, UserAccount reviewer, ApprovalDecision decision,
                         String reason, BigDecimal approvedAmount) {
        this.claim = claim;
        this.reviewer = reviewer;
        this.decision = decision;
        this.reason = reason;
        this.approvedAmount = approvedAmount;
    }

    public String getId() { return id; }
    public Claim getClaim() { return claim; }
    public UserAccount getReviewer() { return reviewer; }
    public ApprovalDecision getDecision() { return decision; }
    public String getReason() { return reason; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public Instant getDecidedAt() { return decidedAt; }
}
