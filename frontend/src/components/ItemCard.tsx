'use client'

import Link from 'next/link'
import { useI18n } from '@/lib/i18n'

interface ItemCardProps {
  item: {
    id: number
    name: string
    brand?: string
    location?: string
    price: number
    quantity: number
    thumbnail?: string // base64 from backend
  }
}

export function ItemCard({ item }: ItemCardProps) {
  const { t } = useI18n()

  const initials = item.name.substring(0, 2).toUpperCase()
  const gradients = [
    'from-indigo-100 to-slate-200',
    'from-blue-100 to-indigo-100',
    'from-slate-100 to-blue-50',
    'from-indigo-50 to-slate-100'
  ]
  const gradient = gradients[item.id % gradients.length]

  return (
    <Link href={`/items/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900">

      {/* Image */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden ${!item.thumbnail ? `bg-gradient-to-br ${gradient}` : ''}`}>
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl font-bold text-indigo-900/20 select-none">{initials}</span>    
        )}

        {/* Availability Badge */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            item.quantity > 0
              ? 'bg-emerald-100/80 text-emerald-700 backdrop-blur-sm'
              : 'bg-red-100/80 text-red-700 backdrop-blur-sm'
          }`}>
            {item.quantity > 0 ? t('orderService.storefront.inStock', { count: item.quantity.toString() }) : t('orderService.storefront.outOfStock')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {item.brand || item.location || 'Library Item'}
        </div>
        <h3 className="mb-2 line-clamp-2 flex-1 text-sm font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
          {item.name}
        </h3>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800">
          <div className="text-base font-bold text-slate-900 dark:text-slate-50">
            <span className="mr-0.5 text-xs font-medium">¥</span>{item.price}   
          </div>
          <div className="rounded-full bg-indigo-50 p-1.5 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950/50 dark:text-indigo-400 dark:group-hover:bg-indigo-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">   
              <path d="M5 12h14m-7-7 7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}