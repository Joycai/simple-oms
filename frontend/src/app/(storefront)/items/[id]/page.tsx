'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchItem, addToCart, fetchItemImages } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'

export default function ItemDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [msg, setMsg] = useState('')
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

  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-8 md:grid-cols-2">
        <div onClick={() => item.images?.[0]?.data && setLightbox(true)}
          className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 overflow-hidden cursor-pointer">
          {item.images?.[0]?.data ? (
            <img src={item.images[0].data} alt={item.name} className="h-full w-full object-cover" />
          ) : 'Image Placeholder'}
        </div>

        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-50">{item.name}</h1>
          <p className="mt-2 text-lg text-indigo-600 font-bold">¥{item.price}</p>
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('orderService.storefront.specs')}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="text-slate-500">{t('orderService.storefront.brand')}</div>
                <div className="text-slate-900 dark:text-slate-300">{item.brand || '-'}</div>
                <div className="text-slate-500">{t('orderService.storefront.location')}</div>
                <div className="text-slate-900 dark:text-slate-300">{item.location || '-'}</div>
                <div className="text-slate-500">{t('orderService.storefront.category')}</div>
                <div className="text-slate-900 dark:text-slate-300">{item.categoryName || '-'}</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{t('orderService.storefront.sellerInfo')}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.sellerName || 'Verified Seller'}</p>
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded border px-3 py-1">-</button>
                  <span className="w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="rounded border px-3 py-1">+</button>
                </div>
                <span className={`text-sm ${item.quantity > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {item.quantity > 0 
                    ? t('orderService.storefront.inStock', { count: item.quantity.toString() }) 
                    : t('orderService.storefront.outOfStock')}
                </span>
              </div>

              <div className="mt-6 flex gap-3">
                <button onClick={handleAddToCart} disabled={item.quantity === 0}
                  className="flex-1 rounded-lg border-2 border-indigo-950 py-3 text-sm font-medium text-indigo-950 hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-300 dark:text-indigo-300">
                  {t('orderService.storefront.addToCart')}
                </button>
                <button onClick={handleBuyNow} disabled={item.quantity === 0}
                  className="flex-1 rounded-lg bg-indigo-950 py-3 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-50">
                  {t('orderService.storefront.buyNow')}
                </button>
              </div>
              {msg && <p className="mt-2 text-center text-sm text-emerald-600">{msg}</p>}
            </div>
          </div>
        </div>
      </div>

      {lightbox && item.images?.[0]?.data && (
        <div onClick={() => setLightbox(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 cursor-zoom-out">
          <img src={item.images[0].data} alt={item.name}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" />
        </div>
      )}
    </div>
  )
}