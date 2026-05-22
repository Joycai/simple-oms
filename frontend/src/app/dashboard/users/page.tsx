'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { getToken } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'

interface UserData {
  id: number; username: string; email: string; enabled: boolean
  createdAt: string; roles: { id: number; name: string }[]
}
interface RoleData { id: number; name: string }

export default function UsersPage() {
  const { t, locale } = useI18n()
  const [users, setUsers] = useState<UserData[]>([])
  const [roles, setRoles] = useState<RoleData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [createError, setCreateError] = useState('')
  const [createLoading, setCreateLoading] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const token = getToken()
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('/api/v1/admin/users', { headers }),
        fetch('/api/v1/roles', { headers }),
      ])
      if (uRes.ok) setUsers(await uRes.json())
      if (rRes.ok) setRoles(await rRes.json())
    } catch { /* */ }
    setLoading(false)
  }

  async function toggleUser(id: number) {
    const token = getToken()
    const res = await fetch(`/api/v1/admin/users/${id}/toggle`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const updated = await res.json()
      setUsers(users.map(u => u.id === id ? { ...u, enabled: updated.enabled } : u))
    }
  }

  async function saveRoles() {
    if (!editingUser) return
    const token = getToken()
    await fetch(`/api/v1/admin/users/${editingUser.id}/roles`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ roleIds: selectedRoles }),
    })
    setShowRoleModal(false)
    loadData()
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault(); setCreateError('')
    if (!newUsername.trim() || !newPassword.trim()) {
      setCreateError(t('login.usernameRequired'))
      return
    }
    if (newPassword.length < 6) {
      setCreateError(locale === 'zh-CN' ? '密码至少6位' : 'Min 6 chars')
      return
    }
    setCreateLoading(true)
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword, email: newEmail.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.message); return }
      setShowCreateModal(false); setNewUsername(''); setNewPassword(''); setNewEmail('')
      loadData()
    } catch { setCreateError(locale === 'zh-CN' ? '创建失败' : 'Failed') }
    finally { setCreateLoading(false) }
  }

  function openRoleModal(user: UserData) {
    setEditingUser(user)
    setSelectedRoles(user.roles.map(r => r.id))
    setShowRoleModal(true)
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <AuthGuard><div className="flex items-center justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-indigo-900 border-t-transparent rounded-full" /></div></AuthGuard>

  return (
    <AuthGuard>
      <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">{t('users.title')}</h2>
          <button onClick={() => { setCreateError(''); setNewUsername(''); setNewPassword(''); setNewEmail(''); setShowCreateModal(true) }}
            className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800">
            {locale === 'zh-CN' ? '+ 添加用户' : '+ Add User'}
          </button>
        </div>
        <div className="p-4">
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={locale === 'zh-CN' ? '搜索用户名或邮箱...' : 'Search username or email...'}
            className="w-full max-w-sm rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('users.username')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('users.email')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('users.status')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('users.roles')}</th>
                <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">{t('users.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3"><span className="font-medium text-slate-900 dark:text-slate-50">{u.username}</span></td>
                  <td className="px-4 py-3 text-slate-500">{u.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.enabled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {u.enabled ? (locale === 'zh-CN' ? '启用' : 'Active') : (locale === 'zh-CN' ? '禁用' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.roles.map(r => (
                        <span key={r.id} className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">{r.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openRoleModal(u)} className="rounded px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950">{t('users.assignRoles')}</button>
                      <button onClick={() => toggleUser(u.id)} className={`rounded px-2 py-1 text-xs ${u.enabled ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                        {u.enabled ? (locale === 'zh-CN' ? '禁用' : 'Disable') : (locale === 'zh-CN' ? '启用' : 'Enable')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showRoleModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-semibold">{locale === 'zh-CN' ? '分配角色' : 'Assign Roles'} — {editingUser.username}</h3>
            <div className="mt-4 space-y-2">
              {roles.map(r => (
                <label key={r.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <input type="checkbox" checked={selectedRoles.includes(r.id)}
                    onChange={e => { if (e.target.checked) setSelectedRoles([...selectedRoles, r.id]); else setSelectedRoles(selectedRoles.filter(id => id !== r.id)) }}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-900" />
                  <span className="text-sm font-medium">{r.name}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowRoleModal(false)} className="rounded-lg border px-4 py-2 text-sm">{locale === 'zh-CN' ? '取消' : 'Cancel'}</button>
              <button onClick={saveRoles} className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white">{locale === 'zh-CN' ? '保存' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="font-serif text-lg font-semibold">{locale === 'zh-CN' ? '添加用户' : 'Add User'}</h3>
            {createError && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{createError}</div>}
            <form onSubmit={createUser} className="mt-4 space-y-4">
              <div><label className="block text-sm font-medium mb-1">{t('login.username')}</label>
                <input value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('login.password')}</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('users.email')}</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg border px-4 py-2 text-sm">{locale === 'zh-CN' ? '取消' : 'Cancel'}</button>
                <button type="submit" disabled={createLoading} className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white">{createLoading ? '...' : (locale === 'zh-CN' ? '创建' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthGuard>
  )
}
