'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchItems, fetchCategories } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'
import { ItemCard } from '@/components/ItemCard'

function SkeletonCard() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800" />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="h-2 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded" />
        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3 dark:border-slate-800">
          <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
          <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export default function StorefrontPage() {
  return (
    <Suspense fallback={<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>}>
      <StorefrontContent />
    </Suspense>
  )
}

function StorefrontContent() {
  const { t } = useI18n()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const categoryId = searchParams.get('categoryId')
  const keyword = searchParams.get('keyword')

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const cid = categoryId ? Number(categoryId) : undefined
    const kw = keyword || undefined
    fetchItems({ categoryId: cid, keyword: kw })
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [categoryId, keyword])

  const catName = categoryId
    ? categories.flatMap(c => [c, ...(c.children || [])]).find(c => c?.id === Number(categoryId))?.name
    : null

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      {!categoryId && !keyword && (
        <div className="relative overflow-hidden rounded-3xl bg-indigo-950 px-8 py-12 text-white xl:px-16 xl:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-md">
              Special Collection
            </span>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Curated items for the modern reader.
            </h1>
            <p className="mt-6 text-lg text-indigo-200/80">
              Discover a unique selection of high-quality products, categorized and managed with library-grade precision.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">
            {catName || t('orderService.storefront.all')}
          </h2>
          {keyword && <p className="mt-1 text-sm text-slate-500">{t('login.username')}: &ldquo;{keyword}&rdquo;</p>}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <Link href="/" className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            !categoryId ? 'bg-indigo-950 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
          }`}>
            {t('orderService.storefront.all')}
          </Link>
          {categories.flatMap(c => [c, ...(c.children || [])]).map(cat => {
            const active = categoryId === cat.id.toString()
            return (
              <Link key={cat.id} href={`/?categoryId=${cat.id}`}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  active ? 'bg-indigo-950 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                {cat.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Item grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.map((item: any) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="rounded-full bg-slate-50 p-6 dark:bg-slate-900">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-300">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">{t('orderService.storefront.noItems')}</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-xs">We couldn't find what you were looking for. Try a different category or search term.</p>
          <Link href="/" className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700">Clear all filters</Link>
        </div>
      )}
    </div>
  )
}
}