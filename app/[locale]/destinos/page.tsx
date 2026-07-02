export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import DestinationGrid from '@/components/DestinationGrid'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import type { User } from '@supabase/supabase-js'

export default async function DestinosPage() {
  const locale = await getLocale()
  const t = await getTranslations('destinations')

  let user: User | null = null
  try {
    const supabase = await createSupabaseServer()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    redirect(`/${locale}/login`)
  }

  if (!user) redirect(`/${locale}/login`)

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 py-10 px-4">
      <div className="max-w-5xl mx-auto mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-teal-700">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>
        <LanguageSwitcher />
      </div>
      <DestinationGrid userId={user.id} />
    </main>
  )
}
