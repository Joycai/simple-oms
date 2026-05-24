'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchItem, fetchItemImages, addToCart } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'
import { getToken } from '@/lib/auth'

export default function ItemDetailPage() {
  const { t } = useI18n()
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [images, setImages] = useState<any[]>([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!id) return
    fetchItem(Number(id)).then(setItem).catch(() => {}).finally(() => setLoading(false))
    fetchItemImages(Number(id)).then(setImages).catch(() => {})
  }, [id])

  async function handleAddToCart() {
    if (!getToken()) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    setMsg('')
    try {
      await addToCart(Number(id), qty)
      setMsg('Added to cart')
      window.dispatchEvent(new Event('cart-updated'))
    } catch {
      setMsg('Failed')
    }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>
  if (!item) return <div className="py-20 text-center text-slate-400">Item not found</div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
          {images[0] ? (
            <img src={images[0].data} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl font-bold text-slate-300">
              {item.name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-50">{item.name}</h1>
          {item.brand && <p className="mt-2 text-sm text-slate-500">{item.brand}</p>}
          {item.location && <p className="text-sm text-slate-500">{item.location}</p>}
          <p className="mt-4 text-3xl font-bold text-indigo-600">¥{item.price}</p>
          {item.description && <p className="mt-4 text-slate-600 dark:text-slate-400">{item.description}</p>}
          <p className="mt-2 text-sm text-slate-500">Stock: {item.quantity}</p> 

          {item.quantity > 0 ? (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border dark:border-slate-700">
                <button onClick={() => setQty(Math.max(1, qty - 1))} 
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">-</button> 
                <span className="px-4 py-2 text-sm font-medium">{qty}</span>    
                <button onClick={() => setQty(Math.min(item.quantity, qty + 1))} 
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">+</button>
              </div>
              <button onClick={handleAddToCart} 
                className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                {t('orderService.storefront.addToCart')}
              </button>
            </div>
          ) : (
            <p className="mt-6 text-sm font-bold text-red-500">{t('orderService.storefront.outOfStock')}</p>
          )}
          {msg && <p className="mt-3 text-sm font-medium text-emerald-600">{msg}</p>}
        </div>
      </div>
    </div>
  )
}
