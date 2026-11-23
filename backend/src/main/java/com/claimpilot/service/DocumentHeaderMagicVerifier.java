package com.claimpilot.service;

import org.springframework.stereotype.Component;

@Component
public class DocumentHeaderMagicVerifier {

    public boolean isPdf(byte[] data) {
        if (data == null || data.length < 4) return false;
        return data[0] == 0x25 && data[1] == 0x50 && data[2] == 0x44 && data[3] == 0x46; // %PDF
    }

    public boolean isPng(byte[] data) {
        if (data == null || data.length < 4) return false;
        return (data[0] & 0xFF) == 0x89 && data[1] == 0x50 && data[2] == 0x4E && data[3] == 0x47; // \x89PNG
    }
}
