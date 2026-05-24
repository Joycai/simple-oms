'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchSellerOrders, markPaid, shipOrder } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

export default function SellerOrdersPage() {
  const { t } = useI18n()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => { load() }, [statusFilter, dateFrom, dateTo])

  async function load() {
    try {
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      if (dateFrom) params.dateFrom = new Date(dateFrom).toISOString()
      if (dateTo) params.dateTo = new Date(dateTo + 'T23:59:59').toISOString()
      
      const list = await fetchSellerOrders(params)
      setOrders(list)
    } finally { setLoading(false) }
  }

  async function handleMarkPaid(id: number) {
    await markPaid(id)
    await load()
  }

  async function handleShip(id: number) {
    const tracking = prompt(t('orderService.seller.trackingPlaceholder'))       
    if (tracking) {
      await shipOrder(id, tracking)
      await load()
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.seller.orders')}</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <option value="">{t('orderService.seller.filters.allStatus')}</option>
          <option value="PENDING_PAYMENT">{t('orderService.account.status.pending_payment')}</option>
          <option value="PAID">{t('orderService.account.status.paid')}</option>
          <option value="SHIPPING">{t('orderService.account.status.shipping')}</option>
          <option value="DELIVERED">{t('orderService.account.status.delivered')}</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        <span className="text-sm text-slate-500 self-center">{t('orderService.seller.filters.to')}</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
      </div>

      <div className="space-y-4">
        {orders.map((o: any) => (
          <div key={o.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t('orderService.account.orderId')}</span>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">#{o.id}</div>
              </div>
              <div className="flex gap-2">
                <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${o.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t('orderService.account.status.' + o.paymentStatus.toLowerCase())}
                </div>
                <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${o.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                   {t('orderService.account.status.' + o.status.toLowerCase())} 
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-500">{t('orderService.account.total')}: </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">¥{o.totalAmount}</span>
              </div>
              <div className="flex gap-2">
                {o.status === 'PENDING_PAYMENT' && (
                  <button onClick={() => handleMarkPaid(o.id)}
                    className="rounded bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700">{t('orderService.seller.confirmPayment')}</button>
                )}
                {o.status === 'PAID' && (
                  <button onClick={() => handleShip(o.id)}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">{t('orderService.seller.ship')}</button>     
                )}
                <Link href={`/seller/orders/${o.id}`}
                  className="rounded border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                  {t('orderService.seller.viewDetails')}
                </Link>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="py-20 text-center text-slate-400">{t('orderService.seller.noOrders')}</div>}
      </div>
    </div>
  )
}