'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchBuyerOrders } from '@/lib/order-api'

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
  PAID: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
  SHIPPING: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
  DELIVERED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
  DONE: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400',
}

export default function BuyerAccountPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBuyerOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">My Orders</h1>
      {orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-slate-400 dark:bg-slate-900 dark:border-slate-800">
          No orders yet. <Link href="/" className="text-indigo-600 hover:underline">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Link key={o.id} href={`/account/orders/${o.id}`}
              className="flex items-center justify-between rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">Order #{o.id}</div>
                <div className="text-sm text-slate-500">{o.paymentMethod} &middot; ¥{o.totalAmount}</div>
                <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[o.status] || 'text-slate-600'}`}>
                {o.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
