import { redirect } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { createSupabaseServer } from '@/lib/supabase-server'
import { Link } from '@/i18n/navigation'
import { Profile } from '@/types/profile'
import { TravelDocument, expiryStatus, docTypeDef } from '@/lib/expiry'
import A11yToggle from '@/components/A11yToggle'
import SosButton from '@/components/SosButton'
import MedCheckIn from '@/components/MedCheckIn'

export const dynamic = 'force-dynamic'

// ── Próximos vencimientos (Bóveda de Viaje) ──────────────────────────────────
function UpcomingDocsCard({ docs, en }: { docs: TravelDocument[]; en: boolean }) {
  const withDate = docs
    .filter(d => d.expiry_date)
    .map(d => ({ d, st: expiryStatus(d.expiry_date) }))
    .sort((a, b) => (a.st.daysLeft ?? 99999) - (b.st.daysLeft ?? 99999))

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-800">📅 {en ? 'Upcoming expirations' : 'Próximos vencimientos'}</h2>
        <Link href="/documentos" className="text-xs font-bold text-[#1B6FB5] hover:underline">
          {en ? 'Open Vault →' : 'Abrir Bóveda →'}
        </Link>
      </div>
      {withDate.length === 0 ? (
        <p className="text-sm text-gray-400">
          {en
            ? 'Add your documents and Alli will warn you 90, 60 and 30 days before they expire.'
            : 'Agrega tus documentos y Alli te avisará 90, 60 y 30 días antes de que venzan.'}{' '}
          <Link href="/documentos" className="text-[#1B6FB5] font-semibold hover:underline">
            {en ? 'Add →' : 'Agregar →'}
          </Link>
        </p>
      ) : (
        <div className="space-y-2">
          {withDate.slice(0, 4).map(({ d, st }) => {
            const def = docTypeDef(d.doc_type)
            return (
              <div key={d.id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${st.bg}`}>
                <span className="text-sm font-semibold text-gray-700">
                  {def?.icon} {en ? def?.en : def?.es}
                  {d.owner === 'dog' && ' 🐕‍🦺'}
                </span>
                <span className={`text-xs font-bold ${st.color}`}><span className={st.level === 'd30' || st.level === 'expired' ? 'allgo-urgent' : ''}>{st.badge}</span> {en ? st.labelEn : st.labelEs}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const DISABILITY_ICONS: Record<string, string> = {
  motriz: '♿',
  visual: '👁️',
  auditiva: '🦻',
  autismo: '🧩',
  cognitiva: '🧠',
  cronica_invisible: '🫀',
  mixta: '👨‍👩‍👧',
}

// ── Greeting ─────────────────────────────────────────────────────────────────
function GreetingSection({ name }: { name: string }) {
  const t = useTranslations('dashboard')
  return (
    <div className="allgo-aurora relative overflow-hidden rounded-3xl p-8 shadow-xl">
      <div className="allgo-grid pointer-events-none absolute inset-0" />
      <div className="allgo-orb pointer-events-none absolute -top-10 -right-8 w-40 h-40 rounded-full bg-orange-400/25 blur-2xl" />
      <div className="allgo-orb-2 pointer-events-none absolute -bottom-12 -left-6 w-44 h-44 rounded-full bg-cyan-400/25 blur-2xl" />
      <h1 className="relative text-3xl font-bold text-white drop-shadow-sm">
        {name ? t('greeting', { name }) : t('greetingFallback')}
      </h1>
      <p className="relative mt-1 text-sm font-medium text-white/80">AllGo Travel App 🌍</p>
    </div>
  )
}

// ── Quick Access Cards ────────────────────────────────────────────────────────
function QuickAccessCards({ member }: { member: boolean }) {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const en = locale === 'en'

  const cards = [
    {
      href: '/hub',
      icon: '🐕‍🦺',
      title: en ? 'Service Dog Travel Hub' : 'Centro de viaje con perro de servicio',
      desc: en ? 'Requirements, forms, checklist and alerts' : 'Requisitos, formularios, checklist y alertas',
      bg: 'bg-[#0E4E85]',
      premium: true,
      tema: 'perro',
    },
    {
      href: '/planificador',
      icon: '✈️',
      title: t('cardPlanner'),
      desc: t('cardPlannerDesc'),
      bg: 'bg-[#1B6FB5]',
      premium: true,
      tema: 'movilidad',
    },
    {
      href: '/destinos',
      icon: '🗺️',
      title: t('cardDestinations'),
      desc: t('cardDestinationsDesc'),
      bg: 'bg-[#0D9488]',
      premium: true,
      tema: 'movilidad',
    },
    {
      href: '/tarjeta-medica',
      icon: '🏥',
      title: t('cardMedical'),
      desc: t('cardMedicalDesc'),
      bg: 'bg-[#F97316]',
      premium: false,
    },
    {
      href: '/tarjeta-comunicacion',
      icon: '💬',
      title: t('cardCommunication'),
      desc: t('cardCommunicationDesc'),
      bg: 'bg-purple-600',
      premium: false,
    },
    {
      href: '/documentos',
      icon: '📁',
      title: en ? 'Travel Vault' : 'Bóveda de Viaje',
      desc: en ? 'Documents + expiry reminders' : 'Documentos + avisos de vencimiento',
      bg: 'bg-blue-600',
      premium: false,
    },
    {
      href: '/documentos-viaje',
      icon: '📄',
      title: t('cardDocuments'),
      desc: t('cardDocumentsDesc'),
      bg: 'bg-indigo-600',
      premium: true,
      tema: 'perro',
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('quickAccess')}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {cards.map((card, i) => {
          const locked = card.premium && !member
          return (
            <Link
              key={card.href}
              href={(locked ? `/paywall?tema=${card.tema ?? 'perro'}` : card.href) as '/planificador'}
              style={{ animationDelay: `${i * 90}ms` }}
              className={`allgo-pop allgo-tap group relative ${card.bg} text-white rounded-2xl p-5 flex flex-col gap-2 shadow ${locked ? 'opacity-90' : ''}`}
            >
              {locked && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-white/95 text-gray-800 rounded-full px-2 py-0.5 flex items-center gap-1">
                  🔒 {en ? 'Full prep' : 'Completo'}
                </span>
              )}
              <span className="text-3xl allgo-float inline-block group-hover:scale-110 transition-transform duration-200" style={{ animationDelay: `${i * 250}ms` }}>{card.icon}</span>
              <span className="font-semibold text-sm leading-tight">{card.title}</span>
              <span className="text-xs opacity-80 leading-tight">
                {locked ? (en ? 'Part of your complete preparation →' : 'Parte de tu preparación completa →') : card.desc}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// ── Retention: Alli tip with CTA ──────────────────────────────────────────────
function AlliTipCard() {
  const t = useTranslations('dashboard')
  const locale = useLocale()
  const en = locale === 'en'
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
        className="allgo-tap inline-flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 font-bold text-sm px-4 py-2.5 rounded-xl"
      >
        💬 {en ? 'Tell me about your next trip →' : 'Háblame de tu próximo viaje →'}
      </Link>
    </div>
  )
}

// ── Retention: Next Trip CTA ──────────────────────────────────────────────────
function NextTripCard() {
  const locale = useLocale()
  const en = locale === 'en'
  return (
    <div className="bg-gradient-to-br from-[#1B6FB5] to-blue-600 rounded-2xl shadow p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">✈️</span>
        <h2 className="font-extrabold text-lg leading-tight">{en ? 'Where to next?' : '¿A dónde vas después?'}</h2>
      </div>
      <p className="text-white/80 text-sm leading-relaxed mb-4">
        {en
          ? 'Plan your next accessible adventure — Alli has everything ready for you.'
          : 'Planifica tu próxima aventura accesible — Alli tiene todo listo para ti.'}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/planificador"
          className="allgo-tap allgo-cta flex-1 bg-white text-[#1B6FB5] font-bold text-sm text-center px-4 py-3 rounded-xl hover:bg-orange-50 shadow"
        >
          🗺️ {en ? 'Plan a trip' : 'Planificar viaje'}
        </Link>
        <Link
          href="/destinos"
          className="allgo-tap flex-1 bg-white/20 border border-white/30 text-white font-bold text-sm text-center px-4 py-3 rounded-xl hover:bg-white/30"
        >
          🌍 {en ? 'See destinations' : 'Ver destinos'}
        </Link>
      </div>
    </div>
  )
}

// ── Retention: "No pierdas esto" — value reminder ────────────────────────────
function ValueReminderCard({ profile }: { profile: Profile }) {
  const locale = useLocale()
  const en = locale === 'en'
  const hasData = profile.medications.length > 0 || profile.chronic_conditions || profile.disability_types.length > 0

  if (!hasData) return null

  const items = [
    profile.disability_types.length > 0 &&
      (en
        ? `${profile.disability_types.length} accessibility need${profile.disability_types.length > 1 ? 's' : ''}`
        : `${profile.disability_types.length} necesidad${profile.disability_types.length > 1 ? 'es' : ''} de accesibilidad`),
    profile.medications.length > 0 &&
      (en
        ? `${profile.medications.length} medication${profile.medications.length > 1 ? 's' : ''} saved`
        : `${profile.medications.length} medicamento${profile.medications.length > 1 ? 's' : ''} guardado${profile.medications.length > 1 ? 's' : ''}`),
    profile.chronic_conditions && (en ? 'Chronic conditions on file' : 'Condiciones crónicas registradas'),
    profile.invisible_needs && (en ? 'Invisible needs documented' : 'Necesidades invisibles documentadas'),
  ].filter(Boolean) as string[]

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🔐</span>
        <div>
          <p className="font-bold text-amber-800 text-sm mb-1">
            {en ? 'Your medical profile is saved and secure' : 'Tu perfil médico está guardado y seguro'}
          </p>
          <ul className="space-y-0.5">
            {items.map((item, i) => (
              <li key={i} className="text-xs text-amber-700 flex items-center gap-1.5">
                <span className="text-amber-500">✓</span> {item}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-600 mt-2 font-medium">
            {en ? 'This info travels with you on every adventure. 🌍' : 'Esta información viaja contigo en cada aventura. 🌍'}
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
        className="allgo-tap inline-flex items-center gap-2 bg-white border border-[#1B6FB5] text-[#1B6FB5] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#1B6FB5] hover:text-white shadow"
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

  const { data: docsData } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
  const docs = (docsData ?? []) as TravelDocument[]

  const isDev = process.env.NODE_ENV === 'development'
  const en = locale === 'en'
  // Acceso por niveles: FREE entra al app; las funciones premium se muestran con candado.
  const member = isDev || profile?.subscription_status === 'active'

  const safeProfile: Profile = {
    id: user.id,
    email: user.email ?? '',
    full_name: profile?.full_name ?? '',
    avatar_url: profile?.avatar_url ?? null,
    disability_types: profile?.disability_types ?? [],
    chronic_conditions: profile?.chronic_conditions ?? null,
    invisible_needs: profile?.invisible_needs ?? null,
    allergies: profile?.allergies ?? null,
    medications: profile?.medications ?? [],
    timezone: profile?.timezone ?? 'America/Mexico_City',
    is_group_profile: profile?.is_group_profile ?? false,
    group_members: profile?.group_members ?? [],
    preferred_language: profile?.preferred_language ?? 'es',
    created_at: profile?.created_at ?? new Date().toISOString(),
    updated_at: profile?.updated_at ?? new Date().toISOString(),
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4">
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

        {/* 2b. Próximos vencimientos — Bóveda de Viaje */}
        <UpcomingDocsCard docs={docs} en={en} />

        {/* 2c. Medicamentos de hoy — registro */}
        <MedCheckIn meds={safeProfile.medications} userId={user.id} en={en} />

        {/* 3. Quick access to all tools */}
        <QuickAccessCards member={member} />

        {/* 4. Alli daily tip + CTA — habit loop */}
        <AlliTipCard />

        {/* 5. Next trip — action trigger */}
        <NextTripCard />

        {/* 6. Value reminder — "no pierdas esto" retention hook */}
        <ValueReminderCard profile={safeProfile} />

        {/* 7. Nuestra Historia — tarjeta corta, la historia completa vive en /nosotros */}
        <Link
          href="/nosotros"
          className="allgo-tap block bg-white rounded-2xl shadow p-5 border-l-4 border-orange-400 hover:bg-orange-50/40"
        >
          <p className="font-bold text-gray-800">💛 {en ? 'Why we created AllGo Travel App' : 'Por qué creamos AllGo Travel App'}</p>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {en
              ? 'This app was born traveling with a family member with reduced mobility.'
              : 'Esta app nació viajando con un familiar con movilidad reducida.'}{' '}
            <span className="text-orange-500 font-semibold">{en ? 'Read our story →' : 'Conoce nuestra historia →'}</span>
          </p>
        </Link>

        {/* Accesibilidad */}
        <A11yToggle en={en} />

        {/* 8. Install PWA */}
        <InstallAppBanner />

      </div>

      {/* Botón SOS flotante */}
      <SosButton
        contactName={profile?.emergency_contact_name ?? null}
        contactPhone={profile?.emergency_contact_phone ?? null}
        en={en}
      />
    </main>
  )
}
