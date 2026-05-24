'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { getRoles } from '@/lib/auth'
import { UnifiedNav } from '@/components/UnifiedNav'

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
          <UnifiedNav />
          <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </div>
      </SellerGuard>
    </AuthGuard>
  )
}