# User Profile: Personal Study — UI/UX Design Spec (v1.0)

## 1. Profile Editing Page (Dashboard)
**Path**: `/dashboard/profile`
**Vibe**: The Personal Study.

### Layout
Standard Dashboard Sidebar + Main Workspace. The content is organized into logical "Bookshelves" (Cards).

### Section A: Basic Identity (Card)
- **Header**: `h2` "Personal Identity" (`font-serif`, `indigo-900`).
- **Avatar Area**:
  - A circular avatar with a hover state overlay: "Change Avatar" (Disabled).
- **Username**: Read-only text with a subtle description: "Your unique identifier in the library."
- **Nickname**: Outlined Input.
- **Phone**: Outlined Input + `Badge(slate-100)` "Unverified". Tooltip: "Mobile verification coming soon."
- **Email**: Outlined Input + `Badge(slate-100)` "Unverified". Tooltip: "Email verification coming soon."
- **Action**: "Save Changes" button (`bg-indigo-900`).

### Section B: Social Bindings (Card - Placeholder)
- **Header**: `h2` "Social Connections" (`font-serif`, `indigo-900`).
- **Items**:
  - **WeChat**: Icon + "WeChat" + `Button(disabled)` "Bind Now". Tooltip: "Coming Soon".
  - **QQ**: Icon + "QQ" + `Button(disabled)` "Bind Now". Tooltip: "Coming Soon".
  - **DingTalk**: Icon + "DingTalk" + `Button(disabled)` "Bind Now". Tooltip: "Coming Soon".
- **Visuals**: Use `opacity-50` for these rows to indicate they are inactive.

### Section C: Fast Access (Links)
- A simple footer area or a separate small card with a link:
  - "Need to update your password or 2FA? Visit [Security Settings](/dashboard/settings)."

---

## 2. Navigation Update (Sidebar)
**Group**: `PERSONAL`
- **Item 1**: `UserIcon` "Personal Profile" -> `/dashboard/profile` (Active state: `bg-indigo-50 text-indigo-900`).
- **Item 2**: `LockIcon` "Security Settings" -> `/dashboard/settings`.

---

## UI Tokens
- **Disabled State**: `bg-slate-100 text-slate-400 cursor-not-allowed`.
- **Badges**: `rounded-full text-[10px] px-2 py-0.5`.
- **Spacing**: `gap-6` between cards.
