package com.claimpilot.dto.dataguard;

import com.claimpilot.entity.DataGuardRun;

import java.time.Instant;
import java.util.List;

public record DataGuardRunDto(
        String id,
        String claimId,
        String claimantName,
        int score,
        int validCount,
        int missingCount,
        int invalidCount,
        int inconsistentCount,
        int duplicateWarningsCount,
        Instant lastChecked,
        List<DataGuardCheckDto> items
) {
    public static DataGuardRunDto from(DataGuardRun run) {
        return new DataGuardRunDto(
                run.getId(),
                run.getClaim().getClaimNumber(),
                run.getClaim().getClaimantName(),
                run.getScore(),
                run.getValidCount(),
                run.getMissingCount(),
                run.getInvalidCount(),
                run.getInconsistentCount(),
                run.getDuplicateWarningsCount(),
                run.getLastChecked(),
                run.getItems().stream().map(DataGuardCheckDto::from).toList()
        );
    }
}
