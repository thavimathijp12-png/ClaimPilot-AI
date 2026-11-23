package com.claimpilot.security;

import com.claimpilot.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtTokenService {

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtTokenService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String issueToken(UserPrincipal principal) {
        Instant issuedAt = Instant.now();
        return Jwts.builder()
                .subject(principal.username())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(issuedAt.plusMillis(properties.getExpirationMs())))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        Jws<Claims> signedClaims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token);
        return signedClaims.getPayload();
    }

    public boolean isValidFor(String token, UserPrincipal principal) {
        Claims claims = parseClaims(token);
        return claims.getSubject().equalsIgnoreCase(principal.username())
                && claims.getExpiration().after(new Date());
    }

    public long getExpirationMs() {
        return properties.getExpirationMs();
    }
}
