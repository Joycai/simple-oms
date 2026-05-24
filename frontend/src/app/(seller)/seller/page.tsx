'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchSellerItems, createItem, fetchCategories } from '@/lib/order-api'

export default function SellerDashboardPage() {
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', brand: '', location: '', price: '', quantity: '1', categoryId: '' })
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchSellerItems().then(setItems).catch(() => {})
    fetchCategories().then((cats: any[]) => {
      setCategories(cats.flatMap((c: any) => [c, ...(c.children || [])]))
    }).catch(() => {})
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    try {
      await createItem({
        name: form.name,
        description: form.description,
        brand: form.brand,
        location: form.location,
        price: form.price,
        quantity: Number(form.quantity),
        categoryId: Number(form.categoryId),
      })
      setShowForm(false)
      setForm({ name: '', description: '', brand: '', location: '', price: '', quantity: '1', categoryId: '' })
      fetchSellerItems().then(setItems)
      setMsg('Item created!')
    } catch { setMsg('Failed to create item') }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">My Items</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-950 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-900">
          {showForm ? 'Cancel' : '+ New Item'}
        </button>
      </div>

      {msg && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">{msg}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 rounded-xl border bg-white p-4 space-y-3 dark:bg-slate-900 dark:border-slate-800">
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Item name" required
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
          <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description"
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
          <div className="grid grid-cols-3 gap-3">
            <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Brand"
              className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Location"
              className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} required
              className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <option value="">Category</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Price" type="number" step="0.01" required
              className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <input value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="Quantity" type="number" required
              className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <button type="submit" className="rounded-lg bg-indigo-950 text-sm font-medium text-white hover:bg-indigo-900">Create</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <div>
              <div className="font-medium text-slate-900 dark:text-slate-100">{item.name}</div>
              <div className="text-sm text-slate-500">¥{item.price} &middot; Stock: {item.quantity} &middot; {item.status}</div>
            </div>
            <Link href={`/seller/items/${item.id}`}
              className="text-sm text-indigo-600 hover:text-indigo-800">Edit</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
