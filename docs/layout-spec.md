# Design Spec: Login Page (Split Layout)

## Aesthetic Concept
Transitioning from a centered card to a modern **Split-Screen Layout**. This creates a beautiful contrast between the "visual storytelling" on the left and the "functional interaction" on the right.

## Layout Structure (Split 1:1 or 2:3)

### 1. Left Side: "The Library Wing" (Brand/Visual Area)
- **Background**: `bg-indigo-950` or a muted, high-quality image of a bookshelf/library.
- **Content**: 
  - **Logo/Title**: Large, elegant `font-serif` text (e.g., "Joycai OMS").
  - **Tagline**: A subtle, poetic subtext about the project.
  - **Vibe**: Dark, sophisticated, and atmospheric.

### 2. Right Side: "The Study Desk" (Login Area)
- **Background**: `bg-white` or `bg-slate-50`.
- **Content**:
  - The login form remains consistent with the previous spec (outlined inputs, blue-600 buttons).
  - Since it's half-width, we can remove the outer `Card` shadow or keep it very subtle to let the form feel part of the page surface.
  - Centered vertically and horizontally within the right pane.

## Dashboard Layout: "The Open Book"

### 1. Left Sidebar: "The Catalog" (Navigation)
- **Width**: ~260px.
- **Style**: Clean, `bg-slate-50` with a subtle right border.
- **Active State**: `text-indigo-900 bg-indigo-50 font-medium`.

### 2. Sidebar Grouping (The Shelf Labels)
- **Label Style**: Small, bold, uppercase, tracked-out.
- **Tailwind Class**: `px-4 pt-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500`
- **i18n Keys**:
  - `sidebar.overview`: OVERVIEW / 概览
  - `sidebar.management`: MANAGEMENT / 管理功能
  - `sidebar.personal`: PERSONAL / 个人中心
  - `sidebar.operations`: OPERATIONS / 业务功能
- **Logical Groups**:
  - **OVERVIEW**: Home
  - **MANAGEMENT**: User Management, Role Management, Permission Management
  - **PERSONAL**: Security Settings (Password & OTP)
  - **OPERATIONS**: Orders, Inventory, Reports (Disabled)

### 3. Right Workspace: "The Narrative" (Main Content)
- **Background**: `bg-white`.
- **Readability**: Focused on data clarity and spacious margins.
