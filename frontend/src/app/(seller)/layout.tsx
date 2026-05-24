'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { getRoles } from '@/lib/auth'
import { SellerSidebar } from '@/components/SellerSidebar'
import { useI18n } from '@/lib/i18n'
import { logout, getUser } from '@/lib/auth'

function SellerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  useEffect(() => {
    const roles = getRoles()
    if (!roles.includes('seller') && !roles.includes('admin')) router.replace('/')
  }, [router])
  return <>{children}</>
}

function SellerTopBar() {
  const { locale } = useI18n()
  const router = useRouter()
  const username = typeof window !== 'undefined' ? getUser() : ''

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <a href="/" className="text-sm text-slate-500 hover:text-slate-700">&larr; Shop</a>
        <span className="font-serif text-sm font-semibold text-emerald-900 dark:text-emerald-300">
          {locale === 'zh-CN' ? '卖家中心' : 'Seller Center'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">{username}</span>
        <button onClick={() => { logout(); router.replace('/login') }}
          className="text-xs text-slate-400 hover:text-red-500">
          {locale === 'zh-CN' ? '退出' : 'Sign Out'}
        </button>
      </div>
    </header>
  )
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SellerGuard>
        <div className="flex h-screen flex-col">
          <SellerTopBar />
          <div className="flex flex-1 overflow-hidden">
            <SellerSidebar />
            <main className="flex-1 overflow-auto bg-slate-50 p-6 dark:bg-slate-950">{children}</main>
          </div>
        </div>
      </SellerGuard>
    </AuthGuard>
  )
}
