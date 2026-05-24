'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { getRoles } from '@/lib/auth'

function SellerGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const roles = getRoles()
    if (!roles.includes('seller') && !roles.includes('admin')) {
      router.replace('/')
    }
  }, [router])

  return <>{children}</>
}

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SellerGuard>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur dark:bg-slate-900/95 dark:border-slate-800">
            <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
              <a href="/" className="font-serif text-lg font-bold text-indigo-950 dark:text-indigo-100">simple-oms</a>
              <div className="flex-1" />
              <a href="/seller" className="text-sm font-medium text-indigo-600">Dashboard</a>
              <a href="/seller/orders" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400">Orders</a>
            </div>
          </nav>
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </div>
      </SellerGuard>
    </AuthGuard>
  )
}
