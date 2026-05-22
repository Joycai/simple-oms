'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { getToken } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'

interface PermGroup { module: string; permissions: { id: number; code: string; name: string }[] }
interface RoleItem { id: number; name: string }

export default function PermissionsPage() {
  const { t, locale } = useI18n()
  const [permGroups, setPermGroups] = useState<PermGroup[]>([])
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [assignedPerms, setAssignedPerms] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const token = getToken()
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [pRes, rRes] = await Promise.all([
        fetch('/api/v1/admin/permissions', { headers }),
        fetch('/api/v1/roles', { headers }),
      ])
      if (pRes.ok) setPermGroups(await pRes.json())
      if (rRes.ok) setRoles(await rRes.json())
    } catch { /* */ }
    setLoading(false)
  }

  async function selectRole(roleId: number) {
    setSelectedRoleId(roleId)
    const token = getToken()
    const res = await fetch(`/api/v1/roles/${roleId}/permissions`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setAssignedPerms(new Set(await res.json()))
  }

  function togglePerm(permId: number) {
    const next = new Set(assignedPerms)
    if (next.has(permId)) next.delete(permId); else next.add(permId)
    setAssignedPerms(next)
  }

  function groupIndeterminate(group: PermGroup): boolean {
    const ids = group.permissions.map(p => p.id)
    const checked = ids.filter(id => assignedPerms.has(id)).length
    return checked > 0 && checked < ids.length
  }
  function groupChecked(group: PermGroup): boolean { return group.permissions.every(p => assignedPerms.has(p.id)) }

  function toggleGroup(group: PermGroup) {
    const ids = group.permissions.map(p => p.id)
    const allChecked = groupChecked(group)
    const next = new Set(assignedPerms)
    ids.forEach(id => { if (allChecked) next.delete(id); else next.add(id) })
    setAssignedPerms(next)
  }

  async function savePermissions() {
    if (selectedRoleId === null) return
    const token = getToken()
    await fetch(`/api/v1/roles/${selectedRoleId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ permissionIds: Array.from(assignedPerms) }),
    })
    setToast(locale === 'zh-CN' ? '权限已更新' : 'Permissions updated')
    setTimeout(() => setToast(''), 2000)
  }

  if (loading) return <AuthGuard><div className="flex items-center justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-indigo-900 border-t-transparent rounded-full" /></div></AuthGuard>

  return (
    <AuthGuard>
      <div className="rounded-xl bg-white shadow-sm dark:bg-slate-900 p-6">
        <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">{t('permissions.title')}</h2>
        <div className="mt-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('permissions.selectRole')}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {roles.map(r => (
              <button key={r.id} onClick={() => selectRole(r.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${selectedRoleId === r.id ? 'bg-indigo-900 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'}`}>
                {r.name}
              </button>
            ))}
          </div>
        </div>
        {selectedRoleId !== null && (
          <div className="mt-6 space-y-4">
            {permGroups.map(group => (
              <div key={group.module} className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <label className="flex items-center gap-3">
                  <input type="checkbox" checked={groupChecked(group)}
                    ref={el => { if (el) el.indeterminate = groupIndeterminate(group) }}
                    onChange={() => toggleGroup(group)} className="h-4 w-4 rounded border-slate-300 text-indigo-900" />
                  <span className="font-medium text-slate-900 dark:text-slate-50">{group.module}</span>
                </label>
                <div className="mt-3 ml-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.permissions.map(perm => (
                    <label key={perm.id} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <input type="checkbox" checked={assignedPerms.has(perm.id)} onChange={() => togglePerm(perm.id)} className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-900" />{perm.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={savePermissions} className="rounded-lg bg-indigo-900 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-800">{t('permissions.save')}</button>
          </div>
        )}
      </div>
      {toast && <div className="fixed bottom-6 right-6 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg">{toast}</div>}
    </AuthGuard>
  )
}
