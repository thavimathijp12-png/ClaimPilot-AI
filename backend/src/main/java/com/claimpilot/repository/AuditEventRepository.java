package com.claimpilot.repository;

import com.claimpilot.entity.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AuditEventRepository extends JpaRepository<AuditEvent, String>,
        JpaSpecificationExecutor<AuditEvent> {
}
