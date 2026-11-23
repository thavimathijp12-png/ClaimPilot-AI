package com.claimpilot.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "audit_events", indexes = {
        @Index(name = "idx_audit_resource", columnList = "resource_type, resource_id"),
        @Index(name = "idx_audit_occurred_at", columnList = "occurred_at")
})
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false, updatable = false)
    private UserAccount actor;

    @Column(length = 80, nullable = false, updatable = false)
    private String action;

    @Column(name = "resource_type", length = 80, nullable = false, updatable = false)
    private String resourceType;

    @Column(name = "resource_id", length = 100, nullable = false, updatable = false)
    private String resourceId;

    @Column(length = 1000, nullable = false, updatable = false)
    private String details;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt = Instant.now();

    protected AuditEvent() {
    }

    public AuditEvent(UserAccount actor, String action, String resourceType,
                      String resourceId, String details) {
        this.actor = actor;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.details = details;
    }

    public String getId() { return id; }
    public UserAccount getActor() { return actor; }
    public String getAction() { return action; }
    public String getResourceType() { return resourceType; }
    public String getResourceId() { return resourceId; }
    public String getDetails() { return details; }
    public Instant getOccurredAt() { return occurredAt; }
}
