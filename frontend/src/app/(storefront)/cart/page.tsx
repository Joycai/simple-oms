'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchCart, updateCartItem, removeCartItem, checkout } from '@/lib/order-api'

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try { setItems(await fetchCart()) } catch { setError('Failed to load cart') }
    finally { setLoading(false) }
  }

  async function handleCheckout() {
    setLoading(true); setError('')
    try {
      const result = await checkout()
      if (result.message) { setError(result.message); return }
      sessionStorage.setItem('cart_count', '0')
      router.push('/account')
    } catch (e: any) { setError(e.message || 'Checkout failed') }
    finally { setLoading(false) }
  }

  const total = items.reduce((sum: number, i: any) => sum + Number(i.price || 0) * i.quantity, 0)

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">Shopping Cart</h1>
      {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</div>}
      {items.length === 0 ? (
        <div className="py-20 text-center text-slate-400">Your cart is empty</div>
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
                <button onClick={async () => { await removeCartItem(ci.id); load() }}
                  className="text-xs text-red-500 hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total: ¥{total.toFixed(2)}</span>
            <button onClick={handleCheckout} disabled={loading}
              className="rounded-lg bg-indigo-950 px-8 py-2.5 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-50">
              {loading ? 'Processing...' : 'Checkout (Offline Pay)'}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-400">Payment is offline — contact the seller after placing your order.</p>
        </>
      )}
    </div>
  )
}
