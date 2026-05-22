'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { setAuth } from '@/lib/auth'
import { LanguageToggle } from '@/components/LanguageToggle'
import { GuestGuard } from '@/components/AuthGuard'

export default function OtpLoginPage() {
  const { t, locale } = useI18n()
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const u = sessionStorage.getItem('otp_login_username')
    if (!u) router.replace('/login')
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    const username = sessionStorage.getItem('otp_login_username')
    const password = sessionStorage.getItem('otp_login_password')
    if (!username || !password) { router.replace('/login'); return }
    if (!code.trim()) { setError(locale === 'zh-CN' ? '请输入验证码' : 'Enter code'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/login/otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, otpCode: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || (locale === 'zh-CN' ? '验证失败' : 'Verification failed')); return }
      sessionStorage.removeItem('otp_login_username')
      sessionStorage.removeItem('otp_login_password')
      setAuth(data.accessToken, data.refreshToken, data.username)
      router.replace('/dashboard')
    } catch { setError(locale === 'zh-CN' ? '请求失败' : 'Request failed') }
    finally { setLoading(false) }
  }

  return (
    <GuestGuard>
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="absolute top-4 right-4"><LanguageToggle /></div>
        <div className="w-full max-w-sm">
          <div className="rounded-xl bg-white p-8 shadow-lg dark:bg-slate-900">
            <h1 className="text-center text-xl font-bold text-slate-900 dark:text-slate-50">
              {locale === 'zh-CN' ? '两步验证' : 'Two-Factor Auth'}
            </h1>
            <p className="mt-2 text-center text-sm text-slate-500">
              {locale === 'zh-CN' ? '请输入 Google Authenticator 中的验证码' : 'Enter code from Google Authenticator'}
            </p>
            {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input value={code} onChange={e => setCode(e.target.value)} placeholder="000000" maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" autoFocus />
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {loading ? '...' : (locale === 'zh-CN' ? '验证' : 'Verify')}
              </button>
              <button type="button" onClick={() => { sessionStorage.clear(); router.replace('/login') }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700">
                {locale === 'zh-CN' ? '返回登录' : 'Back to login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </GuestGuard>
  )
}
