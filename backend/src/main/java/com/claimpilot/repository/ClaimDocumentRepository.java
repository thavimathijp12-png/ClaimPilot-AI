package com.claimpilot.repository;

import com.claimpilot.entity.ClaimDocument;
import com.claimpilot.entity.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClaimDocumentRepository extends JpaRepository<ClaimDocument, String> {

    List<ClaimDocument> findByClaim_ClaimNumberAndStatusNotOrderByUploadedAtDesc(
            String claimNumber, DocumentStatus status);

    Optional<ClaimDocument> findByIdAndStatusNot(String id, DocumentStatus status);

    long countByClaim_ClaimNumberAndStatusNot(String claimNumber, DocumentStatus status);

    long countByStatusNot(DocumentStatus status);
}
