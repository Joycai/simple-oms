'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { logout, getUser } from '@/lib/auth'
import { LanguageToggle } from './LanguageToggle'

export function AdminTopBar() {
  const { locale } = useI18n()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUsername(getUser() || '')
    setMounted(true)
  }, [])

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 rounded-full bg-indigo-600" />
        <span className="text-sm font-semibold text-indigo-950 dark:text-indigo-100">IAM Admin</span>
      </div>
      <div className="flex items-center gap-4">
        <LanguageToggle />
        {mounted && <span className="text-xs text-slate-500">{username}</span>}
        <button onClick={() => { logout(); router.replace('/login') }}
          className="text-xs text-slate-400 hover:text-red-500">
          {locale === 'zh-CN' ? '退出' : 'Sign Out'}
        </button>
      </div>
    </header>
  )
}
