package com.claimpilot.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing Configuration for entity created/updated timestamps.
 * Separated from main application class so MVC slice tests (@WebMvcTest)
 * do not attempt to initialize JPA metamodels in web-only contexts.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}

