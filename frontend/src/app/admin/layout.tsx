'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { logout, getUser, hasRole } from '@/lib/auth'
import { LanguageToggle } from '@/components/LanguageToggle'
import { UnifiedNav } from '@/components/UnifiedNav'

const navGroups = [
  {
    labelKey: 'nav.overview',
    items: [
      { key: 'home', href: '/admin', labelZh: '首页', labelEn: 'Home', icon: HomeIcon },
    ],
  },
  {
    labelKey: 'nav.management',
    items: [
      { key: 'users', href: '/admin/users', labelZh: '用户管理', labelEn: 'Users', icon: UserIcon },
      { key: 'roles', href: '/admin/roles', labelZh: '角色管理', labelEn: 'Roles', icon: ShieldIcon },
      { key: 'permissions', href: '/admin/permissions', labelZh: '权限管理', labelEn: 'Permissions', icon: KeyIcon },
    ],
  },
  {
    labelKey: 'nav.personal',
    items: [
      { key: 'profile', href: '/admin/profile', labelZh: '个人资料', labelEn: 'Profile', icon: UserIcon },
      { key: 'settings', href: '/admin/settings', labelZh: '修改密码', labelEn: 'Password', icon: SettingsIcon },
      { key: 'otp', href: '/admin/otp', labelZh: '两步验证', labelEn: '2FA', icon: KeyIcon },
      { key: 'passkeys', href: '/admin/passkeys', labelZh: '通行密钥', labelEn: 'Passkeys', icon: PasskeyIcon },
    ],
  },
  {
    labelKey: 'nav.operations',
    items: [
      { key: 'orders', href: null, labelZh: '订单管理', labelEn: 'Orders', icon: OrderIcon },
      { key: 'inventory', href: null, labelZh: '库存管理', labelEn: 'Inventory', icon: InventoryIcon },
      { key: 'reports', href: null, labelZh: '数据报表', labelEn: 'Reports', icon: ReportIcon },
    ],
  },
]

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const { locale, t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [username, setUsername] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUsername(getUser() || 'User')
    setIsAdmin(hasRole('admin'))
  }, [])

  async function handleLogout() {
    await logout()
    router.replace('/login')
  }

  // Filter groups only after mount to prevent hydration mismatch
  const visibleGroups = mounted
    ? navGroups.filter(g => g.labelKey !== 'nav.management' || isAdmin)
    : navGroups

  return (
    <aside className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-14 items-center border-b border-slate-200 px-4 dark:border-slate-800">
        <span className="h-3 w-3 rounded-full bg-blue-600" />
        {!collapsed && <span className="ml-2.5 text-sm font-semibold text-slate-900 dark:text-slate-50">simple-oms</span>}
      </div>

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {visibleGroups.map((group, gi) => (
          <div key={group.labelKey}>
            {!collapsed && (
              <div className="px-3 pt-4 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {t(group.labelKey)}
              </div>
            )}
            {collapsed && gi > 0 && <div className="border-t border-slate-200 dark:border-slate-800 mx-2 my-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.href === pathname
                const inner = <><item.icon />{!collapsed && <span>{locale === 'zh-CN' ? item.labelZh : item.labelEn}</span>}</>
                const cls = `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-300'
                    : item.href ? 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900'
                    : 'text-slate-400 cursor-default'
                } ${collapsed ? 'justify-center' : ''}`
                
                if (!mounted && group.labelKey === 'nav.management') return null

                return item.href
                  ? <Link key={item.key} href={item.href} className={cls} title={collapsed ? (locale === 'zh-CN' ? item.labelZh : item.labelEn) : undefined}>{inner}</Link>
                  : <span key={item.key} className={cls} title={collapsed ? (locale === 'zh-CN' ? item.labelZh : item.labelEn) : undefined}>{inner}</span>      
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-800">
        <LanguageToggle />
        {!collapsed && mounted && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="h-6 w-6 rounded-full bg-slate-300 dark:bg-slate-700" />
            {username}
          </div>
        )}
        <button onClick={handleLogout}
          className={`mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? '退出' : undefined}>
          <LogoutIcon />{!collapsed && <span>{locale === 'zh-CN' ? '退出登录' : 'Sign Out'}</span>}
        </button>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { locale } = useI18n()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const admin = hasRole('admin')
    setIsAdmin(admin)
    
    const adminPaths = ['/admin/users', '/admin/roles', '/admin/permissions']
    if (adminPaths.some(p => pathname.startsWith(p)) && !admin) {    
      router.replace('/admin')
    }
  }, [pathname, router])

  const allItems = navGroups.flatMap(g => g.items as Array<{key: string; href: string | null; labelZh: string; labelEn: string; icon: () => React.JSX.Element}>)
  const activeItem = allItems.find((n) => n.href === pathname)
  const pageTitle = activeItem ? (locale === 'zh-CN' ? activeItem.labelZh : activeItem.labelEn) : ''

  const adminPaths = ['/admin/users', '/admin/roles', '/admin/permissions']
  const isCurrentAdminPath = adminPaths.some(p => pathname.startsWith(p))

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <UnifiedNav />
        <header className="flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
          <button onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">     
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-sm font-medium text-slate-700 dark:text-slate-300">{pageTitle}</h1>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 p-6 dark:bg-slate-950">
          {/* Prevent showing admin content before auth check is verified on client */}
          {isCurrentAdminPath && !isAdmin && mounted ? null : children}
        </main>
      </div>
    </div>
  )
}

// Icons
function HomeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
}
function UserIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
}
function ShieldIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
}
function SettingsIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
}

function PasskeyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16v-2a4 4 0 0 1 4-4h2" /><rect x="8" y="2" width="8" height="12" rx="4" /><path d="M18 16v.01" /><path d="M22 16v.01" /></svg>
}
function KeyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
}
function OrderIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
}
function InventoryIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
}
function ReportIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
}
function LogoutIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
}
