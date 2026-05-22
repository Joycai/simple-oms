'use client'

import { useI18n } from '@/lib/i18n'
import { Button } from '@/components/ui/button'

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n()
  const nextLocale = locale === 'zh-CN' ? 'en-US' : 'zh-CN'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLocale(nextLocale)}
      className="text-xs"
    >
      {t('language.switch')}
    </Button>
  )
}
