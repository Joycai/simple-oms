'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { getToken, apiFetch, clearAuth, getUser } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'

export default function SettingsPage() {
  const { locale } = useI18n()
  const router = useRouter()
  const [oldPw, setOldPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function changePassword(e: FormEvent) {
    e.preventDefault(); setError(''); setMsg('')
    if (!oldPw || !newPw) { setError(locale === 'zh-CN' ? '请填写所有字段' : 'Fill all fields'); return }
    if (newPw !== confirmPw) { setError(locale === 'zh-CN' ? '两次密码不一致' : 'Passwords do not match'); return }
    if (newPw.length < 6) { setError(locale === 'zh-CN' ? '新密码至少6位' : 'Min 6 characters'); return }
    setLoading(true)
    try {
      const token = getToken()
      const res = await apiFetch('/auth/change-password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message); return }
      setMsg(data.message)
      setTimeout(() => { clearAuth(); router.replace('/login') }, 1500)
    } catch { setError(locale === 'zh-CN' ? '操作失败' : 'Failed') }
    finally { setLoading(false) }
  }

  const l = (zh: string, en: string) => locale === 'zh-CN' ? zh : en

  return (
    <AuthGuard>
      <div className="max-w-md">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">{l('修改密码', 'Change Password')}</h2>
          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
          {msg && <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{msg}</div>}
          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <div><label className="block text-sm font-medium mb-1">{l('旧密码', 'Old Password')}</label>
              <input type="password" value={oldPw} onChange={e => setOldPw(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
            <div><label className="block text-sm font-medium mb-1">{l('新密码', 'New Password')}</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
            <div><label className="block text-sm font-medium mb-1">{l('确认新密码', 'Confirm Password')}</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" /></div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-indigo-900 py-2 text-sm font-medium text-white">{loading ? '...' : l('修改密码', 'Change Password')}</button>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}
