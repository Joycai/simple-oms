# RBAC Management UI: Design Specifications

## Overall Strategy: "The Catalog of Authority"
We will extend the "Modern Library" aesthetic to these administrative pages. The focus is on **Order, Clarity, and Precision**.

### Layout: Standard Admin Layout
- **Sidebar**: Already defined (v1.1).
- **Header**: Breadcrumbs showing "Administration > [Page Name]".
- **Content**: Card-based containment for tables and forms.

---

## 1. User Management (#19)
**Vibe**: The Member Directory.

- **Primary Component**: A sophisticated Data Table (shadcn/ui `DataTable`).
- **Columns**: 
  - Avatar + Name/Username (Bold)
  - Email
  - Status (Badge: `emerald-600` for Active, `slate-400` for Inactive)
  - Roles (Badges: `indigo-100 text-indigo-900`)
  - Join Date
  - Actions (Three dots dropdown: Edit, Reset Password, Disable, Delete)
- **Reset Password Workflow**:
  - Modal with "New Password" and "Confirm New Password" fields.
  - Success Toast notification.
  - Backend must invalidate existing user sessions.
- **Features**:
  - Global Search bar at the top-left.
  - "Add New Member" button at the top-right (`bg-indigo-900`).
- **Dialogs**: A slide-over or modal for adding/editing users with clear `Zod` validation feedback.

---

## 2. Role Management (#20)
**Vibe**: The Hierarchy of Tiers.

- **Layout**: A simpler Data Table or a Grid of Cards.
- **Columns/Cards**:
  - Role Name (e.g., "Administrator", "Librarian", "Reader")
  - Description
  - Member Count (Clickable to view users in this role)
  - Actions (Edit Name/Desc, Delete)
- **Visuals**: Use icons to distinguish role levels.

---

## 3. Permission Mapping (#21)
**Vibe**: The Granting of Access Keys.

- **Interactive Pattern**: "Select Role first, then Manage Permissions".
- **Left/Top**: Role Selector (Dropdown or Tabs).
- **Main Area**: A "Permission Tree" or "Permission Grid".
  - Groups: e.g., "User Management", "Order Operations", "Inventory Access".
  - Actions: Checkboxes for "Create", "Read", "Update", "Delete", "Export".
- **Visual Feedback**:
  - Indeterminate checkboxes for group-level selection.
  - Success toast (`emerald-600`) when permissions are updated.

## UI Tokens (Reminder)
- **Border**: `border-slate-200`.
- **Primary**: `indigo-900`.
- **Heading**: `font-serif`.
- **Data**: `font-sans`.
