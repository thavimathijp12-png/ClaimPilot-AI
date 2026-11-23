package com.claimpilot.service;

import com.claimpilot.entity.ClaimStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ClaimLifecycleEventPublisher {

    private final List<String> eventLog = new ArrayList<>();

    public void publishStatusChangeEvent(String claimNumber, ClaimStatus oldStatus, ClaimStatus newStatus, String actorId) {
        String event = String.format("CLAIM_STATUS_CHANGED: %s transitioned from %s to %s by %s",
                claimNumber, oldStatus, newStatus, actorId);
        eventLog.add(event);
    }

    public List<String> getEventLog() {
        return List.copyOf(eventLog);
    }
}
