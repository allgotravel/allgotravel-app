import { redirect } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createSupabaseServer } from '@/lib/supabase-server'
import TripPlannerForm from '@/components/TripPlannerForm'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import type { Profile } from '@/types/profile'

function PlannerHeader() {
  const t = useTranslations('planner')
  return (
    <div className="max-w-2xl mx-auto mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-teal-700">{t('title')}</h1>
        <p className="text-gray-500 mt-1">{t('subtitle')}</p>
      </div>
      <LanguageSwitcher />
    </div>
  )
}

export default async function PlanificadorPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const safeProfile: Profile = {
    id: user.id,
    email: user.email ?? '',
    full_name: profile?.full_name ?? '',
    avatar_url: profile?.avatar_url ?? null,
    disability_types: profile?.disability_types ?? [],
    chronic_conditions: profile?.chronic_conditions ?? null,
    invisible_needs: profile?.invisible_needs ?? null,
    medications: profile?.medications ?? [],
    timezone: profile?.timezone ?? 'America/Mexico_City',
    is_group_profile: profile?.is_group_profile ?? false,
    group_members: profile?.group_members ?? [],
    preferred_language: profile?.preferred_language ?? 'es',
    created_at: profile?.created_at ?? new Date().toISOString(),
    updated_at: profile?.updated_at ?? new Date().toISOString(),
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-100 py-10 px-4">
      <PlannerHeader />
      <TripPlannerForm profile={safeProfile} userId={user.id} />
    </main>
  )
}
