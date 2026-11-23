package com.claimpilot.service;

import com.claimpilot.dto.document.DocumentDto;
import com.claimpilot.entity.Claim;
import com.claimpilot.entity.ClaimDocument;
import com.claimpilot.entity.DocumentStatus;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.ClaimDocumentRepository;
import com.claimpilot.repository.ClaimRepository;
import com.claimpilot.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Service
public class DocumentService {

    private static final long DEFAULT_MAX_FILE_SIZE = 20L * 1024 * 1024;
    private final ClaimDocumentRepository documentRepository;
    private final ClaimRepository claimRepository;
    private final UserAccountRepository userRepository;
    private final DocumentStorageService storageService;
    private final AuditService auditService;
    private final long maxFileSize;

    public DocumentService(ClaimDocumentRepository documentRepository,
                           ClaimRepository claimRepository,
                           UserAccountRepository userRepository,
                           DocumentStorageService storageService,
                           AuditService auditService,
                           @Value("${claimpilot.documents.max-file-size-bytes:20971520}") long maxFileSize) {
        this.documentRepository = documentRepository;
        this.claimRepository = claimRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.auditService = auditService;
        this.maxFileSize = maxFileSize > 0 ? maxFileSize : DEFAULT_MAX_FILE_SIZE;
    }

    @Transactional
    public DocumentDto upload(String claimNumber, MultipartFile file, String category,
                              String description, String actorId) throws IOException {
        Claim claim = claimRepository.findByClaimNumber(claimNumber)
                .orElseThrow(() -> new ApiException("Claim not found.", HttpStatus.NOT_FOUND));
        UserAccount actor = requireUser(actorId);
        if (file == null || file.isEmpty()) {
            throw new ApiException("A non-empty document file is required.");
        }
        if (file.getSize() > maxFileSize) {
            throw new ApiException("The document exceeds the maximum permitted size.", HttpStatus.PAYLOAD_TOO_LARGE);
        }
        String originalName = sanitizeFileName(file.getOriginalFilename());
        byte[] content = file.getBytes();
        DocumentStorageService.StoredFile stored = storageService.store(content);
        try {
            ClaimDocument document = documentRepository.saveAndFlush(new ClaimDocument(
                    claim,
                    actor,
                    originalName,
                    stored.storageKey(),
                    stored.contentType(),
                    content.length,
                    stored.sha256(),
                    category == null || category.isBlank() ? "Other Supporting Documents" : category.trim(),
                    description == null ? null : description.trim()
            ));
            auditService.record(actorId, "DOCUMENT_UPLOADED", "DOCUMENT", document.getId(),
                    "Document uploaded for claim " + claimNumber + "; type=" + stored.contentType()
                            + "; bytes=" + content.length + ".");
            return DocumentDto.from(document);
        } catch (RuntimeException ex) {
            try {
                storageService.deleteStoredFile(stored.storageKey());
            } catch (IOException cleanupException) {
                ex.addSuppressed(cleanupException);
            }
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> listForClaim(String claimNumber) {
        if (!claimRepository.existsByClaimNumber(claimNumber)) {
            throw new ApiException("Claim not found.", HttpStatus.NOT_FOUND);
        }
        return documentRepository.findByClaim_ClaimNumberAndStatusNotOrderByUploadedAtDesc(
                        claimNumber, DocumentStatus.REMOVED)
                .stream().map(DocumentDto::from).toList();
    }

    @Transactional(readOnly = true)
    public DocumentDto getMetadata(String id) {
        return DocumentDto.from(requireDocument(id));
    }

    @Transactional
    public DownloadedDocument getContent(String id, String actorId) {
        ClaimDocument document = requireDocument(id);
        Path path = storageService.requireStoredFile(document.getStorageKey());
        auditService.record(actorId, "DOCUMENT_DOWNLOADED", "DOCUMENT", id,
                "Document content was downloaded.");
        return new DownloadedDocument(path, document.getOriginalName(), document.getContentType());
    }

    @Transactional
    public void remove(String id, String actorId) {
        ClaimDocument document = requireDocument(id);
        document.markRemoved(requireUser(actorId));
        auditService.record(actorId, "DOCUMENT_REMOVED", "DOCUMENT", id,
                "Document was soft-removed from claim " + document.getClaim().getClaimNumber() + ".");
    }

    public record DownloadedDocument(Path path, String filename, String contentType) { }

    private ClaimDocument requireDocument(String id) {
        return documentRepository.findByIdAndStatusNot(id, DocumentStatus.REMOVED)
                .orElseThrow(() -> new ApiException("Document not found.", HttpStatus.NOT_FOUND));
    }

    private UserAccount requireUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException("User not found.", HttpStatus.NOT_FOUND));
    }

    private static String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new ApiException("A document filename is required.");
        }
        String normalized = fileName.replace('\\', '/');
        String name = normalized.substring(normalized.lastIndexOf('/') + 1).trim();
        if (name.isBlank() || name.equals(".") || name.equals("..") || name.length() > 255
                || name.chars().anyMatch(Character::isISOControl)) {
            throw new ApiException("The document filename is invalid.");
        }
        return name;
    }
}
