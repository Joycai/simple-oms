'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchOrder, confirmDelivered } from '@/lib/order-api'

export default function BuyerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<any>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchOrder(Number(id)).then(setOrder).catch(() => {})
  }, [id])

  async function handleConfirm() {
    try {
      await confirmDelivered(Number(id))
      setMsg('Order confirmed as delivered!')
      fetchOrder(Number(id)).then(setOrder)
    } catch (e: any) { setMsg('Failed: ' + e.message) }
  }

  if (!order) return <div className="py-20 text-center text-slate-400">Loading...</div>

  return (
    <div>
      <a href="/account" className="mb-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to Orders</a>
      <div className="rounded-xl border bg-white p-6 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-xl font-bold text-slate-900 dark:text-slate-50">Order #{order.id}</h1>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            {order.status}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-500">
          <div>Payment: {order.paymentMethod} ({order.paymentStatus})</div>
          <div>Total: ¥{order.totalAmount}</div>
          <div>Seller: {order.sellerId}</div>
          <div>Created: {new Date(order.createdAt).toLocaleDateString()}</div>
        </div>

        <h2 className="mt-6 text-sm font-medium text-slate-700 dark:text-slate-300">Items</h2>
        <div className="mt-2 space-y-2">
          {(order.items || []).map((oi: any, i: number) => (
            <div key={i} className="flex justify-between rounded border px-3 py-2 text-sm dark:border-slate-700">
              <span>{oi.name}</span>
              <span className="text-slate-500">x{oi.quantity} @ ¥{oi.unitPrice}</span>
            </div>
          ))}
        </div>

        {order.shipments?.length > 0 && (
          <>
            <h2 className="mt-6 text-sm font-medium text-slate-700 dark:text-slate-300">Shipments</h2>
            {order.shipments.map((s: any) => (
              <div key={s.id} className="mt-2 rounded border px-3 py-2 text-sm dark:border-slate-700">
                <span className={`font-medium ${s.status === 'DELIVERED' ? 'text-emerald-600' : 'text-purple-600'}`}>
                  {s.status}
                </span>
                {s.trackingNumber && <span className="ml-2 text-slate-500">Tracking: {s.trackingNumber}</span>}
                {s.shippedAt && <span className="ml-2 text-slate-400">Shipped: {new Date(s.shippedAt).toLocaleDateString()}</span>}
              </div>
            ))}
          </>
        )}

        {order.status === 'SHIPPING' && (
          <button onClick={handleConfirm}
            className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            Confirm Delivery
          </button>
        )}
        {msg && <div className="mt-3 text-sm text-emerald-600">{msg}</div>}
      </div>
    </div>
  )
}
