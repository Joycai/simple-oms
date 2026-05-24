'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchOrder, markPaid, shipOrder } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

export default function SellerOrderDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder(Number(id)).then(setOrder).finally(() => setLoading(false))
  }, [id])

  async function handleMarkPaid() {
    await markPaid(order.id)
    fetchOrder(order.id).then(setOrder)
  }

  async function handleShip() {
    const tracking = prompt(t('orderService.seller.trackingPlaceholder'))
    if (tracking) {
      await shipOrder(order.id, tracking)
      fetchOrder(order.id).then(setOrder)
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>
  if (!order || !order.id) return <div className="py-20 text-center text-slate-400">{t('orderService.storefront.noItems')}</div>

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.account.details')}</h1>
        <div className="text-sm font-bold text-indigo-600">#{order.id}</div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{t('login.management')}</h3>
            <div className="divide-y">
              {(order.items || []).map((item: any) => (
                <div key={item.itemId || item.id} className="py-3 flex justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="text-xs text-slate-500">¥{item.unitPrice} x {item.quantity}</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">¥{(item.unitPrice * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-3 flex justify-between font-bold">
              <div className="text-slate-900 dark:text-slate-100">{t('orderService.account.total')}</div>
              <div className="text-indigo-600 text-lg">¥{order.totalAmount}</div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">{t('orderService.account.shippingInfo')}</h3>
            {order.shipments?.length > 0 ? (
              <div className="space-y-4">
                {order.shipments.map((s: any) => (
                  <div key={s.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t('orderService.account.trackingNo')}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{s.trackingNumber}</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-slate-500">{t('orderService.account.shippedAt')}</span>
                      <span>{new Date(s.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500">{t('orderService.account.noShipmentYet')}</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{t('orderService.seller.status')}</label>
              <div className="text-sm font-bold text-indigo-700">{t('orderService.account.status.' + order.status.toLowerCase())}</div>
            </div>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase">{t('orderService.account.date')}</label>
              <div className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="pt-4 border-t space-y-2">
              {order.paymentStatus === 'PENDING' && (
                <button onClick={handleMarkPaid} className="w-full rounded bg-emerald-600 py-2 text-xs font-medium text-white hover:bg-emerald-700">{t('orderService.seller.confirmPayment')}</button>
              )}
              {order.status === 'PAID' && (
                <button onClick={handleShip} className="w-full rounded bg-indigo-600 py-2 text-xs font-medium text-white hover:bg-indigo-700">{t('orderService.seller.ship')}</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}