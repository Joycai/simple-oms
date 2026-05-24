'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchItems, fetchCategories } from '@/lib/order-api'

export default function StorefrontPage() {
  const searchParams = useSearchParams()
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const categoryId = searchParams.get('categoryId')
  const keyword = searchParams.get('keyword')

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    const cid = categoryId ? Number(categoryId) : undefined
    const kw = keyword || undefined
    fetchItems({ categoryId: cid, keyword: kw }).then(setItems).catch(() => {})
  }, [categoryId, keyword])

  const catName = categoryId
    ? categories.flatMap(c => [c, ...(c.children || [])]).find(c => c?.id === Number(categoryId))?.name
    : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">
          {catName || 'All Items'}
        </h1>
        {keyword && <p className="mt-1 text-sm text-slate-500">Search: &ldquo;{keyword}&rdquo;</p>}
      </div>

      {/* Category pills */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/" className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200">
          All
        </Link>
        {categories.flatMap(c => [c, ...(c.children || [])]).map(cat => (
          <Link key={cat.id} href={`/?categoryId=${cat.id}`}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400">
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item: any) => (
          <Link key={item.id} href={`/items/${item.id}`}
            className="group rounded-xl border bg-white p-4 transition-shadow hover:shadow-md dark:bg-slate-900 dark:border-slate-800">
            <div className="mb-2 text-sm font-medium text-slate-900 group-hover:text-indigo-700 dark:text-slate-100">
              {item.name}
            </div>
            <div className="mb-1 text-xs text-slate-500">{item.brand || item.location || '-'}</div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-indigo-950 dark:text-indigo-300">
                ¥{item.price}
              </span>
              <span className={`text-xs ${item.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {item.quantity > 0 ? `${item.quantity} in stock` : 'Sold out'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && (
        <div className="py-20 text-center text-slate-400">No items found</div>
      )}
    </div>
  )
}
