package com.claimpilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "claim_events")
public class ClaimEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private UserAccount actor;

    @Column(length = 120, nullable = false)
    private String title;

    @Column(length = 2000, nullable = false)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected ClaimEvent() {
    }

    public ClaimEvent(UserAccount actor, String title, String description) {
        this.actor = actor;
        this.title = title;
        this.description = description;
    }

    void setClaim(Claim claim) {
        this.claim = claim;
    }

    public String getId() { return id; }
    public UserAccount getActor() { return actor; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
}
