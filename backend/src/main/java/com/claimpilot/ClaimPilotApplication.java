package com.claimpilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.claimpilot.config.JwtProperties;

/**
 * ClaimPilot AI - Backend Application Entry Point.
 * AI-Powered Healthcare Claims Processing & Data Quality Platform.
 */
@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class ClaimPilotApplication {

    public static void main(String[] args) {
        SpringApplication.run(ClaimPilotApplication.class, args);
    }
}
