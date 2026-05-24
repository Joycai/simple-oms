import { AuthGuard } from '@/components/AuthGuard'
import { UnifiedNav } from '@/components/UnifiedNav'

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <UnifiedNav />
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  )
}