'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { fetchCategories, fetchCart } from '@/lib/order-api'
import { getToken, getRoles, clearAuth } from '@/lib/auth'
import { useI18n } from '@/lib/i18n'

export function UnifiedNav() {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const [categories, setCategories] = useState<any[]>([])
  const [cartCount, setCartCount] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [roles, setRoles] = useState<string[]>([])

  const syncCart = useCallback(async () => {
    const token = getToken()
    if (token) {
      try {
        const cart = await fetchCart()
        setCartCount(cart?.length || 0)
      } catch {
        setCartCount(0)
      }
    } else {
      const stored = sessionStorage.getItem('cart_count')
      setCartCount(stored ? Number(stored) : 0)
    }
  }, [])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
    syncCart()

    const token = getToken()
    if (token) {
      setAuthed(true)
      setRoles(getRoles())
    }

    // Listen for custom cart updates
    window.addEventListener('cart-updated', syncCart)
    return () => window.removeEventListener('cart-updated', syncCart)
  }, [syncCart])

  function search(e: React.FormEvent) {
    e.preventDefault()
    router.push(keyword ? `/?keyword=${encodeURIComponent(keyword)}` : '/')
  }

  function handleLogout() {
    clearAuth()
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cart_count')
    }
    setCartCount(0)
    setAuthed(false)
    router.push('/')
    router.refresh()
  }

  const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur dark:bg-slate-900/95 dark:border-slate-800">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="font-serif text-lg font-bold text-indigo-950 dark:text-indigo-100">
          simple-oms
        </Link>

        {/* Categories (only on storefront) */}
        {pathname === '/' && categories.map((l1: any) => (
          <div key={l1.id} className="group relative hidden md:block">
            <button className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
              {l1.name}
            </button>
            {l1.children?.length > 0 && (
              <div className="absolute left-0 top-full hidden rounded-lg border bg-white p-2 shadow-lg group-hover:block dark:bg-slate-800 dark:border-slate-700">
                {l1.children.map((l2: any) => (
                  <Link key={l2.id} href={`/?categoryId=${l2.id}`}
                    className="block rounded px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                    {l2.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex-1" />

        {/* Search */}
        <form onSubmit={search} className="hidden sm:block">
          <input value={keyword} onChange={e => setKeyword(e.target.value)}
            placeholder={t('nav.search')}
            className="w-40 rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </form>

        <Link href="/cart" className="relative text-slate-600 hover:text-slate-900 dark:text-slate-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {cartCount}
            </span>
          )}
        </Link>

        {authed ? (
          <>
            {(roles.includes('buyer') || roles.includes('admin')) && (
              <Link href="/account" className={`text-sm ${pathname.startsWith('/account') ? 'font-bold text-indigo-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}>
                {t('nav.myOrders')}
              </Link>
            )}
            {roles.includes('seller') && (
              <Link href="/seller" className={`text-sm ${pathname.startsWith('/seller') ? 'font-bold text-indigo-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}>
                {t('nav.sellerCenter')}
              </Link>
            )}
            {roles.includes('admin') && (
              <Link href="/admin" className={`text-sm ${pathname.startsWith('/admin') ? 'font-bold text-indigo-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}>
                {t('nav.adminCenter')}
              </Link>
            )}
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400">
              {t('nav.signOut')}
            </button>
          </>
        ) : (
          <Link href={loginUrl} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            {t('nav.signIn')}
          </Link>
        )}
      </div>
    </nav>
  )
}