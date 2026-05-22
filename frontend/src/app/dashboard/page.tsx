'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n'
import { clearAuth, getUser } from '@/lib/auth'
import { AuthGuard } from '@/components/AuthGuard'
import { LanguageToggle } from '@/components/LanguageToggle'

const navItems = [
  { key: 'home', labelZh: '首页', labelEn: 'Home', icon: HomeIcon },
  { key: 'orders', labelZh: '订单管理', labelEn: 'Orders', icon: OrderIcon },
  { key: 'inventory', labelZh: '库存管理', labelEn: 'Inventory', icon: InventoryIcon },
  { key: 'reports', labelZh: '数据报表', labelEn: 'Reports', icon: ReportIcon },
]

function Sidebar({
  active,
  setActive,
  collapsed,
}: {
  active: string
  setActive: (k: string) => void
  collapsed: boolean
}) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const username = getUser() || 'User'

  function handleLogout() {
    clearAuth()
    router.replace('/login')
  }

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo area */}
      <div className="flex h-14 items-center border-b border-slate-200 px-4 dark:border-slate-800">
        <span className="h-3 w-3 rounded-full bg-blue-600" />
        {!collapsed && (
          <span className="ml-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
            simple-oms
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active === item.key
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? (locale === 'zh-CN' ? item.labelZh : item.labelEn) : undefined}
          >
            <item.icon />
            {!collapsed && <span>{locale === 'zh-CN' ? item.labelZh : item.labelEn}</span>}
          </button>
        ))}
      </nav>

      {/* User + Footer */}
      <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
        <LanguageToggle />
        {!collapsed && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="truncate">{username}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? t('dashboard.logout') : undefined}
        >
          <LogoutIcon />
          {!collapsed && <span>{t('dashboard.logout')}</span>}
        </button>
      </div>
    </aside>
  )
}

function DashboardContent() {
  const { t, locale } = useI18n()
  const username = getUser() || 'User'
  const [active, setActive] = useState('home')
  const [collapsed, setCollapsed] = useState(false)

  const activeItem = navItems.find((n) => n.key === active)
  const pageTitle = activeItem ? (locale === 'zh-CN' ? activeItem.labelZh : activeItem.labelEn) : ''

  return (
    <div className="flex h-screen">
      <Sidebar active={active} setActive={setActive} collapsed={collapsed} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-sm font-medium text-slate-700 dark:text-slate-300">{pageTitle}</h1>
        </header>

        {/* Main workspace */}
        <main className="flex-1 overflow-auto bg-slate-50 p-6 dark:bg-slate-950">
          <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-200">
              {t('dashboard.welcome', { username })}
            </h2>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {t('dashboard.empty')}
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

// --- Icons ---
function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function OrderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function InventoryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
