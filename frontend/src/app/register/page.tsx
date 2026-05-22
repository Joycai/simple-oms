'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
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

export default function RegisterPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim()) { setError(t('register.usernameRequired')); return }
    if (!password.trim()) { setError(t('register.passwordRequired')); return }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
          email: email.trim() || null,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || t('register.registerFailed'))
        return
      }

      setSuccess(t('register.registerSuccess'))
      setTimeout(() => router.replace('/login'), 1500)
    } catch {
      setError(t('register.registerError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <GuestGuard>
      <div className="flex min-h-screen">
        {/* Left — Brand Panel (same as login) */}
        <div className="relative hidden w-5/12 flex-col justify-center overflow-hidden bg-indigo-950 lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950" />
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
              {t('register.title')}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-indigo-200/80 xl:text-lg">
              {t('register.subtitle')}
            </p>
          </div>
        </div>

        {/* Right — Register Form */}
        <div className="flex flex-1 items-center justify-center bg-white px-6 dark:bg-slate-950 lg:px-12">
          <div className="absolute top-4 right-4">
            <LanguageToggle />
          </div>
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center lg:hidden">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                {t('register.title')}
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {t('register.subtitle')}
              </p>
            </div>

            <p className="mb-8 hidden text-sm font-medium text-slate-500 dark:text-slate-400 lg:block">
              {t('register.subtitle')}
            </p>

            {error && (
              <div className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-600 dark:bg-green-950/50 dark:text-green-400">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('register.username')}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('register.usernamePlaceholder')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  autoComplete="username"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('register.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('register.emailPlaceholder')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('register.password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('register.passwordPlaceholder')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    tabIndex={-1}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('register.registering')}
                  </span>
                ) : (
                  t('register.registerButton')
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              <Link href="/login" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                {t('register.loginLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </GuestGuard>
  )
}
