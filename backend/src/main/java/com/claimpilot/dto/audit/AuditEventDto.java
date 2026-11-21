package com.claimpilot.dto.audit;

import com.claimpilot.entity.AuditEvent;

import java.time.Instant;

public record AuditEventDto(
        String id,
        String actorId,
        String actorName,
        String actorEmail,
        String action,
        String resourceType,
        String resourceId,
        String details,
        Instant occurredAt
) {
    public static AuditEventDto from(AuditEvent event) {
        return new AuditEventDto(
                event.getId(),
                event.getActor().getId(),
                event.getActor().getName(),
                event.getActor().getEmail(),
                event.getAction(),
                event.getResourceType(),
                event.getResourceId(),
                event.getDetails(),
                event.getOccurredAt()
        );
    }
}
