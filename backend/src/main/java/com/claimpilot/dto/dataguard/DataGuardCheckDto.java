package com.claimpilot.dto.dataguard;

import com.claimpilot.entity.DataGuardCheck;

public record DataGuardCheckDto(
        String id,
        String field,
        String sourceDoc,
        String extractedValue,
        String expectedValue,
        String severity,
        String status,
        String explanation,
        String recommendation
) {
    public static DataGuardCheckDto from(DataGuardCheck check) {
        return new DataGuardCheckDto(
                check.getId(), check.getField(), check.getSourceDoc(), check.getExtractedValue(),
                check.getExpectedValue(), check.getSeverity().name().toLowerCase(java.util.Locale.ROOT),
                check.getStatus(), check.getExplanation(), check.getRecommendation()
        );
    }
}
