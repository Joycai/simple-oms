'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { setAuth, apiFetch } from '@/lib/auth'
import { startAuthentication } from '@simplewebauthn/browser'
import { LanguageToggle } from '@/components/LanguageToggle'
import { GuestGuard } from '@/components/AuthGuard'

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export default function LoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    const msg = sessionStorage.getItem('login_message')
    if (msg) { setInfo(msg); sessionStorage.removeItem('login_message') }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError(t('login.usernameRequired'))
      return
    }
    if (!password.trim()) {
      setError(t('login.passwordRequired'))
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || t('login.loginFailed'))
        return
      }

      const data = await res.json()
      // 2FA required
      if (data.requiresOtp) {
        sessionStorage.setItem('otp_login_username', username.trim())
        sessionStorage.setItem('otp_login_password', password)
        router.replace('/login/otp')
        return
      }
      // Passkey required
      if (data.requiresPasskey) {
        try {
          const credential = await startAuthentication(data)
          const finishRes = await fetch('/api/v1/auth/webauthn/login/finish', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential, username: username.trim() }),
          })
          const fData = await finishRes.json()
          if (!finishRes.ok) { setError(fData.message || t('login.loginFailed')); return }
          setAuth(fData.accessToken, fData.refreshToken, fData.username)
          const redirect = sessionStorage.getItem('login_redirect')
          if (redirect) { sessionStorage.removeItem('login_redirect'); router.replace(redirect) }
          else router.replace('/dashboard')
        } catch (e: any) {
          setError(e.message || t('login.loginError'))
        } finally { setLoading(false) }
        return
      }
      setAuth(data.accessToken, data.refreshToken, data.username)
      const redirect = sessionStorage.getItem('login_redirect')
      if (redirect) { sessionStorage.removeItem('login_redirect'); router.replace(redirect) }
      else router.replace('/dashboard')
    } catch {
      setError(t('login.loginError'))
    } finally {
      setLoading(false)
    }
  }

  function handleForgotPassword() {
    alert(t('login.forgotPasswordHint'))
  }

  return (
    <GuestGuard>
      <div className="flex min-h-screen">
        {/* Left — Brand Panel */}
        <div className="relative hidden w-5/12 flex-col justify-center overflow-hidden bg-indigo-950 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950" />
          {/* decorative grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          <div className="relative z-10 px-12 xl:px-20">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              simple-oms
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white xl:text-4xl">
              {t('login.title')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-indigo-200/80 xl:text-lg">
              {t('login.subtitle')}
            </p>
            <div className="mt-10 space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-center gap-3 text-sm text-indigo-200/70">
                  <svg className="h-4 w-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t(`hero.feature${n}`)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="flex flex-1 items-center justify-center bg-white px-6 dark:bg-slate-950 lg:px-12">
          <div className="absolute top-4 right-4">
            <LanguageToggle />
          </div>
          <div className="w-full max-w-sm">
            {/* Mobile-only title */}
            <div className="mb-8 text-center lg:hidden">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {t('login.title')}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t('login.subtitle')}
              </p>
            </div>

            {/* Desktop label */}
            <p className="mb-8 hidden text-sm font-medium text-slate-500 dark:text-slate-400 lg:block">
              {t('login.subtitle')}
            </p>

            {info && (
              <div className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                {info}
              </div>
            )}
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('login.username')}
                </label>
                <input id="username" type="text" value={username}
                  onChange={(e) => setUsername(e.target.value)} placeholder={t('login.usernamePlaceholder')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  autoComplete="username" />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('login.password')}</label>
                <div className="relative">
                  <input id="password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder={t('login.passwordPlaceholder')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">{t('login.forgotPassword')}</button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600">
                {loading ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t('login.loggingIn')}</span>) : t('login.loginButton')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </GuestGuard>
  )
}

