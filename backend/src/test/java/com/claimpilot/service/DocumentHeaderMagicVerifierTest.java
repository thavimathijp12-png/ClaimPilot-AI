package com.claimpilot.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DocumentHeaderMagicVerifierTest {

    private DocumentHeaderMagicVerifier verifier;

    @BeforeEach
    void setUp() {
        verifier = new DocumentHeaderMagicVerifier();
    }

    @Test
    void shouldRecognizePdfHeader() {
        byte[] pdfHeader = new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37};
        assertTrue(verifier.isPdf(pdfHeader));
        assertFalse(verifier.isPng(pdfHeader));
    }

    @Test
    void shouldRecognizePngHeader() {
        byte[] pngHeader = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        assertTrue(verifier.isPng(pngHeader));
        assertFalse(verifier.isPdf(pngHeader));
    }
}
