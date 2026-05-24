'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n'

const items = [
  { href: '/seller', labelZh: '商品管理', labelEn: 'Items', icon: PackageIcon, exact: true },
  { href: '/seller/orders', labelZh: '订单管理', labelEn: 'Orders', icon: ClipboardIcon },
  { href: '/seller/categories', labelZh: '品类管理', labelEn: 'Categories', icon: FolderIcon },
]

export function SellerSidebar() {
  const { locale } = useI18n()
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-12 items-center gap-2 px-4 border-b border-slate-100 dark:border-slate-800">
        <span className="h-2 w-2 rounded-full bg-emerald-600" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {locale === 'zh-CN' ? '卖家中心' : 'Seller Center'}
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {items.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              isActive(item.href, item.exact)
                ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
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

function PackageIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
}
function FolderIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
}
function ClipboardIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M9 14l2 2 4-4" /></svg>
}
