# WebAuthn / Passkey Integration — Tech Spec

## Overview
Integrate FIDO2/WebAuthn passkeys as a passwordless login method. Users can register device-bound credentials (fingerprint, face, PIN) and use them to authenticate with the simple-oms backend.

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────┐
│  Browser     │ ←→  │  Next.js (3200) │ ←→  │  Spring Boot │
│  WebAuthn API│     │  Proxy /api/*   │     │  (8080)      │
└──────────────┘     └─────────────────┘     └──────┬───────┘
                                                    │
                                         ┌──────────┴──────────┐
                                         │  PostgreSQL          │
                                         │  webauthn_credent... │
                                         └─────────────────────┘
```

## Data Model

```sql
CREATE TABLE webauthn_credentials (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    credential_id TEXT NOT NULL UNIQUE,
    public_key_cose BYTEA NOT NULL,
    signature_count BIGINT DEFAULT 0,
    device_name VARCHAR(100),
    last_used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## API Endpoints

### Registration (bind device)

**Step 1: Generate challenge**
```
POST /api/v1/auth/webauthn/register/start
Authorization: Bearer <access_token>
Response: {
  "challenge": "...",
  "rp": { "name": "simple-oms", "id": "localhost" },
  "user": { "id": "...", "name": "admin", "displayName": "admin" },
  "pubKeyCredParams": [...],
  "excludeCredentials": [...],
  "authenticatorSelection": { "userVerification": "required" }
}
```

**Step 2: Verify and store**
```
POST /api/v1/auth/webauthn/register/finish
Body: { "deviceName": "My MacBook", "response": {...} }  (PublicKeyCredential JSON)
Response: { "message": "Passkey registered" }
```

### Authentication (login)

**Step 1: Generate challenge**
```
POST /api/v1/auth/webauthn/login/start
Body: { "username": "admin" } (optional — null for discoverable)
Response: {
  "challenge": "...",
  "allowCredentials": [{ "id": "...", "type": "public-key" }] (empty for discoverable)
}
```

**Step 2: Verify and issue JWT**
```
POST /api/v1/auth/webauthn/login/finish
Body: { "response": {...} }
Response: { "accessToken": "...", "refreshToken": "...", "username": "..." }
```

### Management
```
GET   /api/v1/auth/webauthn/credentials — list user's credentials
DELETE /api/v1/auth/webauthn/credentials/{id} — remove a credential
```

## Login Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Browser │    │  Next.js │    │  Backend │
└────┬─────┘    └────┬─────┘    └────┬─────┘
     │  Click "Passkey"  │            │
     │──────────────────→│            │
     │                   │ POST /login/start
     │                   │───────────→│
     │                   │ challenge  │
     │                   │←───────────│
     │ navigator.        │            │
     │ credentials.get() │            │
     │← fingerprint scan │            │
     │ signed assertion  │            │
     │──────────────────→│            │
     │                   │ POST /login/finish
     │                   │───────────→│
     │                   │   JWT      │
     │                   │←───────────│
     │  → /dashboard     │            │
```

## Security

| Concern | Solution |
|---------|----------|
| Challenge replay | Redis store, 5min TTL |
| RP ID | Configurable (localhost → production) |
| User verification | `required` — must use biometric/PIN |
| Credential theft | Private key never leaves device |
| Multiple devices | User can register multiple credentials |

## Library Choice

**Backend**: `com.yubico:webauthn-server-core:2.5.2`
- Official Yubico library, well-maintained, FIDO2 compliant
- Compatible with Spring Boot 4.x (no tight Spring coupling)

**Frontend**: `@simplewebauthn/browser`
- Simple wrapper around `navigator.credentials` API
- Handles base64url encoding/decoding

## Implementation Plan

1. Add `yubico:webauthn-server-core` dependency
2. Create `WebAuthnCredential` entity + repository
3. Implement `WebAuthnService` (registration + authentication)
4. Create REST endpoints in `AuthController`
5. Frontend: `@simplewebauthn/browser` + registration UI
6. Frontend: login flow with passkey button
7. Integration test with real device
