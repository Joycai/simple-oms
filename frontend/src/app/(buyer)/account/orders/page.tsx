'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchBuyerOrders, confirmDelivered } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

export default function BuyerOrdersPage() {
  const { t } = useI18n()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try { setOrders(await fetchBuyerOrders()) } catch { setError('Failed to load orders') }
    finally { setLoading(false) }
  }

  async function handleConfirm(id: number) {
    await confirmDelivered(id)
    load()
  }

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.account.myOrders')}</h1>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div className="space-y-4">
        {orders.map((o: any) => (
          <div key={o.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{t('orderService.account.orderId')}</span>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">#{o.id}</div>
              </div>
              <div className="text-right">
                <div className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${o.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {t('orderService.account.status.' + o.status.toLowerCase())}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t('orderService.account.total')}: <span className="font-bold text-slate-900 dark:text-slate-100">¥{o.totalAmount}</span>
              </div>
              <div className="flex gap-2">
                {o.status === 'SHIPPED' && (
                  <button onClick={() => handleConfirm(o.id)}
                    className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">{t('orderService.account.confirmReceipt')}</button>
                )}
                <Link href={`/account/orders/${o.id}`}
                  className="rounded border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                  {t('orderService.account.details')}
                </Link>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div className="py-20 text-center text-slate-400">{t('orderService.account.noOrders')}</div>}
      </div>
    </div>
  )
}