# Code Conventions

## 1. API Calls

**Only use `apiFetch` (IAM) or `orderFetch` (Order Service). Never use raw `fetch`.**

```ts
// ✅ Correct
import { apiFetch } from '@/lib/auth'
const res = await apiFetch('/roles', { method: 'POST', body: JSON.stringify(data) })

// ✅ Correct
import { orderFetch } from '@/lib/order-api'
const res = await orderFetch('/seller/items')

// ❌ Wrong — missing /api/v1 prefix, no token, no refresh
const res = await fetch('/roles', { ... })
```

Both `apiFetch` and `orderFetch` include:
- Auto `Authorization: Bearer <token>` header
- Token refresh on 401/403
- Login redirect when refresh fails

## 2. Token Refresh

All API clients follow the same pattern:

```
401/403 → try POST /api/v1/auth/refresh → retry request with new token
                                        → fail → clear auth → redirect /login
```

When adding a new API client, copy this pattern from `order-api.ts:6-19`.

## 3. SSR Safety

**Any value from `localStorage` or `sessionStorage` MUST use `useState + useEffect`.**

```tsx
// ✅ Correct — no hydration mismatch
const [username, setUsername] = useState('')
const [mounted, setMounted] = useState(false)
useEffect(() => { setUsername(getUser() || ''); setMounted(true) }, [])
return <span>{mounted ? username : null}</span>

// ❌ Wrong — SSR renders empty, client renders value → mismatch
const username = typeof window !== 'undefined' ? getUser() : ''
return <span>{username}</span>
```

## 4. i18n

**All user-facing text must use `t()`. No hardcoded strings.**

```tsx
// ✅ Correct
<span>{t('orderService.cart.title')}</span>

// ❌ Wrong
<span>购物车</span>
<span>{'Shopping Cart'}</span>
<span>{locale === 'zh-CN' ? '编辑' : 'Edit'}</span>
```

Add keys to both `zh-CN.json` and `en-US.json` under the appropriate namespace.

## 5. Imports

**Turbopack statically analyzes all imports. Verify the export exists before importing.**

```tsx
// ✅ Correct — check the target file has `export function fetchXxx`
import { fetchItemImages } from '@/lib/order-api'

// ❌ Wrong — Turbopack build fails if export doesn't exist
import { getDefaultRedirect } from '@/lib/auth'  // might not exist
```

## 6. Backend-Frontend Field Alignment

**Backend response fields must match frontend property names exactly.**

```kotlin
// Backend (Kotlin)
fun toMap() = mapOf("thumbnail" to imageData, "categoryName" to cat.name)
```

```tsx
// Frontend (TypeScript) — must match field names
interface ItemCardProps {
  item: { thumbnail?: string; categoryName?: string }
}
```

If you change a field name in the backend, search the frontend codebase for old references.

## 7. Encoding & File Types

- **All files: UTF-8 without BOM**
- **Use `.ts` / `.tsx` only. Never mix `.mjs` with TypeScript.**
- Backend: `.kt` (Kotlin), UTF-8
- Config: `.yml`, `.json`, `.ts` — not `.mjs`

## 8. Before Committing

```bash
cd frontend && npm run build    # Must pass
cd backend && ./gradlew build   # Must pass
```

Fix all TypeScript/Kotlin errors before pushing. A broken build blocks everyone.

## 9. Git Workflow

- `feature/<story-name>` branch → PR → review → merge to `main`
- Do NOT push directly to `main` during normal development
- Hotfixes during acceptance testing: coordinate in thread first

## 10. Task Ownership

- Only modify files assigned to your task
- If you need to touch someone else's file, coordinate in the task thread first
- Report completion in the task thread, not just the main channel
