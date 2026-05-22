'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { getToken } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'

export default function OtpSetupPage() {
  const { locale } = useI18n()
  const [secret, setSecret] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [otpEnabled, setOtpEnabled] = useState(false)
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const token = getToken(); const h = { Authorization: `Bearer ${token}` }
    const [meRes, codesRes] = await Promise.all([
      fetch('/api/v1/auth/user/me', { headers: h }),
      fetch('/api/v1/auth/otp/recovery-codes', { headers: h }),
    ])
    if (meRes.ok) {
      const me = await meRes.json()
      setOtpEnabled(me.totpEnabled)
      if (me.totpEnabled) {
        if (codesRes.ok) { const c = await codesRes.json(); setRecoveryCodes(c.codes) }
        setLoading(false); return
      }
    }
    const setupRes = await fetch('/api/v1/auth/otp/setup', { headers: h })
    if (setupRes.ok) { const d = await setupRes.json(); setSecret(d.secret); setQrUrl(d.qrUrl) }
    setLoading(false)
  }

  async function verify() {
    setError(''); setMsg('')
    if (!code) { setError(l('请输入验证码', 'Enter code')); return }
    const token = getToken()
    const res = await fetch('/api/v1/auth/otp/verify', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ code, secret }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.message); return }
    setOtpEnabled(true)
    setRecoveryCodes(data.recoveryCodes || [])
    setMsg(l('OTP 已启用', 'OTP enabled'))
  }

  async function regenerate() {
    const token = getToken()
    const res = await fetch('/api/v1/auth/otp/regenerate-codes', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) { const d = await res.json(); setRecoveryCodes(d.codes) }
  }

  const l = (zh: string, en: string) => locale === 'zh-CN' ? zh : en

  if (loading) return <AuthGuard><div className="flex justify-center p-12"><div className="animate-spin h-6 w-6 border-2 border-indigo-900 border-t-transparent rounded-full" /></div></AuthGuard>

  return (
    <AuthGuard>
      <div className="max-w-2xl">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">{l('两步验证 (OTP)', 'Two-Factor Auth')}</h2>

          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
          {msg && <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{msg}</div>}

          {otpEnabled ? (
            <div className="mt-4">
              <p className="text-sm text-emerald-600 font-medium">{l('✅ 两步验证已启用', '✅ 2FA is enabled')}</p>
              {recoveryCodes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{l('备用恢复码', 'Recovery Codes')}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {recoveryCodes.map((c, i) => <code key={i} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{c}</code>)}
                  </div>
                  <button onClick={regenerate} className="mt-3 text-xs text-indigo-600 hover:text-indigo-800">{l('重新生成', 'Regenerate')}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">{l('1. 用 Google Authenticator 扫描以下二维码', '1. Scan QR code with Google Authenticator')}</p>
                {qrUrl && (
                  <div className="mt-2 rounded-lg bg-white p-3 inline-block border">
                    <img src={`https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(qrUrl)}&choe=UTF-8`} alt="QR" width={180} height={180}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <p className="mt-2 text-xs text-slate-400">{l('如二维码不显示，请手动输入密钥', 'If QR not shown, enter secret manually')}</p>
                  </div>
                )}
                <p className="mt-2 text-xs text-slate-500">{l('或手动输入密钥：', 'Or enter secret:')} <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{secret}</code></p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{l('2. 输入验证码', '2. Enter verification code')}</label>
                <div className="flex gap-2">
                  <input value={code} onChange={e => setCode(e.target.value)} placeholder="123456" maxLength={6} className="w-32 rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
                  <button onClick={verify} className="rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white">{l('验证并启用', 'Verify & Enable')}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
