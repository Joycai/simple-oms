'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchSellerOrders, markPaid, shipOrder } from '@/lib/order-api'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchSellerOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleMarkPaid(id: number) {
    try { await markPaid(id); setMsg('Marked as paid'); load() } catch { setMsg('Failed') }
  }

  async function handleShip(id: number) {
    const tracking = prompt('Tracking number:')
    if (!tracking) return
    try { await shipOrder(id, tracking); setMsg('Shipped!'); load() } catch { setMsg('Failed') }
  }

  function load() { fetchSellerOrders().then(setOrders) }

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">Seller Orders</h1>
        <Link href="/seller" className="text-sm text-indigo-600 hover:text-indigo-800">&larr; My Items</Link>
      </div>
      {msg && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">{msg}</div>}

      <div className="space-y-3">
        {orders.map((o: any) => (
          <div key={o.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Order #{o.id}</div>
                <div className="text-sm text-slate-500">Buyer: {o.buyerId} &middot; ¥{o.totalAmount}</div>
                <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                o.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-700' :
                o.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>{o.status}</span>
            </div>
            <div className="mt-3 flex gap-2">
              {o.status === 'PENDING_PAYMENT' && (
                <button onClick={() => handleMarkPaid(o.id)}
                  className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700">
                  Mark as Paid
                </button>
              )}
              {o.status === 'PAID' && (
                <button onClick={() => handleShip(o.id)}
                  className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">
                  Ship
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
