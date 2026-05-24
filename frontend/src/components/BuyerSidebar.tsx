'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const items = [
  { href: '/account', labelZh: '我的订单', labelEn: 'My Orders', icon: ClipboardIcon, exact: true },
  { href: '/account/orders', labelZh: '物流追踪', labelEn: 'Shipments', icon: TruckIcon },
]

export function BuyerSidebar() {
  const { locale } = useI18n()
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-12 items-center gap-2 px-4 border-b border-slate-100 dark:border-slate-800">
        <span className="h-2 w-2 rounded-full bg-blue-600" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {locale === 'zh-CN' ? '我的账户' : 'My Account'}
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {items.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(item.href, item.exact)
                ? 'bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-300'
                : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'
            }`}>
            <item.icon />
            <span>{locale === 'zh-CN' ? item.labelZh : item.labelEn}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-slate-100 px-4 py-3 text-[10px] text-slate-400 dark:border-slate-800">
        simple-oms v1.0
      </div>
    </aside>
  )
}

function ClipboardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 14l2 2 4-4" /></svg>
}
function TruckIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
}
