import { redirect } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Link } from '@/i18n/navigation'
import { Profile } from '@/types/profile'

export const dynamic = 'force-dynamic'

const DISABILITY_ICONS: Record<string, string> = {
  motriz: '♿',
  visual: '👁️',
  auditiva: '🦻',
  autismo: '🧩',
  cognitiva: '🧠',
  cronica_invisible: '🫀',
  mixta: '👨‍👩‍👧',
}

function GreetingSection({ name }: { name: string }) {
  const t = useTranslations('dashboard')
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1B6FB5]">
        {name ? t('greeting', { name }) : t('greetingFallback')}
      </h1>
    </div>
  )
}

function ProfileSummaryCard({ profile }: { profile: Profile }) {
  const t = useTranslations('dashboard')
  const tDis = useTranslations('disabilities')
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('profileSummary')}</h2>
      {profile.disability_types.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {profile.disability_types.map(type => (
            <span
              key={type}
              className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full text-sm font-medium"
            >
              <span>{DISABILITY_ICONS[type]}</span>
              <span>{tDis(type as Parameters<typeof tDis>[0])}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">{t('noProfile')}</p>
      )}
      <Link
        href="/perfil"
        className="inline-block mt-4 text-sm text-teal-600 hover:underline font-medium"
      >
        {t('editProfile')} →
      </Link>
    </div>
  )
}

function QuickAccessCards() {
  const t = useTranslations('dashboard')

  const cards = [
    {
      href: '/planificador',
      icon: '✈️',
      title: t('cardPlanner'),
      desc: t('cardPlannerDesc'),
      bg: 'bg-[#1B6FB5]',
    },
    {
      href: '/destinos',
      icon: '🗺️',
      title: t('cardDestinations'),
      desc: t('cardDestinationsDesc'),
      bg: 'bg-[#0D9488]',
    },
    {
      href: '/tarjeta-medica',
      icon: '🏥',
      title: t('cardMedical'),
      desc: t('cardMedicalDesc'),
      bg: 'bg-[#F97316]',
    },
    {
      href: '/tarjeta-comunicacion',
      icon: '💬',
      title: t('cardCommunication'),
      desc: t('cardCommunicationDesc'),
      bg: 'bg-purple-600',
    },
    {
      href: '/documentos-viaje',
      icon: '📄',
      title: t('cardDocuments'),
      desc: t('cardDocumentsDesc'),
      bg: 'bg-indigo-600',
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('quickAccess')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {cards.map(card => (
          <Link
            key={card.href}
            href={card.href as '/planificador'}
            className={`${card.bg} text-white rounded-2xl p-5 flex flex-col gap-2 hover:opacity-90 transition shadow`}
          >
            <span className="text-3xl">{card.icon}</span>
            <span className="font-semibold text-sm leading-tight">{card.title}</span>
            <span className="text-xs opacity-80 leading-tight">{card.desc}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AlliTipCard() {
  const t = useTranslations('dashboard')
  const tips = [
    t('tip0'), t('tip1'), t('tip2'), t('tip3'),
    t('tip4'), t('tip5'), t('tip6'),
  ]
  const tip = tips[new Date().getDay()]
  return (
    <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-[#F97316]">
      <h2 className="text-sm font-semibold text-[#F97316] uppercase tracking-wide mb-3">
        {t('alliTip')}
      </h2>
      <p className="text-gray-700 leading-relaxed">{tip}</p>
    </div>
  )
}

export default async function DashboardPage() {
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
      <div className="max-w-3xl mx-auto space-y-8">
        <GreetingSection name={safeProfile.full_name ?? ''} />
        <ProfileSummaryCard profile={safeProfile} />
        <QuickAccessCards />
        <AlliTipCard />
      </div>
    </main>
  )
}
