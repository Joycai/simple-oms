'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchCart, updateCartItem, removeCartItem, checkout } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

export default function CartPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try { setItems(await fetchCart()) } catch { setError(t('orderService.cart.failedToLoad')) }
    finally { setLoading(false) }
  }

  async function handleCheckout() {
    setLoading(true); setError('')
    try {
      const result = await checkout()
      if (result.message) { setError(result.message); return }
      window.dispatchEvent(new CustomEvent('cart-updated'))
      router.push('/account')
    } catch (e: any) { setError(e.message || t('orderService.cart.checkoutFailed')) }
    finally { setLoading(false) }
  }

  const total = items.reduce((sum: number, i: any) => sum + Number(i.price || 0) * i.quantity, 0)

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        {locale === 'zh-CN' ? '继续购物' : 'Continue Shopping'}
      </Link>
      <h1 className="mb-6 font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.cart.title')}</h1>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</div>}
      {items.length === 0 ? (
        <div className="py-20 text-center text-slate-400">{t('orderService.cart.empty')}</div>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((ci: any) => (
              <div key={ci.id} className="flex items-center gap-4 rounded-lg border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex-1">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{ci.name}</div>
                  <div className="text-sm text-slate-500">¥{ci.price} x {ci.quantity}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={async () => { await updateCartItem(ci.id, Math.max(1, ci.quantity - 1)); load() }}
                    className="rounded border px-2 py-0.5 text-sm">-</button>   
                  <span className="text-sm">{ci.quantity}</span>
                  <button onClick={async () => { await updateCartItem(ci.id, ci.quantity + 1); load() }}
                    className="rounded border px-2 py-0.5 text-sm">+</button>   
                </div>
                <button onClick={async () => { await removeCartItem(ci.id); load(); window.dispatchEvent(new CustomEvent('cart-updated')) }}
                  className="text-xs text-red-500 hover:text-red-700">{t('orderService.cart.remove')}</button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('orderService.cart.total')}: ¥{total.toFixed(2)}</span>
            <button onClick={handleCheckout} disabled={loading}
              className="rounded-lg bg-indigo-950 px-8 py-2.5 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-50">
              {loading ? t('login.loggingIn') : t('orderService.cart.checkout')}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">{t('orderService.cart.offlineNotice')}</p>
        </>
      )}
    </div>
  )
}