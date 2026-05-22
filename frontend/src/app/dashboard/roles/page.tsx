'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { getToken } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'

interface RoleData { id: number; name: string; description: string; permissionCount: number; userCount: number }

export default function RolesPage() {
  const { locale, t } = useI18n()
  const [roles, setRoles] = useState<RoleData[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editRole, setEditRole] = useState<RoleData | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [descInput, setDescInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { loadRoles() }, [])

  async function loadRoles() {
    const res = await fetch('/api/v1/roles', { headers: { Authorization: `Bearer ${getToken()}` } })
    if (res.ok) setRoles(await res.json())
    setLoading(false)
  }

  function resetForm() { setNameInput(''); setDescInput(''); setError(''); setEditRole(null); setShowCreate(false) }

  async function saveRole() {
    setError('')
    if (!nameInput.trim()) { setError('角色名不能为空'); return }
    const token = getToken()
    const url = editRole ? `/api/v1/roles/${editRole.id}` : '/api/v1/roles'
    const method = editRole ? 'PUT' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: nameInput.trim(), description: descInput.trim() || null }),
    })
    if (!res.ok) { const data = await res.json(); setError(data.message || '操作失败'); return }
    resetForm(); loadRoles()
  }

  async function deleteRole(id: number) {
    await fetch(`/api/v1/roles/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } })
    loadRoles()
  }

  function openEdit(r: RoleData) { setEditRole(r); setNameInput(r.name); setDescInput(r.description); setShowCreate(true) }
  function openCreate() { resetForm(); setShowCreate(true) }

  if (loading) return <AuthGuard><div className="flex items-center justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-indigo-900 border-t-transparent rounded-full" /></div></AuthGuard>

  const label = (zh: string, en: string) => locale === 'zh-CN' ? zh : en

  return (
    <AuthGuard>
      <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">{t('roles.title')}</h2>
          <button onClick={openCreate} className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800">{label('+ 新建角色', '+ New Role')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('roles.name')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('roles.description')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('roles.members')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('roles.permissions')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('roles.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{r.name}</td>
                  <td className="px-4 py-3 text-slate-500">{r.description || '-'}</td>
                  <td className="px-4 py-3 text-slate-500">{r.userCount}</td>
                  <td className="px-4 py-3 text-slate-500">{r.permissionCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50">{label('编辑', 'Edit')}</button>
                      <button onClick={() => { if (confirm(label('确定删除？', 'Confirm delete?'))) deleteRole(r.id) }} className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50">{label('删除', 'Delete')}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-semibold">{editRole ? label('编辑角色', 'Edit Role') : label('新建角色', 'New Role')}</h3>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-4 space-y-4">
              <div><label className="block text-sm font-medium mb-1">{t('roles.name')}</label><input value={nameInput} onChange={e => setNameInput(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('roles.description')}</label><input value={descInput} onChange={e => setDescInput(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={resetForm} className="rounded-lg border px-4 py-2 text-sm">{label('取消', 'Cancel')}</button>
              <button onClick={saveRole} className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white">{label('保存', 'Save')}</button>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
