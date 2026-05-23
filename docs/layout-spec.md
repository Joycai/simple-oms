# Design Spec: Login Page (Multi-Step Split Layout) — v1.3

## 1. Aesthetic Concept
Evolving the **Split-Screen Layout** into a dynamic, two-step interactive journey. We aim for a sense of "Recognition" followed by "Authentication".

## 2. Interaction Flow

### Step 1: Identification (Who are you?)
- **UI State**: Only the Username field is visible.
- **Header**: "Sign in to Joycai OMS" (Standard `font-serif` title).
- **Primary Action**: "Next" button (`bg-indigo-900`).
- **Secondary Action**: "Register for a library card" (Link to `/register`).
- **Vibe**: Clean and focused.

### Step 2: Authentication (Prove it's you)
- **UI State**: Transition animation (Slide-left or Fade) to the password/passkey view.
- **User Identity Display**: 
  - Show the entered username at the top with a subtle avatar placeholder.
  - Action: "Not you? [Change account]" small link.
- **Dynamic Choice**:
  - **Scenario A: Passkey User**
    - Show: "Sign in with your biometric key..." status.
    - Automatic: Trigger WebAuthn popup on mount.
    - Fallback: "Use my password instead" button.
  - **Scenario B: Password + OTP User**
    - Show: Password input field.
    - Action: "Sign In" button -> Leads to 2FA page.
  - **Scenario C: Password Only**
    - Show: Password input field + "Sign In" button.

## 3. Visual Standard (Additions)
- **Transition Animation**: Use `framer-motion` or CSS transitions for a smooth horizontal shift between steps.
- **The "Library Seal"**: When identifying, show a shimmering loading state (skeleton) while checking the backend.

---

## UI Tokens
- **Step Indicator**: Small dots at the bottom if needed, though a simple "Back" arrow is cleaner.
- **Indigo-900**: Retained for all primary pathing.
