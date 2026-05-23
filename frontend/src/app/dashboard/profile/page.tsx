'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { getToken, apiFetch } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'

export default function ProfilePage() {
  const { locale } = useI18n()
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const token = getToken()
    const res = await apiFetch('/api/v1/auth/user/me', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const d = await res.json()
      setNickname(d.nickname || '')
      setEmail(d.email || '')
      setPhone(d.phone || '')
    }
    setLoading(false)
  }

  async function save() {
    setError(''); setMsg('')
    setSaving(true)
    try {
      const token = getToken()
      const res = await apiFetch('/api/v1/auth/user/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nickname: nickname.trim() || null, email: email.trim() || null, phone: phone.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || '保存失败'); return }
      setMsg(locale === 'zh-CN' ? '已保存' : 'Saved')
      setTimeout(() => setMsg(''), 2000)
    } catch { setError('保存失败') }
    finally { setSaving(false) }
  }

  const l = (zh: string, en: string) => locale === 'zh-CN' ? zh : en

  if (loading) return <AuthGuard><div className="flex justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-indigo-900 border-t-transparent rounded-full" /></div></AuthGuard>

  return (
    <AuthGuard>
      <div className="max-w-md">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">{l('个人资料', 'Profile')}</h2>
          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
          {msg && <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{msg}</div>}
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{l('昵称', 'Nickname')}</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={50}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{l('邮箱', 'Email')}</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{l('手机号', 'Phone')}</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} maxLength={30}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
            </div>
            <button onClick={save} disabled={saving}
              className="w-full rounded-lg bg-indigo-900 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-60">
              {saving ? '...' : l('保存', 'Save')}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">{l('社交账号绑定', 'Social Accounts')}</h3>
            <div className="space-y-2">
              {[{icon: '💬', name: '微信', en: 'WeChat'}, {icon: '🐧', name: 'QQ', en: 'QQ'}, {icon: '🔷', name: '钉钉', en: 'DingTalk'}].map(s => (
                <div key={s.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2.5 dark:border-slate-800">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{s.icon} {locale === 'zh-CN' ? s.name : s.en}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 rounded px-2 py-0.5 dark:bg-slate-800">{l('即将上线', 'Coming soon')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
