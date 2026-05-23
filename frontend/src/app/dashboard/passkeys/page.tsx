'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { getToken } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'
import { startRegistration } from '@simplewebauthn/browser'

interface CredData { id: number; deviceName: string; lastUsedAt: string; createdAt: string }

export default function PasskeysPage() {
  const { locale } = useI18n()
  const [creds, setCreds] = useState<CredData[]>([])
  const [loading, setLoading] = useState(true)
  const [deviceName, setDeviceName] = useState('')
  const [registering, setRegistering] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const res = await fetch('/api/v1/auth/webauthn/credentials', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.ok) setCreds(await res.json())
    setLoading(false)
  }

  async function register() {
    setError(''); setMsg(''); setRegistering(true)
    try {
      const token = getToken()
      // Step 1: get options
      const startRes = await fetch('/api/v1/auth/webauthn/register/start', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      })
      const options = await startRes.json()

      // Step 2: browser creates credential
      const credential = await startRegistration(options)

      // Step 3: send back
      const finishRes = await fetch('/api/v1/auth/webauthn/register/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ credential, deviceName: deviceName || 'Default Device' }),
      })
      const data = await finishRes.json()
      if (!finishRes.ok) { setError(data.message); return }
      setDeviceName('')
      setMsg(locale === 'zh-CN' ? '通行密钥已注册' : 'Passkey registered')
      setTimeout(() => setMsg(''), 2000)
      load()
    } catch (e: any) {
      setError(e.message || 'Registration failed')
    } finally { setRegistering(false) }
  }

  async function remove(id: number) {
    await fetch(`/api/v1/auth/webauthn/credentials/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
    })
    load()
  }

  const l = (zh: string, en: string) => locale === 'zh-CN' ? zh : en

  return (
    <AuthGuard>
      <div className="max-w-2xl">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">
            {l('通行密钥 (Passkey)', 'Passkeys')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {l('使用指纹、面部或 PIN 码快速登录', 'Sign in with fingerprint, face, or PIN')}
          </p>

          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}
          {msg && <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{msg}</div>}

          {/* Register new */}
          <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <input value={deviceName} onChange={e => setDeviceName(e.target.value)}
              placeholder={l('设备名称 (如: 我的 MacBook)', 'Device name (e.g. My MacBook)')}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
            <button onClick={register} disabled={registering}
              className="mt-3 rounded-lg bg-indigo-900 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800 disabled:opacity-60">
              {registering ? '...' : l('注册新设备', 'Register New Device')}
            </button>
          </div>

          {/* Credential list */}
          {!loading && creds.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{l('已注册设备', 'Registered Devices')}</h3>
              <div className="mt-2 space-y-2">
                {creds.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{c.deviceName}</div>
                      <div className="text-xs text-slate-500">
                        {l('创建: ', 'Created: ')}{new Date(c.createdAt).toLocaleDateString()}
                        {c.lastUsedAt && ` · ${l('上次使用: ', 'Last used: ')}${new Date(c.lastUsedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button onClick={() => remove(c.id)}
                      className="text-xs text-red-600 hover:text-red-800">{l('删除', 'Remove')}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
