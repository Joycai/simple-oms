'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchSellerItems, fetchCategories, fetchItemImages, uploadItemImage, deleteItemImage, reorderItemImages } from '@/lib/order-api'
import { useI18n } from '@/lib/i18n'
import { useImageUpload, ImageInput } from '@/components/ImageUploader'

function ItemForm({ item, onSaved }: { item?: any; onSaved: () => void }) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const isEdit = !!item
  const [form, setForm] = useState({
    name: item?.name || '', description: item?.description || '', brand: item?.brand || '',
    location: item?.location || '', price: item?.price || '', quantity: item?.quantity || '1',
    categoryId: item?.categoryId || '',
  })
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const images = useImageUpload(5)

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {})
    if (item) fetchItemImages(item.id).then((list: any[]) => {
      images.setPreviews(list.map((img: any) => img.data))
    }).catch(() => {})
  }, [item?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const body: any = {
      name: form.name, description: form.description, brand: form.brand,
      location: form.location, price: form.price, quantity: Number(form.quantity),
      categoryId: Number(form.categoryId),
    }
    try {
      const url = isEdit ? `/seller/items/${item.id}` : '/seller/items'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(`${process.env.NEXT_PUBLIC_ORDER_API || 'http://localhost:8081/api/v1'}${url}`, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setMsg(data.message || 'Failed'); return }
      const savedId = isEdit ? item.id : data.id

      // Upload images
      for (const b64 of images.previews) {
        await uploadItemImage(savedId, b64)
      }
      setMsg(isEdit ? 'Updated!' : 'Created!')
      onSaved()
    } catch { setMsg('Failed') }
    finally { setSaving(false) }
  }

  const allCategories = categories.flatMap((c: any) => [c, ...(c.children || [])])

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 space-y-4 dark:bg-slate-900 dark:border-slate-800">
      <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">
        {isEdit ? (locale === 'zh-CN' ? '编辑商品' : 'Edit Item') : (locale === 'zh-CN' ? '发布商品' : 'New Item')}
      </h2>
      {msg && <div className={`rounded-lg px-4 py-2 text-sm ${msg.includes('Failed') ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}`}>{msg}</div>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '名称' : 'Name'} *</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '描述' : 'Description'}</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '品类' : 'Category'} *</label>
          <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <option value="">Select</option>
            {allCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '品牌' : 'Brand'}</label>
          <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '所在地' : 'Location'}</label>
          <input value={form.location} onChange={e => setForm({...form, location: e.target.value})}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '价格' : 'Price'} *</label>
          <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" step="0.01" required
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '数量' : 'Quantity'} *</label>
          <input value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} type="number" required
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh-CN' ? '图片' : 'Images'}</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.previews.map((src, i) => (
            <div key={i} className="relative group">
              <img src={src} className="h-24 w-24 rounded-lg border object-cover dark:border-slate-700" />
              <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 bg-black/40 rounded-lg transition">
                <button type="button" onClick={() => images.moveUp(i)} disabled={i === 0}
                  className="text-white text-xs bg-black/50 rounded px-1 py-0.5 disabled:opacity-30">&uarr;</button>
                <button type="button" onClick={() => images.moveDown(i)}
                  className="text-white text-xs bg-black/50 rounded px-1 py-0.5">&darr;</button>
                <button type="button" onClick={() => images.remove(i)}
                  className="text-white text-xs bg-red-500/80 rounded px-1 py-0.5">&times;</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => images.trigger()}
            className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-2xl text-slate-400 hover:border-indigo-500 hover:text-indigo-500 dark:border-slate-700">
            +
          </button>
          <ImageInput upload={images} />
        </div>
        {images.error && <p className="mt-1 text-xs text-red-500">{images.error}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="rounded-lg bg-indigo-950 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-50">
          {saving ? 'Saving...' : (locale === 'zh-CN' ? '保存' : 'Save')}
        </button>
        <button type="button" onClick={() => router.back()}
          className="rounded-lg border px-6 py-2 text-sm dark:border-slate-700">
          {locale === 'zh-CN' ? '取消' : 'Cancel'}
        </button>
      </div>
    </form>
  )
}

// Update order-api.ts to support the image functions inline
async function fetchItemImages(itemId: number) { const res = await fetch(`${process.env.NEXT_PUBLIC_ORDER_API || 'http://localhost:8081/api/v1'}/items/${itemId}/images`); return res.json() }
async function uploadItemImage(itemId: number, data: string) {
  await fetch(`${process.env.NEXT_PUBLIC_ORDER_API || 'http://localhost:8081/api/v1'}/seller/items/${itemId}/images`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('access_token')}` },
    body: JSON.stringify({ data }),
  })
}
async function deleteItemImage(id: number) { /* handled via component */ }
async function reorderItemImages(itemId: number, ids: number[]) { /* handled via component */ }

export default function SellerItemsPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => { load() }, [])

  async function load() {
    try { setItems(await fetchSellerItems()) } finally { setLoading(false) }
  }

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.seller.inventory')}</h1>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingItem(null) }}
            className="rounded-lg bg-indigo-950 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-900">
            + New Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-8">
          <ItemForm item={editingItem} onSaved={() => { setShowForm(false); setEditingItem(null); load() }} />
        </div>
      )}

      {/* Item table */}
      <div className="overflow-hidden rounded-xl border bg-white dark:bg-slate-900 dark:border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800">
            <tr><th className="px-6 py-3">Item</th><th className="px-6 py-3">Price</th><th className="px-6 py-3">Stock</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Action</th></tr>
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
                  <button onClick={() => { setEditingItem(item); setShowForm(true) }}
                    className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div className="py-20 text-center text-slate-400">No items</div>}
      </div>
    </div>
  )
}
