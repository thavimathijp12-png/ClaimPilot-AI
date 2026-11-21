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
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.EntityListeners;

import java.time.Instant;

@Entity
@Table(name = "claim_documents")
@EntityListeners(AuditingEntityListener.class)
public class ClaimDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private UserAccount uploadedBy;

    @Column(name = "original_name", length = 255, nullable = false)
    private String originalName;

    @Column(name = "storage_key", length = 64, nullable = false, unique = true)
    private String storageKey;

    @Column(name = "content_type", length = 80, nullable = false)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "sha256", length = 64, nullable = false)
    private String sha256;

    @Column(length = 120, nullable = false)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private DocumentStatus status = DocumentStatus.PENDING_REVIEW;

    @Column(name = "page_count", nullable = false)
    private int pageCount = 1;

    @Column(length = 1000)
    private String description;

    @CreatedDate
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;

    @Column(name = "removed_at")
    private Instant removedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "removed_by_id")
    private UserAccount removedBy;

    protected ClaimDocument() {
    }

    public ClaimDocument(Claim claim, UserAccount uploadedBy, String originalName, String storageKey,
                         String contentType, long sizeBytes, String sha256, String category,
                         String description) {
        this.claim = claim;
        this.uploadedBy = uploadedBy;
        this.originalName = originalName;
        this.storageKey = storageKey;
        this.contentType = contentType;
        this.sizeBytes = sizeBytes;
        this.sha256 = sha256;
        this.category = category;
        this.description = description;
    }

    public void markRemoved(UserAccount actor) {
        this.status = DocumentStatus.REMOVED;
        this.removedAt = Instant.now();
        this.removedBy = actor;
    }

    public String getId() { return id; }
    public Claim getClaim() { return claim; }
    public UserAccount getUploadedBy() { return uploadedBy; }
    public String getOriginalName() { return originalName; }
    public String getStorageKey() { return storageKey; }
    public String getContentType() { return contentType; }
    public long getSizeBytes() { return sizeBytes; }
    public String getSha256() { return sha256; }
    public String getCategory() { return category; }
    public DocumentStatus getStatus() { return status; }
    public int getPageCount() { return pageCount; }
    public String getDescription() { return description; }
    public Instant getUploadedAt() { return uploadedAt; }
}
