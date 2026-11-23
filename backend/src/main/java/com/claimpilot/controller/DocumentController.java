package com.claimpilot.controller;

import com.claimpilot.dto.ApiResponse;
import com.claimpilot.dto.document.DocumentDto;
import com.claimpilot.security.UserPrincipal;
import com.claimpilot.service.DocumentService;
import jakarta.validation.constraints.Size;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('ADMIN','OPERATOR','REVIEWER','AUDITOR')")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(path = "/claims/{claimNumber}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<DocumentDto>> upload(
            @PathVariable String claimNumber,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) @Size(max = 120) String category,
            @RequestParam(required = false) @Size(max = 1000) String description,
            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        return ResponseEntity.status(201).body(ApiResponse.success(
                "Document uploaded.",
                documentService.upload(claimNumber, file, category, description, principal.id())
        ));
    }

    @GetMapping("/claims/{claimNumber}/documents")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> list(@PathVariable String claimNumber) {
        return ResponseEntity.ok(ApiResponse.success(documentService.listForClaim(claimNumber)));
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<ApiResponse<DocumentDto>> metadata(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(documentService.getMetadata(id)));
    }

    @GetMapping("/documents/{id}/content")
    public ResponseEntity<Resource> content(@PathVariable String id,
                                            @AuthenticationPrincipal UserPrincipal principal) throws IOException {
        DocumentService.DownloadedDocument document = documentService.getContent(id, principal.id());
        Resource resource = new FileSystemResource(document.path());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.contentType()))
                .contentLength(resource.contentLength())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(document.filename(), StandardCharsets.UTF_8)
                                .build().toString())
                .body(resource);
    }

    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','OPERATOR')")
    public ResponseEntity<ApiResponse<Void>> remove(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        documentService.remove(id, principal.id());
        return ResponseEntity.ok(ApiResponse.success("Document removed.", null));
    }
}
