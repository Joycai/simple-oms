# User Security: Password & 2FA (OTP) — UI/UX Design Spec (v1.2)

## 1. Security Settings Page (Dashboard)
**Path**: `/dashboard/security`

### Section D: Passkeys (WebAuthn) - NEW
**Concept**: Modern, passwordless device-bound security.

#### Device Management List
- **Table/List Columns**:
  - **Device**: Icon (Phone/Laptop) + User-defined name.
  - **Status**: "Ready" Badge.
  - **Last Used**: Relative time (e.g., "Used 2 hours ago").
  - **Actions**: "Remove Device" (Trash icon).
- **Empty State**: Illustration or text saying "No passkeys registered. Speed up your next login with biometrics."

#### Registration Flow
- **Action**: "Add Passkey" button.
- **Workflow**:
  1. Trigger OS/Browser native biometric prompt.
  2. Success → Popup to "Name your device" (e.g., "Work Windows Hello").
  3. Finalize → Item added to the list.

---

## 2. Login Page Enhancements (WebAuthn)
**Path**: `/login`

### Passkey Login Entry
- **Primary Method**: Add a prominent "Sign in with a Passkey" button.
- **Style**: Outlined button with `Fingerprint` icon, positioned below the main "Sign In" button or as a distinct "More options" section.
- **Detection**: Use `@simplewebauthn/browser`'s helper to check if the browser supports WebAuthn. If not supported, hide this option.
- **Flow**: Clicking triggers the native biometric popup immediately.

---

## 3. Revised 2FA Logic
**Priority Order**:
1. **Passkey Login**: If a user has a registered passkey, they can bypass both Password AND OTP (biometrics serve as the second factor automatically).
2. **Password Login**:
   - If 2FA (OTP) is enabled → Show `/login/verify` (TOTP/Recovery Code).
   - If 2FA (OTP) is disabled → Direct login to Dashboard.

## UI Tokens (Updated)
- **Fingerprint Icon**: `indigo-900`.
- **Passkey Badge**: `bg-sky-100 text-sky-800` "Secure Device".
