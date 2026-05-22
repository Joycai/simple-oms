# User Security: Password & 2FA (OTP) — UI/UX Design Spec

## 1. Security Settings Page (Dashboard)
**Path**: `/dashboard/security`
**Vibe**: The Guardian's Vault.

### Layout
Standard Dashboard Sidebar + Main Workspace. The content is divided into logical "Lockboxes" (Cards).

### Section A: Change Password
- **Header**: `h2` "Security Credentials" (`font-serif`, `indigo-900`).
- **Fields**:
  - Current Password
  - New Password (with strength indicator hint)
  - Confirm New Password
- **Action**: "Update Password" button.
- **Logic**: On success, show a Toast and force logout/redirect to `/login`.

### Section B: Two-Factor Authentication (2FA)
- **Status Header**: Toggle switch or Badge showing current status.
- **Setup Flow (Modal/Collapsible)**:
  1. **Instruction**: "Scan this QR code with your Authenticator app (e.g., Google Authenticator)."
  2. **QR Display**: Centered QR code with the Secret Key displayed as text (for manual entry).
  3. **Verification**: 6-digit numeric input to confirm binding.
  4. **Action**: "Enable 2FA" button.
- **Placeholders**: Grayed-out sections for "Email Authentication" and "SMS Authentication" with "Coming Soon" tooltips.

### Section C: Recovery Codes
- **Requirement**: Only visible/activatable once 2FA is enabled.
- **Display**: A 2x5 grid of 10 alphanumeric codes.
- **Interaction**: "Download Codes" or "Copy to Clipboard" buttons.
- **Warning**: "Store these in a safe place. Each code can only be used once."

---

## 2. 2FA Verification Screen (Login Flow)
**Path**: `/login/verify` (intermediate step)
**Vibe**: The Librarian's Confirmation.

### Layout
Inherits **The Library Split** layout from the main login page.

- **Left Side**: Same branding.
- **Right Side**: 
  - **Title**: "Two-Step Verification".
  - **Description**: "Enter the 6-digit code from your authenticator app."
  - **Input**: A single 6-digit segmented input or standard numeric field.
  - **Fallback**: "Lost your device? Use a recovery code" link.
  - **Action**: "Verify" button (`bg-indigo-900`).

---

## UI Tokens
- **Error (Incorrect Code)**: `rose-600` text + Border.
- **Success (2FA Enabled)**: `emerald-600` Toast.
- **Indigo-900**: Primary action buttons.
