package com.claimpilot.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Validated JWT settings. Production secrets must be supplied outside source control.
 */
@Validated
@ConfigurationProperties(prefix = "claimpilot.jwt")
public class JwtProperties {

    @NotBlank
    @Size(min = 32, message = "must contain at least 32 characters")
    private String secret;

    @Min(60_000)
    @Max(86_400_000)
    private long expirationMs = 86_400_000;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }
}
