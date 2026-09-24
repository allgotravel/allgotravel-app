'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next })
  }

  return (
    <div className="flex gap-1 bg-white rounded-lg shadow p-1 text-sm font-medium">
      <button
        onClick={() => switchLocale('es')}
        className={`px-3 py-1 rounded-md transition ${
          locale === 'es' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-teal-600'
        }`}
      >
        ES
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={`px-3 py-1 rounded-md transition ${
          locale === 'en' ? 'bg-teal-600 text-white' : 'text-gray-500 hover:text-teal-600'
        }`}
      >
        EN
      </button>
    </div>
  )
}
