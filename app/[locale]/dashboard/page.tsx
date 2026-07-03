import { redirect } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Link } from '@/i18n/navigation'
import { Profile } from '@/types/profile'
import Image from 'next/image'

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

// ── Retention: profile completion score ──────────────────────────────────────
function computeCompletion(profile: Profile): { score: number; missing: string[] } {
  const checks = [
    { done: !!profile.full_name,                              label: 'Nombre' },
    { done: profile.disability_types.length > 0,             label: 'Necesidades de accesibilidad' },
    { done: !!profile.chronic_conditions,                     label: 'Condiciones crónicas' },
    { done: profile.medications.length > 0,                   label: 'Medicamentos' },
    { done: !!profile.invisible_needs,                        label: 'Necesidades invisibles' },
  ]
  const done = checks.filter(c => c.done).length
  const missing = checks.filter(c => !c.done).map(c => c.label)
  return { score: Math.round((done / checks.length) * 100), missing }
}

// ── Greeting ─────────────────────────────────────────────────────────────────
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

// ── Retention: Kit de Viaje + completion meter ────────────────────────────────
function KitDeViajeCard({ profile }: { profile: Profile }) {
  const { score, missing } = computeCompletion(profile)

  const items = [
    {
      icon: '♿',
      label: 'Perfil de accesibilidad',
      value: profile.disability_types.length > 0
        ? `${profile.disability_types.length} tipo${profile.disability_types.length > 1 ? 's' : ''} registrado${profile.disability_types.length > 1 ? 's' : ''}`
        : null,
      href: '/perfil',
    },
    {
      icon: '🏥',
      label: 'Tarjeta Médica',
      value: profile.medications.length > 0
        ? `${profile.medications.length} medicamento${profile.medications.length > 1 ? 's' : ''} guardado${profile.medications.length > 1 ? 's' : ''}`
        : profile.chronic_conditions ? 'Condiciones guardadas' : null,
      href: '/tarjeta-medica',
    },
    {
      icon: '💬',
      label: 'Tarjeta de Comunicación',
      value: profile.full_name ? 'Lista para usar' : null,
      href: '/tarjeta-comunicacion',
    },
    {
      icon: '📄',
      label: 'Documentos de viaje',
      value: 'Regulaciones de 22 países',
      href: '/documentos-viaje',
    },
  ]

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">🧳 Tu kit de viaje AllGo</h2>
        <span className="text-xs font-bold text-[#1B6FB5] bg-blue-50 px-2.5 py-1 rounded-full">
          {score}% completo
        </span>
      </div>

      {/* Completion bar */}
      <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
        <div
          className="h-2.5 rounded-full transition-all duration-700"
          style={{
            width: `${score}%`,
            background: score === 100
              ? '#0D9488'
              : score >= 60
              ? '#1B6FB5'
              : '#F97316',
          }}
        />
      </div>
      {score < 100 && missing.length > 0 && (
        <p className="text-xs text-gray-400 mb-4">
          Falta: {missing.slice(0, 2).join(', ')}{missing.length > 2 ? ` y ${missing.length - 2} más` : ''}
          {' · '}
          <Link href="/perfil" className="text-[#1B6FB5] font-semibold hover:underline">
            Completar →
          </Link>
        </p>
      )}
      {score === 100 && (
        <p className="text-xs text-teal-600 font-semibold mb-4">✅ Perfil 100% completo — tu kit está listo</p>
      )}

      {/* Items */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href as '/perfil'}
            className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#1B6FB5]/30 hover:bg-blue-50/50 transition group"
          >
            <span className="text-xl shrink-0">{item.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-700 group-hover:text-[#1B6FB5] transition leading-tight">
                {item.label}
              </p>
              {item.value ? (
                <p className="text-xs text-teal-600 font-medium mt-0.5">✅ {item.value}</p>
              ) : (
                <p className="text-xs text-orange-400 font-medium mt-0.5">⚠️ Pendiente — completar</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Quick Access Cards ────────────────────────────────────────────────────────
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

// ── Retention: Alli tip with CTA ──────────────────────────────────────────────
function AlliTipCard() {
  const t = useTranslations('dashboard')
  const tips = [
    t('tip0'), t('tip1'), t('tip2'), t('tip3'),
    t('tip4'), t('tip5'), t('tip6'),
  ]
  const tip = tips[new Date().getDay()]
  return (
    <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-[#F97316]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-[#F97316] uppercase tracking-wide">
          {t('alliTip')}
        </h2>
        <span className="text-xs text-gray-300">🌍 Alli</span>
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">{tip}</p>
      <Link
        href="/planificador"
        className="inline-flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm px-4 py-2.5 rounded-xl transition"
      >
        💬 Háblame de tu próximo viaje →
      </Link>
    </div>
  )
}

// ── Retention: Next Trip CTA ──────────────────────────────────────────────────
function NextTripCard() {
  return (
    <div className="bg-gradient-to-br from-[#1B6FB5] to-teal-600 rounded-2xl shadow p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">✈️</span>
        <h2 className="font-extrabold text-lg leading-tight">¿A dónde vas después?</h2>
      </div>
      <p className="text-white/80 text-sm leading-relaxed mb-4">
        Planifica tu próxima aventura accesible — Alli tiene todo listo para ti.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/planificador"
          className="flex-1 bg-white text-[#1B6FB5] font-bold text-sm text-center px-4 py-3 rounded-xl hover:bg-orange-50 transition shadow"
        >
          🗺️ Planificar viaje
        </Link>
        <Link
          href="/destinos"
          className="flex-1 bg-white/20 border border-white/30 text-white font-bold text-sm text-center px-4 py-3 rounded-xl hover:bg-white/30 transition"
        >
          🌍 Ver destinos
        </Link>
      </div>
    </div>
  )
}

// ── Retention: "No pierdas esto" — value reminder ────────────────────────────
function ValueReminderCard({ profile }: { profile: Profile }) {
  const hasData = profile.medications.length > 0 || profile.chronic_conditions || profile.disability_types.length > 0

  if (!hasData) return null

  const items = [
    profile.disability_types.length > 0 &&
      `${profile.disability_types.length} necesidad${profile.disability_types.length > 1 ? 'es' : ''} de accesibilidad`,
    profile.medications.length > 0 &&
      `${profile.medications.length} medicamento${profile.medications.length > 1 ? 's' : ''} guardado${profile.medications.length > 1 ? 's' : ''}`,
    profile.chronic_conditions && 'Condiciones crónicas registradas',
    profile.invisible_needs && 'Necesidades invisibles documentadas',
  ].filter(Boolean) as string[]

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🔐</span>
        <div>
          <p className="font-bold text-amber-800 text-sm mb-1">
            Tu perfil médico está guardado y seguro
          </p>
          <ul className="space-y-0.5">
            {items.map((item, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                <span className="text-amber-500">✓</span> {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            Esta información viaja contigo en cada aventura. 🌍
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Install banner ────────────────────────────────────────────────────────────
function InstallAppBanner() {
  const t = useTranslations('dashboard')
  return (
    <div className="flex justify-center">
      <Link
        href="/instalar"
        className="inline-flex items-center gap-2 bg-white border border-[#1B6FB5] text-[#1B6FB5] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1B6FB5] hover:text-white transition shadow"
      >
        {t('installLink')}
      </Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && profile && profile.subscription_status === 'free') {
    redirect(`/${locale}/paywall`)
  }

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

        {/* Language switcher */}
        <div className="flex justify-end">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 text-xs font-bold shadow-sm">
            <a href={`/es/dashboard`} className={`px-3 py-1 rounded-md transition-all ${locale === 'es' ? 'bg-blue-700 text-white' : 'text-gray-500 hover:text-blue-700'}`}>ES</a>
            <a href={`/en/dashboard`} className={`px-3 py-1 rounded-md transition-all ${locale === 'en' ? 'bg-blue-700 text-white' : 'text-gray-500 hover:text-blue-700'}`}>EN</a>
          </div>
        </div>

        {/* 1. Greeting */}
        <GreetingSection name={safeProfile.full_name ?? ''} />

        {/* 2. Kit de viaje — completion + investment hook */}
        <KitDeViajeCard profile={safeProfile} />

        {/* 3. Quick access to all tools */}
        <QuickAccessCards />

        {/* 4. Alli daily tip + CTA — habit loop */}
        <AlliTipCard />

        {/* 5. Next trip — action trigger */}
        <NextTripCard />

        {/* 6. Value reminder — "no pierdas esto" retention hook */}
        <ValueReminderCard profile={safeProfile} />

        {/* 7. Nuestra Historia */}
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">💛 Nuestra Historia</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg ring-4 ring-orange-100">
                <Image src="/yadira-avatar.png" alt="Yadira y su papá" width={112} height={112} className="object-cover w-full h-full" />
              </div>
              <div className="text-center">
                <p className="font-bold text-blue-700 text-sm">Yadira</p>
                <p className="text-gray-400 text-xs">Fundadora · AllGo Travel</p>
              </div>
            </div>
            <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
              <p><strong className="text-gray-900">AllGo Travel nació de una historia personal.</strong></p>
              <p>Yadira, cubano-americana y profesional del área de salud, lleva años viajando junto a su padre con discapacidad. De esa experiencia nació AllGo Travel — un espacio donde los viajes se diseñan desde la inclusión, para que personas con discapacidad y sus familias puedan explorar el mundo con libertad y dignidad.</p>
              <p className="text-blue-700 font-semibold">Porque todos merecen descubrir el mundo. 🌍</p>
              <Link href="/nosotros" className="inline-block mt-1 text-orange-500 hover:text-orange-600 font-semibold text-xs underline">
                Leer historia completa →
              </Link>
            </div>
          </div>
        </div>

        {/* 8. Install PWA */}
        <InstallAppBanner />

      </div>
    </main>
  )
}
