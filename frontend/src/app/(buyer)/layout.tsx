'use client'

import { AuthGuard } from '@/components/AuthGuard'
import { BuyerSidebar } from '@/components/BuyerSidebar'
import { useI18n } from '@/lib/i18n'
import { logout, getUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

function BuyerTopBar() {
  const { locale } = useI18n()
  const router = useRouter()
  const username = typeof window !== 'undefined' ? getUser() : ''

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <a href="/" className="text-sm text-slate-500 hover:text-slate-700">&larr; Shop</a>
        <span className="font-serif text-sm font-semibold text-blue-900 dark:text-blue-300">
          {locale === 'zh-CN' ? '我的账户' : 'My Account'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <a href="/cart" className="text-sm text-slate-500 hover:text-slate-700">Cart</a>
        <span className="text-xs text-slate-500">{username}</span>
        <button onClick={() => { logout(); router.replace('/login') }}
          className="text-xs text-slate-400 hover:text-red-500">
          {locale === 'zh-CN' ? '退出' : 'Sign Out'}
        </button>
      </div>
    </header>
  )
}

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen flex-col">
        <BuyerTopBar />
        <div className="flex flex-1 overflow-hidden">
          <BuyerSidebar />
          <main className="flex-1 overflow-auto bg-slate-50 p-6 dark:bg-slate-950">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
