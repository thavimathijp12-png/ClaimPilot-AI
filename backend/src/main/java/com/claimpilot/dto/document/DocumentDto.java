package com.claimpilot.dto.document;

import com.claimpilot.entity.ClaimDocument;

import java.time.Instant;

public record DocumentDto(
        String id,
        String claimId,
        String name,
        String category,
        String fileType,
        long sizeBytes,
        Instant uploadedAt,
        String uploadedBy,
        String status,
        int pageCount,
        String downloadUrl,
        String description
) {
    public static DocumentDto from(ClaimDocument document) {
        String fileType = switch (document.getContentType()) {
            case "application/pdf" -> "PDF";
            case "image/png" -> "PNG";
            case "image/jpeg" -> "JPG";
            case "image/tiff" -> "TIFF";
            default -> "FILE";
        };
        return new DocumentDto(
                document.getId(),
                document.getClaim().getClaimNumber(),
                document.getOriginalName(),
                document.getCategory(),
                fileType,
                document.getSizeBytes(),
                document.getUploadedAt(),
                document.getUploadedBy().getName(),
                document.getStatus().name(),
                document.getPageCount(),
                "/api/documents/" + document.getId() + "/content",
                document.getDescription()
        );
    }
}
