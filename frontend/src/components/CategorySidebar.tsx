'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchCategories } from '@/lib/order-api'

export function CategorySidebar({ activeId }: { activeId?: number }) {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  return (
    <aside className="w-56 shrink-0">
      <div className="rounded-xl border bg-white p-3 dark:bg-slate-900 dark:border-slate-800">
        <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h3>
        <Link href="/" className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
          !activeId ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
        }`}>All Items</Link>
        <div className="mt-1 space-y-0.5">
          {categories.map((l1: any) => (
            <div key={l1.id}>
              <Link href={`/?categoryId=${l1.id}`}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeId === l1.id ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950 dark:text-indigo-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 font-medium'
                }`}>
                {l1.name}
              </Link>
              {l1.children?.length > 0 && (
                <div className="ml-3 space-y-0.5">
                  {l1.children.map((l2: any) => (
                    <Link key={l2.id} href={`/?categoryId=${l2.id}`}
                      className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        activeId === l2.id ? 'bg-indigo-50 text-indigo-700 font-medium dark:bg-indigo-950 dark:text-indigo-300'
                          : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
                      }`}>
                      {l2.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
