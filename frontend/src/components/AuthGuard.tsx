'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, getUser, getDefaultRedirect } from '@/lib/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.replace('/login')
    }
  }, [router])

  // Prevent rendering anything during SSR or before client mount to avoid hydration mismatch
  if (!mounted || !isAuthenticated()) {
    return null
  }

  return <>{children}</>
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated()) {
      router.replace(getDefaultRedirect())
    }
  }, [router])

  if (!mounted || isAuthenticated()) {
    return null
  }

  return <>{children}</>
}

export function useCurrentUser() {
  return getUser()
}