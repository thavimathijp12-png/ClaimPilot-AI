package com.claimpilot.service;

import org.springframework.stereotype.Component;

@Component
public class DocumentUploadQuotaGuard {

    private static final int MAX_DOCUMENTS_PER_CLAIM = 10;
    private static final long MAX_CUMULATIVE_BYTES = 50L * 1024L * 1024L; // 50MB

    public boolean canUpload(int currentDocCount, long currentTotalBytes, long newFileBytes) {
        if (currentDocCount >= MAX_DOCUMENTS_PER_CLAIM) return false;
        return (currentTotalBytes + newFileBytes) <= MAX_CUMULATIVE_BYTES;
    }
}
