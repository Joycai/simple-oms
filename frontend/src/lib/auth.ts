const TOKEN_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
const USER_KEY = 'current_user'
const API_BASE = '/api/v1'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_KEY)
}

export function getUser(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(USER_KEY)
}

export function setAuth(accessToken: string, refreshToken: string, username: string) {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  localStorage.setItem(USER_KEY, username)
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export function getRoles(): string[] {
  const token = getToken()
  if (!token) return []
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.roles || []
  } catch { return [] }
}

export function hasRole(role: string): boolean {
  return getRoles().includes(role)
}

export function getDefaultRedirect(): string {
  const roles = getRoles()
  if (roles.includes('admin')) return '/admin'
  if (roles.includes('seller')) return '/seller'
  return '/'
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setAuth(data.accessToken, data.refreshToken, data.username)
    return true
  } catch {
    return false
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`    
  }
  
  const url = `${API_BASE}${path}`
  console.log(`[apiFetch] Calling: ${url}`)
  
  let res = await fetch(url, { ...options, headers })
  // On 401/403, try refresh once
  if (res.status === 401 || res.status === 403) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      const newToken = getToken()
      if (newToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
      }
      res = await fetch(url, { ...options, headers })
    } else {
      // Token expired, redirect to login
      clearAuth()
      window.dispatchEvent(new Event('auth-expired'))
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        sessionStorage.setItem('login_message', '登录已过期，请重新登录')       
        sessionStorage.setItem('login_redirect', window.location.pathname)      
        window.location.href = '/login'
      }
    }
  }
  return res
}

export async function logout() {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })
    } catch { /* ignore */ }
  }
  clearAuth()
}
