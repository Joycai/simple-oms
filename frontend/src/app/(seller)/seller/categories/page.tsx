'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { orderFetch } from '@/lib/order-api'

async function fetchCats() {
  const res = await orderFetch('/seller/categories')
  return res.ok ? res.json() : []
}

export default function CategoriesPage() {
  const { locale, t } = useI18n()
  const [cats, setCats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any>(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try { setCats(await fetchCats()) } finally { setLoading(false) }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setMsg('')
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/seller/categories/${editing.id}` : '/seller/categories'
    const body: any = { name }
    if (parentId) body.parentId = parentId
    const res = await orderFetch(url, { method, body: JSON.stringify(body) })
    if (res.ok) { setName(''); setParentId(''); setEditing(null); load(); setMsg('Saved!') }
    else setMsg('Failed')
  }

  async function handleDelete(id: number) {
    await orderFetch(`/seller/categories/${id}`, { method: 'DELETE' })
    load()
  }

  const l1List = cats.filter((c: any) => !c.parentId)

  if (loading) return <div className="py-20 text-center text-slate-400">Loading...</div>

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-slate-900 dark:text-slate-50">
        {locale === 'zh-CN' ? '品类管理' : 'Categories'}
      </h1>

      {msg && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">{msg}</div>}

      <form onSubmit={handleSave} className="mb-6 flex gap-3">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" required
          className="flex-1 rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        <select value={parentId} onChange={e => setParentId(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <option value="">Top Level</option>
          {l1List.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-indigo-950 px-4 py-2 text-sm text-white hover:bg-indigo-900">
          {editing ? 'Update' : 'Add'}
        </button>
        {editing && <button type="button" onClick={() => { setEditing(null); setName(''); setParentId('') }}
          className="rounded-lg border px-4 py-2 text-sm">Cancel</button>}
      </form>

      <div className="space-y-4">
        {l1List.map((l1: any) => (
          <div key={l1.id} className="rounded-xl border bg-white p-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-900 dark:text-slate-100">{l1.name}</span>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(l1); setName(l1.name); setParentId('') }}
                  className="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
                <button onClick={() => handleDelete(l1.id)}
                  className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
            {l1.children?.length > 0 && (
              <div className="ml-4 space-y-1">
                {l1.children.map((l2: any) => (
                  <div key={l2.id} className="flex items-center justify-between rounded border px-3 py-1.5 text-sm dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">{l2.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(l2); setName(l2.name); setParentId(String(l1.id)) }}
                        className="text-xs text-indigo-600 hover:text-indigo-800">Edit</button>
                      <button onClick={() => handleDelete(l2.id)}
                        className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
