'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchBuyerOrders } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400',
  PAID: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400',
  SHIPPING: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:text-purple-400',
  DELIVERED: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400',
  DONE: 'text-slate-600 bg-slate-50 dark:bg-slate-800 dark:text-slate-400',
}

export default function BuyerAccountPage() {
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
      
      const list = await fetchBuyerOrders(params)
      setOrders(list)
    } finally { setLoading(false) }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.account.myOrders')}</h1>

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
      {orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-slate-400 dark:bg-slate-900 dark:border-slate-800">
          {t('orderService.account.noOrders')} <Link href="/" className="text-indigo-600 hover:underline">{t('nav.shop')}</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Link key={o.id} href={`/account/orders/${o.id}`}
              className="flex items-center justify-between rounded-xl border bg-white p-4 transition-shadow hover:shadow-sm dark:bg-slate-900 dark:border-slate-800">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">{t('orderService.account.orderId')} #{o.id}</div>
                <div className="text-sm text-slate-500">{o.paymentMethod} &middot; ¥{o.totalAmount}</div>
                <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleDateString()}</div>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[o.status] || 'text-slate-600'}`}>
                {t('orderService.account.status.' + o.status.toLowerCase())}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}