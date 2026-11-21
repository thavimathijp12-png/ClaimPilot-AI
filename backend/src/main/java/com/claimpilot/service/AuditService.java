package com.claimpilot.service;

import com.claimpilot.dto.audit.AuditEventDto;
import com.claimpilot.entity.AuditEvent;
import com.claimpilot.entity.UserAccount;
import com.claimpilot.exception.ApiException;
import com.claimpilot.repository.AuditEventRepository;
import com.claimpilot.repository.UserAccountRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuditService {

    private final AuditEventRepository auditRepository;
    private final UserAccountRepository userRepository;

    public AuditService(AuditEventRepository auditRepository, UserAccountRepository userRepository) {
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void record(String actorId, String action, String resourceType, String resourceId, String details) {
        UserAccount actor = userRepository.getReferenceById(actorId);
        auditRepository.save(new AuditEvent(
                actor, action, resourceType, resourceId, details == null ? "" : details
        ));
    }

    @Transactional(readOnly = true)
    public Page<AuditEventDto> search(String resourceType, String resourceId,
                                      Instant from, Instant to, int page, int size) {
        if (page < 0 || size < 1 || size > 200) {
            throw new ApiException("Page must be non-negative and size must be between 1 and 200.");
        }
        if (from != null && to != null && from.isAfter(to)) {
            throw new ApiException("The from timestamp cannot be after the to timestamp.");
        }
        Specification<AuditEvent> spec = Specification.where(null);
        if (resourceType != null && !resourceType.isBlank()) {
            String normalizedType = resourceType.trim().toUpperCase(java.util.Locale.ROOT);
            spec = spec.and((root, query, criteria) ->
                    criteria.equal(root.get("resourceType"), normalizedType));
        }
        if (resourceId != null && !resourceId.isBlank()) {
            String normalizedId = resourceId.trim();
            spec = spec.and((root, query, criteria) ->
                    criteria.equal(root.get("resourceId"), normalizedId));
        }
        if (from != null) {
            spec = spec.and((root, query, criteria) ->
                    criteria.greaterThanOrEqualTo(root.get("occurredAt"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, criteria) ->
                    criteria.lessThanOrEqualTo(root.get("occurredAt"), to));
        }
        Page<AuditEvent> events = auditRepository.findAll(spec, PageRequest.of(
                        page, size, Sort.by(Sort.Direction.DESC, "occurredAt")));
        return events.map(AuditEventDto::from);
    }
}
