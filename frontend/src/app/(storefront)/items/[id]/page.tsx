'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchItem, addToCart, fetchItemImages } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

export default function ItemDetailPage() {
  const { t, locale } = useI18n()
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [msg, setMsg] = useState('')
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    Promise.all([
      fetchItem(Number(id)),
      fetchItemImages(Number(id)),
    ]).then(([item, images]) => {
      setItem({ ...item, images })
    }).finally(() => setLoading(false))
  }, [id])

  async function handleAddToCart() {
    await addToCart(item.id, quantity)
    setMsg(t('orderService.storefront.addedToCart'))
    sessionStorage.setItem('cart_count', (Number(sessionStorage.getItem('cart_count') || 0) + quantity).toString())
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleBuyNow() {
    await addToCart(item.id, quantity)
    router.push('/cart')
  }

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>
  if (!item) return <div className="py-20 text-center text-slate-400">{t('orderService.storefront.noItems')}</div>

  const images = item.images || []
  const hasImages = images.length > 0

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div onClick={() => hasImages && setLightbox(true)}
            className="group relative aspect-square overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-800 cursor-zoom-in">
            {hasImages ? (
              <img src={images[activeImageIdx].data} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: any, i: number) => (
                <button key={img.id} onClick={() => setActiveImageIdx(i)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    activeImageIdx === i ? 'border-indigo-600 shadow-md ring-2 ring-indigo-600/10' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}>
                  <img src={img.data} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-col">
          <div className="mb-6 border-b border-slate-100 pb-6 dark:border-slate-800">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{item.name}</h1>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-indigo-600">¥{item.price}</span>
              <span className="text-sm text-slate-400 line-through">¥{(Number(item.price) * 1.2).toFixed(0)}</span>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('orderService.storefront.specs')}</h3>
              <div className="mt-4 grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <div className="text-slate-400">{t('orderService.storefront.brand')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{item.brand || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400">{t('orderService.storefront.location')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{item.location || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400">{t('orderService.storefront.category')}</div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">{item.categoryName || '-'}</div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{t('orderService.storefront.sellerInfo')}</h3>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {item.sellerName?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="text-sm">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{item.sellerName || 'Verified Seller'}</div>
                  <div className="text-xs text-slate-500">Official Store</div>
                </div>
              </div>
            </section>

            <section className="pt-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center rounded-xl border border-slate-200 p-1 dark:border-slate-700">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="h-8 w-8 rounded-lg text-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">-</button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="h-8 w-8 rounded-lg text-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">+</button>
                </div>
                <div className={`text-sm font-bold tracking-tight ${item.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {item.quantity > 0
                    ? t('orderService.storefront.inStock', { count: item.quantity.toString() })
                    : t('orderService.storefront.outOfStock')}
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={handleAddToCart} disabled={item.quantity === 0}
                  className="flex-1 rounded-2xl border-2 border-indigo-950 py-3.5 text-sm font-bold text-indigo-950 transition-all hover:bg-indigo-50 active:scale-95 disabled:opacity-50 dark:border-indigo-300 dark:text-indigo-300">
                  {t('orderService.storefront.addToCart')}
                </button>
                <button onClick={handleBuyNow} disabled={item.quantity === 0}   
                  className="flex-1 rounded-2xl bg-indigo-950 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-950/20 transition-all hover:bg-indigo-900 active:scale-95 disabled:opacity-50">
                  {t('orderService.storefront.buyNow')}
                </button>
              </div>
              {msg && <p className="mt-4 text-center text-sm font-bold text-emerald-600 animate-in fade-in slide-in-from-top-2">{msg}</p>}
            </section>
          </div>
        </div>
      </div>

      {/* Lightbox - Polish with mult-image support and animations */}
      {lightbox && hasImages && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
          <button onClick={() => setLightbox(false)} 
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
          
          <div className="relative flex w-full max-w-5xl items-center justify-center px-4">
            <button onClick={(e) => { e.stopPropagation(); setActiveImageIdx((activeImageIdx - 1 + images.length) % images.length) }}
              className="absolute left-4 rounded-full bg-white/5 p-4 text-white hover:bg-white/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <img key={activeImageIdx} src={images[activeImageIdx].data} alt={item.name}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl animate-in zoom-in-95 duration-500" />  

            <button onClick={(e) => { e.stopPropagation(); setActiveImageIdx((activeImageIdx + 1) % images.length) }}
              className="absolute right-4 rounded-full bg-white/5 p-4 text-white hover:bg-white/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="mt-8 flex gap-2">
            {images.map((_: any, i: number) => (
              <div key={i} className={`h-1.5 w-1.5 rounded-full transition-all ${activeImageIdx === i ? 'w-6 bg-indigo-500' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}