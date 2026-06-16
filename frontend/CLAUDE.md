# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simple OMS is a full-stack order management system. The frontend is a Next.js 16 application with React 19 and TypeScript, providing user-facing interfaces for customers, sellers, and administrators to manage orders and inventory.

Frontend runs on **port 3060** and communicates with backend services (IAM on 8080, Order on 8081) via REST and Apollo GraphQL.

## Technology Stack

- **Framework**: Next.js 16.2.6 (App Router with route groups)
- **Runtime**: React 19.2.4 with TypeScript 5
- **Styling**: Tailwind CSS 4 with PostCSS
- **State Management**: Zustand 5
- **Forms**: React Hook Form 7 with Zod validation
- **Data Fetching**: Apollo Client 3 (GraphQL) and React Query 5 (REST)
- **UI Components**: Base UI + shadcn/ui + custom components
- **Internationalization**: next-intl 4
- **Authentication**: WebAuthn via @simplewebauthn/browser
- **Build Tool**: Gradle with pnpm 11.5.2 as package manager
- **Testing**: Playwright (e2e tests in `/tests`)
- **Linting**: ESLint 9 with next config

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (seller)/          # Route group for seller features
│   ├── (buyer)/           # Route group for buyer features
│   ├── (storefront)/      # Route group for public storefront
│   ├── admin/             # Admin panel routes
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   └── ui/               # Base UI components
├── lib/                   # Utilities and helpers
│   ├── api.ts            # API client configuration
│   ├── hooks.ts          # Custom React hooks
│   └── utils.ts          # Utility functions
└── messages/             # next-intl translation files

public/                    # Static assets (images, fonts, etc.)
test-results/              # Test output artifacts
```

## Development Workflow

### Prerequisites

- Node.js 20+ (for TypeScript and Next.js 16)
- pnpm 11.5.2 (workspace-aware package manager)

### Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Run development server**:
   ```bash
   pnpm dev
   ```
   Opens http://localhost:3060 with hot module reloading (HMR).

3. **Build for production**:
   ```bash
   pnpm build
   pnpm start
   ```

### Common Commands

- `pnpm dev` — Start dev server with HMR
- `pnpm build` — Build production bundle (outputs to `.next/`)
- `pnpm start` — Start production server
- `pnpm lint` — Run ESLint (configured in `eslint.config.mjs`)
- `pnpm test` — Run Playwright e2e tests (from root `/tests`)

## Architecture & Patterns

### App Router with Route Groups

Next.js 16 uses the App Router. Routes are organized by feature using [route groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups) (parentheses in folder names):

- `(seller)` — Seller portal for managing orders/inventory
- `(buyer)` — Buyer dashboard for purchases
- `(storefront)` — Public product listing and shopping
- `admin` — Admin management panel (not grouped)

Each group can have its own layout. Layouts wrap child routes and persist during navigation.

### Data Fetching

**Apollo Client (GraphQL)**:
- Configured in `lib/api.ts`
- Used for real-time order and inventory queries
- Cache management for optimistic updates

**React Query (REST)**:
- For traditional REST endpoints
- Used alongside Apollo for mixed data sources
- Automatic request deduplication and caching

**Next.js Server Components**:
- App Router uses React Server Components by default
- Fetch data directly in async components (no client-side waterfall)
- `'use client'` directive marks interactive components

### State Management

**Zustand stores** in `lib/`:
- Global application state (auth, user, cart, filters)
- Lightweight alternative to Redux
- Auto-persist to localStorage for cart/preferences

**React Hook Form**:
- Form state and validation in components
- Zod for schema validation
- Minimal re-renders

### Styling

**Tailwind CSS 4**:
- Utility-first CSS framework
- PostCSS pipeline configured in `postcss.config.mjs`
- Design tokens in `tailwind.config.[js|ts]`

**Components**:
- shadcn/ui for pre-built accessible components
- Customize via `components.json` (defines component install paths)
- Custom components in `src/components/`

### Authentication

**WebAuthn (Passwordless)**:
- FIDO2 implementation via `@simplewebauthn/browser`
- Communicates with iam-service (port 8080)
- Session tokens stored in Zustand + localStorage

**JWT Tokens**:
- Access token in Authorization header
- Refresh token for extending sessions
- Automatic token refresh on 401 responses

## Key Files & Patterns

### Configuration Files

- `next.config.js` — Next.js config (server/client runtime settings)
- `tsconfig.json` — TypeScript strict mode enabled
- `tailwind.config.js` — Tailwind CSS customization
- `postcss.config.mjs` — CSS processing (Tailwind)
- `components.json` — shadcn/ui component install config
- `package.json` — pnpm workspace and dependencies

### Environment Variables

Prefix with `NEXT_PUBLIC_` to expose to browser; others are server-only.

**Common variables** (create `.env.local` or pass via CI):
- `NEXT_PUBLIC_API_URL` — Backend base URL (default: http://localhost:8081)
- `NEXT_PUBLIC_IAM_URL` — IAM service URL (default: http://localhost:8080)

### API Integration Layer

**lib/api.ts** exports:
- Apollo client instance (configured with auth headers, error handling)
- GraphQL document definitions
- REST fetch wrapper with token injection

Always use these exports instead of direct `fetch()` calls to ensure consistent auth headers and error handling.

## Component Development Guidelines

### Server vs. Client Components

- **Server Components** (default): No `'use client'`. For data fetching, layout, and static content.
- **Client Components**: Add `'use client'` at top of file. For interactivity, forms, hooks.

### Hook Usage

- Server Components cannot use hooks; use Client Components for `useState`, `useEffect`, etc.
- Custom hooks (e.g., `useAuth`) must be in Client Components
- Define hooks in `lib/hooks.ts` and re-export as needed

### Form Patterns

Use React Hook Form + Zod:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({ /* shape */ });
export default function Form() {
  const form = useForm({ resolver: zodResolver(schema) });
  // ...
}
```

## Internationalization (i18n)

**next-intl** provides multi-language support:
- Translation files in `messages/` (one JSON per locale)
- Automatic locale routing (e.g., `/en/...`, `/zh/...`)
- Use `useTranslations()` hook in Client Components

## Testing

**Playwright e2e tests** in `/tests`:
- `pnpm test` runs tests from root directory
- Tests run against live frontend (http://localhost:3060) and backend services
- Common test file: `login.spec.ts` (authentication flow)

Add tests when:
- Fixing bugs (test should catch regression)
- Adding user-facing features (golden path + edge cases)

## Performance & Best Practices

1. **Next.js Image Optimization**: Use `<Image>` from `next/image` for responsive images.
2. **Code Splitting**: App Router automatically splits by route; avoid large imports in global layouts.
3. **Data Fetching**: Fetch in Server Components when possible; minimize client-side fetching.
4. **Memoization**: Use `React.memo()` sparingly; Zustand already prevents unnecessary re-renders.
5. **TypeScript**: Strict mode enabled; use `as const` for literal types.

## Common Workflows

### Adding a New Feature Page

1. Create folder in `src/app/(group)/feature/`
2. Add `page.tsx` as the route component
3. Create component file `src/components/FeaturePage.tsx`
4. Fetch data in Server Component; pass props to Client Component
5. Add links in layout or navigation

### Adding a New API Call

1. Define GraphQL query/mutation in `lib/api.ts` (Apollo) or add REST endpoint wrapper
2. Create custom hook in `lib/hooks.ts` using Apollo's `useQuery`/`useMutation` or React Query
3. Use hook in Client Component

### Styling a Component

1. Use Tailwind utilities first (`className="flex gap-4 bg-slate-100"`)
2. Extract to `@apply` in CSS module if reused across many files
3. Use shadcn/ui components for complex UI (modals, dropdowns, tables)

## Debugging

- **Network**: DevTools Network tab to inspect API calls; check Authorization headers
- **State**: Zustand store devtools in browser if configured (check `lib/` for store definitions)
- **React DevTools**: Inspect component tree, hooks, and props
- **Next.js DevTools**: Open http://localhost:3060 and check for build errors
- **Console**: Check for 401 (auth failed) or CORS errors

## AGENTS.md Note

See `AGENTS.md` for agent-specific rules about Next.js 16 differences from your training data. This version includes breaking changes in APIs and conventions.
