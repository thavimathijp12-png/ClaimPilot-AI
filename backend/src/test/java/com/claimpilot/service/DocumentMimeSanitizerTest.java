package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DocumentMimeSanitizerTest {

    private DocumentMimeSanitizer sanitizer;

    @BeforeEach
    void setUp() {
        sanitizer = new DocumentMimeSanitizer();
    }

    @Test
    void shouldAcceptStandardDocumentTypes() {
        assertTrue(sanitizer.isAllowed("application/pdf"));
        assertTrue(sanitizer.isAllowed("image/png"));
        assertTrue(sanitizer.isAllowed("image/jpeg"));
        assertTrue(sanitizer.isAllowed("image/tiff"));
    }

    @Test
    void shouldRejectExecutableAndScriptTypes() {
        assertFalse(sanitizer.isAllowed("application/x-sh"));
        assertFalse(sanitizer.isAllowed("application/javascript"));
        assertFalse(sanitizer.isAllowed("text/html"));
        assertFalse(sanitizer.isAllowed(null));
    }

    @Test
    void shouldSanitizeDangerousFilenames() {
        assertEquals("report.pdf", sanitizer.sanitizeFilename("../../../report.pdf"));
        assertEquals("clean_name.png", sanitizer.sanitizeFilename("clean name.png"));
    }
}
