package com.claimpilot.dto.claim;

import com.claimpilot.entity.ClaimEvent;

import java.time.Instant;

public record ClaimEventDto(String id, Instant date, String title, String user, String description) {
    public static ClaimEventDto from(ClaimEvent event) {
        return new ClaimEventDto(event.getId(), event.getCreatedAt(), event.getTitle(),
                event.getActor().getName(), event.getDescription());
    }
}
