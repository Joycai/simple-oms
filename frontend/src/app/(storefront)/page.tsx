'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fetchItems, fetchCategories, fetchItemImages } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'
import { ItemCard } from '@/components/ItemCard'
import { CategorySidebar } from '@/components/CategorySidebar'

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
    <Suspense fallback={<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>}>
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
      .then(async (list: any[]) => {
        const withImages = await Promise.all(list.map(async (item: any) => {
          try { const images = await fetchItemImages(item.id); return { ...item, image: images[0]?.data || null } }
          catch { return { ...item, image: null } }
        }))
        setItems(withImages)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [categoryId, keyword])

  const allCats = categories.flatMap((c: any) => [c, ...(c.children || [])])
  const activeCat = categoryId ? allCats.find((c: any) => c?.id === Number(categoryId)) : null
  const parentCat = activeCat?.parentId ? categories.find((c: any) => c.id === activeCat.parentId) : null

  return (
    <div className="space-y-8">
      {!categoryId && !keyword && (
        <div className="relative overflow-hidden rounded-3xl bg-indigo-950 px-8 py-12 text-white xl:px-16 xl:py-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-md">Special Collection</span>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Curated items for the modern reader.</h1>
            <p className="mt-6 text-lg text-indigo-200/80">Discover a unique selection of high-quality products, categorized and managed with library-grade precision.</p>
          </div>
        </div>
      )}

      {(categoryId || keyword) && (
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          {parentCat && (<><span>/</span><Link href={`/?categoryId=${parentCat.id}`} className="hover:text-indigo-600">{parentCat.name}</Link></>)}
          {activeCat && (<><span>/</span><span className="font-bold text-slate-900 dark:text-slate-100">{activeCat.name}</span></>)}
          {keyword && (<><span>/</span><span className="italic">Search: "{keyword}"</span></>)}
        </nav>
      )}

      <div className="flex gap-6">
        <CategorySidebar activeId={categoryId ? Number(categoryId) : undefined} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{activeCat?.name || t('orderService.storefront.all')}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${!categoryId ? 'bg-indigo-950 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>{t('orderService.storefront.all')}</Link>
              {categories.map((cat: any) => {
                const active = categoryId === cat.id.toString() || (activeCat?.parentId === cat.id)
                return <Link key={cat.id} href={`/?categoryId=${cat.id}`} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${active ? 'bg-indigo-950 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>{cat.name}</Link>
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : items.map((item: any) => <ItemCard key={item.id} item={item} />)}
          </div>

          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">{t('orderService.storefront.noItems')}</h3>
              <Link href="/" className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700">Clear all filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
