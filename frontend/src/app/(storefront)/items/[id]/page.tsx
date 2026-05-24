'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchItem, addToCart } from '@/lib/order-api'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchItem(Number(id)).then(setItem).catch(() => {})
  }, [id])

  async function handleAddToCart() {
    setLoading(true); setMsg('')
    try {
      await addToCart(item.id, qty)
      const stored = sessionStorage.getItem('cart_count')
      sessionStorage.setItem('cart_count', String((Number(stored) || 0) + qty))
      setMsg('Added to cart!')
      setTimeout(() => setMsg(''), 2000)
    } catch { setMsg('Failed') }
    finally { setLoading(false) }
  }

  if (!item) return <div className="py-20 text-center text-slate-400">Loading...</div>

  return (
    <div className="mx-auto max-w-2xl">
      <button onClick={() => router.back()} className="mb-4 text-sm text-indigo-600 hover:text-indigo-800">&larr; Back</button>
      <div className="rounded-xl border bg-white p-6 dark:bg-slate-900 dark:border-slate-800">
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{item.name}</h1>
        <p className="mt-2 text-sm text-slate-500">{item.description || 'No description'}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-400">Brand:</span> {item.brand || '-'}</div>
          <div><span className="text-slate-400">Location:</span> {item.location || '-'}</div>
          <div><span className="text-slate-400">Status:</span> {item.status}</div>
          <div><span className="text-slate-400">Stock:</span> {item.quantity}</div>
        </div>
        <div className="mt-6 flex items-center gap-4">
          <span className="text-3xl font-bold text-indigo-950 dark:text-indigo-300">¥{item.price}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="rounded border px-2 py-1 text-sm">-</button>
            <span className="w-8 text-center text-sm">{qty}</span>
            <button onClick={() => setQty(Math.min(item.quantity, qty + 1))} className="rounded border px-2 py-1 text-sm">+</button>
          </div>
          <button onClick={handleAddToCart} disabled={loading || item.quantity === 0}
            className="rounded-lg bg-indigo-950 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
        {msg && <div className="mt-3 text-sm text-emerald-600">{msg}</div>}
      </div>
    </div>
  )
}
