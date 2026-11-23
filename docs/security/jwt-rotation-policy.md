# JWT Token Lifecycle & Rotation Policy

## Token Specifications
- Access Token TTL: 15 minutes
- Refresh Token TTL: 7 days with single-use rotation
- Revocation via Redis deny-list upon logout
