import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import ProfileForm from '@/components/profile/ProfileForm'
import { Profile } from '@/types/profile'

export default async function PerfilPage() {
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
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-teal-700">Mi perfil de viajero</h1>
        <p className="text-gray-500 mt-1">
          Tu información nos ayuda a recomendarte destinos y servicios 100% accesibles para ti.
        </p>
      </div>
      <ProfileForm profile={safeProfile} />
    </main>
  )
}
