'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

type Locale = 'zh-CN' | 'en-US'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | null>(null)

const messagesMap: Record<Locale, Record<string, Record<string, string>>> = {
  'zh-CN': {},
  'en-US': {},
}

async function loadMessages(locale: Locale) {
  if (Object.keys(messagesMap[locale]).length === 0) {
    const msgs = await import(`../../messages/${locale}.json`)
    messagesMap[locale] = msgs.default ?? msgs
  }
  return messagesMap[locale]
}

export function I18nProvider({ children, initialLocale = 'zh-CN' }: { children: ReactNode; initialLocale?: Locale }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Record<string, Record<string, string>>>(messagesMap[initialLocale])
  const [mounted, setMounted] = useState(false)

  // Sync locale from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    const resolved = saved && (saved === 'zh-CN' || saved === 'en-US') ? saved : initialLocale
    setLocaleState(resolved)
    loadMessages(resolved).then(setMessages).finally(() => setMounted(true))
  }, [initialLocale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
    loadMessages(newLocale).then(setMessages)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const keys = key.split('.')
      let value: unknown = messages
      for (const k of keys) {
        if (value == null) break
        value = (value as Record<string, unknown>)[k]
      }
      let result = (value as string) ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          result = result.replace(`{${k}}`, v)
        }
      }
      return result
    },
    [messages, locale]
  )

  // Suppress hydration warnings by using client-only render while messages load
  if (!mounted) {
    return <I18nContext.Provider value={{ locale: initialLocale, setLocale: () => {}, t: (k: string) => k }}>{children}</I18nContext.Provider>
  }

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
