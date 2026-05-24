'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { orderFetch } from '@/lib/order-api'

async function fetchCats() {
  const res = await orderFetch('/seller/categories')
  return res.ok ? res.json() : []
}

export default function CategoriesPage() {
  const { t } = useI18n()
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
    const body: any = { name: name.trim() }
    if (parentId) body.parentId = Number(parentId)
    
    try {
      const res = await orderFetch(url, { method, body: JSON.stringify(body) })   
      if (res.ok) { 
        setName(''); setParentId(''); setEditing(null); load()
        setMsg(editing ? t('orderService.seller.form.updated') : t('orderService.seller.form.created'))
        setTimeout(() => setMsg(''), 2000)
      } else {
        setMsg(t('orderService.seller.form.failed'))
      }
    } catch {
      setMsg(t('orderService.seller.form.failed'))
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure?')) return
    await orderFetch(`/seller/categories/${id}`, { method: 'DELETE' })
    load()
  }

  const l1List = cats.filter((c: any) => !c.parentId)

  if (loading) return <div className="py-20 text-center text-slate-400">{t('login.loggingIn')}</div>

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-slate-900 dark:text-slate-50">{t('orderService.seller.inventory')}</h1>
          <p className="mt-1 text-sm text-slate-500">Maintain the hierarchical category tree for your products.</p>
        </div>
      </div>

      {msg && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
          msg.includes('失败') || msg.toLowerCase().includes('failed')
            ? 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' 
            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
        }`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col sm:flex-row gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
        <input value={name} onChange={e => setName(e.target.value)} 
          placeholder={t('orderService.seller.categories.placeholder')} required
          className="flex-[2] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm outline-none transition-all focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        <select value={parentId} onChange={e => setParentId(e.target.value)}    
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <option value="">{t('orderService.seller.categories.topLevel')}</option>
          {l1List.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" 
          className="rounded-xl bg-indigo-950 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-900 active:scale-95 dark:bg-indigo-600">
          {editing ? t('orderService.seller.categories.update') : t('orderService.seller.categories.add')}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(null); setName(''); setParentId('') }}
            className="rounded-xl border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400">
            {t('orderService.seller.form.cancel')}
          </button>
        )}
      </form>

      <div className="space-y-4">
        {l1List.map((l1: any) => (
          <div key={l1.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="font-bold text-slate-900 dark:text-slate-100">{l1.name}</span>
              </div>
              <div className="flex gap-4">
                <button onClick={() => { setEditing(l1); setName(l1.name); setParentId('') }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-tighter">{t('orderService.seller.edit')}</button>
                <button onClick={() => handleDelete(l1.id)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-tighter">Delete</button>
              </div>
            </div>
            {l1.children?.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
                {l1.children.map((l2: any) => (
                  <div key={l2.id} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-2.5 transition-colors hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-800/30">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{l2.name}</span>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(l2); setName(l2.name); setParentId(String(l1.id)) }}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase">Edit</button>
                      <button onClick={() => handleDelete(l2.id)}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase">Del</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {!loading && l1List.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
            <p className="text-sm font-medium">{t('orderService.seller.noItems')}</p>
          </div>
        )}
      </div>
    </div>
  )
}