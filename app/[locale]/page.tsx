import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function HomePage() {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100 p-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-4xl font-bold text-teal-700 mb-4">{t('title')}</h1>
      <p className="text-lg text-gray-600 text-center max-w-md mb-8">{t('subtitle')}</p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {tNav('login')}
        </Link>
        <Link
          href="/register"
          className="border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold px-6 py-3 rounded-xl transition"
        >
          {tNav('register')}
        </Link>
      </div>
    </main>
  )
}
