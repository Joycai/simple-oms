'use client'

import { useEffect, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { getToken, apiFetch } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'
import { startRegistration } from '@simplewebauthn/browser'

interface CredData { id: number; deviceName: string; lastUsedAt: string; createdAt: string }

export default function PasskeysPage() {
  const { t } = useI18n()
  const [creds, setCreds] = useState<CredData[]>([])
  const [loading, setLoading] = useState(true)
  const [deviceName, setDeviceName] = useState('')
  const [registering, setRegistering] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    const res = await apiFetch('/auth/webauthn/credentials', {
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
      const startRes = await apiFetch('/auth/webauthn/register/start', {    
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      })
      const options = await startRes.json()

      // Step 2: browser creates credential
      const credential = await startRegistration(options)

      // Step 3: send back
      const finishRes = await apiFetch('/auth/webauthn/register/finish', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ credential, deviceName: deviceName || 'Default Device' }),
      })
      const data = await finishRes.json()
      if (!finishRes.ok) { setError(data.message || t('passkeys.error')); return }
      setDeviceName('')
      setMsg(t('passkeys.success'))      
      setTimeout(() => setMsg(''), 2000)
      load()
    } catch (e: any) {
      setError(e.message || t('passkeys.error'))
    } finally { setRegistering(false) }
  }

  async function remove(id: number) {
    await apiFetch(`/auth/webauthn/credentials/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },     
    })
    load()
  }

  return (
    <AuthGuard>
      <div className="max-w-2xl">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">   
          <h2 className="font-serif text-lg font-semibold text-slate-900 dark:text-slate-50">
            {t('passkeys.title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">       
            {t('passkeys.subtitle')}
          </p>

          {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">{error}</div>}
          {msg && <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">{msg}</div>}

          {/* Register new */}
          <div className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <input value={deviceName} onChange={e => setDeviceName(e.target.value)}
              placeholder={t('passkeys.deviceNamePlaceholder')}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50" />
            <button onClick={register} disabled={registering}
              className="mt-3 rounded-lg bg-indigo-950 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-900 disabled:opacity-60">
              {registering ? '...' : t('passkeys.registerButton')}    
            </button>
          </div>

          {/* Credential list */}
          {!loading && creds.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('passkeys.registeredDevices')}</h3>
              <div className="mt-4 space-y-3">
                {creds.map(c => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-50">{c.deviceName}</div>
                      <div className="text-xs text-slate-500">
                        {t('passkeys.created')}{new Date(c.createdAt).toLocaleDateString()}
                        {c.lastUsedAt && ` · ${t('passkeys.lastUsed')}${new Date(c.lastUsedAt).toLocaleDateString()}`}
                      </div>
                    </div>
                    <button onClick={() => remove(c.id)}
                      className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">{t('passkeys.remove')}</button>
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