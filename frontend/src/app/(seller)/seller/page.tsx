'use client'

import { useEffect, useState } from 'react'
import { fetchSellerItems } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

export default function SellerInventoryPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    try { setItems(await fetchSellerItems()) } finally { setLoading(false) }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.seller.inventory')}</h1>
        <button className="rounded-lg bg-indigo-950 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-900">
          {t('orderService.seller.addItem')}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3">Item</th>
              <th className="px-6 py-3">{t('orderService.seller.price')}</th>
              <th className="px-6 py-3">{t('orderService.seller.stock')}</th>
              <th className="px-6 py-3">{t('orderService.seller.status')}</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {items.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.name}</td>
                <td className="px-6 py-4">¥{item.price}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${item.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium">{t('orderService.seller.edit')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="py-20 text-center text-slate-400">{t('orderService.seller.noItems')}</div>}
      </div>
    </div>
  )
}