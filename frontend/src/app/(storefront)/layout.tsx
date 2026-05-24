import Link from 'next/link'
import { StorefrontNav } from './StorefrontNav'

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <StorefrontNav />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  )
}
