'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getUser } from '@/lib/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated()) {
      router.replace('/login')
    }
  }, [mounted, router])

  if (!mounted || !isAuthenticated()) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-indigo-900 border-t-transparent rounded-full" /></div>
  }

  return <>{children}</>
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && isAuthenticated()) {
      router.replace('/dashboard')
    }
  }, [mounted, router])

  if (!mounted || isAuthenticated()) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-indigo-900 border-t-transparent rounded-full" /></div>
  }

  return <>{children}</>
}

export function useCurrentUser() {
  return getUser()
}
