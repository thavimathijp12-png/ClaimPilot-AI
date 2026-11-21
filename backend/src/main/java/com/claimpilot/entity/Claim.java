package com.claimpilot.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.CascadeType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "claims", uniqueConstraints = @UniqueConstraint(
        name = "uk_claims_claim_number", columnNames = "claim_number"))
@EntityListeners(AuditingEntityListener.class)
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(length = 36, nullable = false, updatable = false)
    private String id;

    @Column(name = "claim_number", length = 32, nullable = false, updatable = false)
    private String claimNumber;

    @Column(name = "claimant_name", length = 160, nullable = false)
    private String claimantName;

    @Column(name = "claimant_dob")
    private LocalDate claimantDob;

    @Column(name = "claimant_gender", length = 40)
    private String claimantGender;

    @Column(name = "policy_number", length = 80, nullable = false)
    private String policyNumber;

    @Column(name = "policy_plan", length = 160)
    private String policyPlan;

    @Column(name = "hospital_name", length = 180, nullable = false)
    private String hospitalName;

    @Column(name = "hospital_npi", length = 10)
    private String hospitalNpi;

    @Column(name = "claim_type", length = 80, nullable = false)
    private String claimType;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "discharge_date")
    private LocalDate dischargeDate;

    @Column(name = "submission_date", nullable = false)
    private LocalDate submissionDate;

    @Column(name = "claim_amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal claimAmount;

    @Column(name = "approved_amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal approvedAmount = BigDecimal.ZERO;

    @Column(length = 3, nullable = false)
    private String currency = "INR";

    @Column(name = "copay_amount", precision = 14, scale = 2, nullable = false)
    private BigDecimal copayAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ClaimStatus status = ClaimStatus.PENDING_REVIEW;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private ClaimPriority priority = ClaimPriority.MEDIUM;

    @Column(name = "data_quality_score", precision = 5, scale = 2)
    private BigDecimal dataQualityScore;

    @Column(length = 2000)
    private String description;

    @Column(name = "review_notes", length = 4000)
    private String reviewNotes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_id", nullable = false)
    private UserAccount createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private UserAccount assignedTo;

    @ElementCollection
    @CollectionTable(name = "claim_diagnoses", joinColumns = @JoinColumn(name = "claim_id"))
    @OrderBy("code ASC")
    private List<ClaimCode> diagnosisCodes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "claim_procedures", joinColumns = @JoinColumn(name = "claim_id"))
    @OrderBy("code ASC")
    private List<ClaimCode> procedureCodes = new ArrayList<>();

    @OneToMany(mappedBy = "claim", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    private List<ClaimEvent> timeline = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    protected Claim() {
    }

    public Claim(String claimantName, String policyNumber, String hospitalName, String claimType,
                 BigDecimal claimAmount, UserAccount createdBy) {
        this.claimNumber = "CLM-" + LocalDate.now().getYear() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase(java.util.Locale.ROOT);
        this.claimantName = claimantName;
        this.policyNumber = policyNumber;
        this.hospitalName = hospitalName;
        this.claimType = claimType;
        this.claimAmount = claimAmount;
        this.createdBy = createdBy;
        this.submissionDate = LocalDate.now();
    }

    public void addTimelineEvent(ClaimEvent event) {
        timeline.add(event);
        event.setClaim(this);
    }

    public void setOptionalFields(LocalDate claimantDob, String claimantGender, String policyPlan,
                                  String hospitalNpi, LocalDate admissionDate, LocalDate dischargeDate,
                                  BigDecimal copayAmount, ClaimPriority priority, String description,
                                  String reviewNotes, UserAccount assignedTo,
                                  List<ClaimCode> diagnosisCodes, List<ClaimCode> procedureCodes) {
        this.claimantDob = claimantDob;
        this.claimantGender = claimantGender;
        this.policyPlan = policyPlan;
        this.hospitalNpi = hospitalNpi;
        this.admissionDate = admissionDate;
        this.dischargeDate = dischargeDate;
        this.copayAmount = copayAmount == null ? BigDecimal.ZERO : copayAmount;
        this.priority = priority == null ? ClaimPriority.MEDIUM : priority;
        this.description = description;
        this.reviewNotes = reviewNotes;
        this.assignedTo = assignedTo;
        this.diagnosisCodes = new ArrayList<>(diagnosisCodes);
        this.procedureCodes = new ArrayList<>(procedureCodes);
    }

    public void updateDetails(String claimantName, String policyNumber, String hospitalName, String claimType,
                              BigDecimal claimAmount, LocalDate claimantDob, String claimantGender,
                              String policyPlan, String hospitalNpi, LocalDate admissionDate,
                              LocalDate dischargeDate, BigDecimal copayAmount, ClaimPriority priority,
                              String description, String reviewNotes, UserAccount assignedTo,
                              List<ClaimCode> diagnosisCodes, List<ClaimCode> procedureCodes) {
        if (claimantName != null) this.claimantName = claimantName;
        if (policyNumber != null) this.policyNumber = policyNumber;
        if (hospitalName != null) this.hospitalName = hospitalName;
        if (claimType != null) this.claimType = claimType;
        if (claimAmount != null) this.claimAmount = claimAmount;
        if (claimantDob != null) this.claimantDob = claimantDob;
        if (claimantGender != null) this.claimantGender = claimantGender;
        if (policyPlan != null) this.policyPlan = policyPlan;
        if (hospitalNpi != null) this.hospitalNpi = hospitalNpi;
        if (admissionDate != null) this.admissionDate = admissionDate;
        if (dischargeDate != null) this.dischargeDate = dischargeDate;
        if (copayAmount != null) this.copayAmount = copayAmount;
        if (priority != null) this.priority = priority;
        if (description != null) this.description = description;
        if (reviewNotes != null) this.reviewNotes = reviewNotes;
        if (assignedTo != null) this.assignedTo = assignedTo;
        if (diagnosisCodes != null) this.diagnosisCodes = new ArrayList<>(diagnosisCodes);
        if (procedureCodes != null) this.procedureCodes = new ArrayList<>(procedureCodes);
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }

    public void setAssignedTo(UserAccount assignedTo) {
        this.assignedTo = assignedTo;
    }

    public void applyApprovalDecision(ClaimStatus status, BigDecimal approvedAmount, String reviewNotes) {
        this.status = status;
        this.approvedAmount = approvedAmount;
        this.reviewNotes = reviewNotes;
    }

    public void setApprovedAmount(BigDecimal approvedAmount) {
        this.approvedAmount = approvedAmount;
    }

    public void setDataQualityScore(BigDecimal dataQualityScore) {
        this.dataQualityScore = dataQualityScore;
    }

    public String getId() { return id; }
    public String getClaimNumber() { return claimNumber; }
    public String getClaimantName() { return claimantName; }
    public LocalDate getClaimantDob() { return claimantDob; }
    public String getClaimantGender() { return claimantGender; }
    public String getPolicyNumber() { return policyNumber; }
    public String getPolicyPlan() { return policyPlan; }
    public String getHospitalName() { return hospitalName; }
    public String getHospitalNpi() { return hospitalNpi; }
    public String getClaimType() { return claimType; }
    public LocalDate getAdmissionDate() { return admissionDate; }
    public LocalDate getDischargeDate() { return dischargeDate; }
    public LocalDate getSubmissionDate() { return submissionDate; }
    public BigDecimal getClaimAmount() { return claimAmount; }
    public BigDecimal getApprovedAmount() { return approvedAmount; }
    public String getCurrency() { return currency; }
    public BigDecimal getCopayAmount() { return copayAmount; }
    public ClaimStatus getStatus() { return status; }
    public ClaimPriority getPriority() { return priority; }
    public BigDecimal getDataQualityScore() { return dataQualityScore; }
    public String getDescription() { return description; }
    public String getReviewNotes() { return reviewNotes; }
    public UserAccount getCreatedBy() { return createdBy; }
    public UserAccount getAssignedTo() { return assignedTo; }
    public List<ClaimCode> getDiagnosisCodes() { return List.copyOf(diagnosisCodes); }
    public List<ClaimCode> getProcedureCodes() { return List.copyOf(procedureCodes); }
    public List<ClaimEvent> getTimeline() { return List.copyOf(timeline); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
