package com.claimpilot.service;

import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class DocumentMimeSanitizer {

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/tiff"
    );

    public boolean isAllowed(String contentType) {
        if (contentType == null || contentType.isBlank()) return false;
        return ALLOWED_MIME_TYPES.contains(contentType.toLowerCase().trim());
    }

    public String sanitizeFilename(String filename) {
        if (filename == null) return "document";
        String clean = filename.replace("..", "").replace("/", "").replace("\\", "");
        return clean.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
