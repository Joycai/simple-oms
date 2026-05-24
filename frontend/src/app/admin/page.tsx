'use client'

import { useI18n } from '@/lib/i18n'
import { getUser } from '@/lib/auth'

export default function DashboardPage() {
  const { t } = useI18n()
  const username = getUser() || 'User'

  return (
    <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-slate-900">
      <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200">
        {t('dashboard.welcome', { username })}
      </h2>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {t('dashboard.empty')}
      </p>
    </div>
  )
}
