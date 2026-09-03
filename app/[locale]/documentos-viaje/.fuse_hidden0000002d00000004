import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { requireMember } from '@/lib/subscription'
import { Link } from '@/i18n/navigation'
import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

const AIRLINES = [
  {
    name: 'American Airlines',
    flag: '🇺🇸',
    allowed: '✅ Psiquiátricos + Servicio',
    allowedEn: '✅ Psychiatric + Service',
    notice: '48 horas',
    noticeEn: '48 hours',
    notes: 'Debe completar formularios DOT',
    notesEn: 'Must complete DOT forms',
    tier: 'us',
  },
  {
    name: 'United Airlines',
    flag: '🇺🇸',
    allowed: '✅ Solo animales de servicio',
    allowedEn: '✅ Service animals only',
    notice: '48 horas',
    noticeEn: '48 hours',
    notes: 'Animales de apoyo emocional necesitan formulario DOT',
    notesEn: 'Emotional support animals need DOT form',
    tier: 'us',
  },
  {
    name: 'Delta Air Lines',
    flag: '🇺🇸',
    allowed: '✅ Solo animales de servicio',
    allowedEn: '✅ Service animals only',
    notice: '48 horas',
    noticeEn: '48 hours',
    notes: 'Sin animales de apoyo emocional desde 2021',
    notesEn: 'No emotional support animals since 2021',
    tier: 'us',
  },
  {
    name: 'JetBlue',
    flag: '🇺🇸',
    allowed: '✅ Solo animales de servicio',
    allowedEn: '✅ Service animals only',
    notice: '48 horas',
    noticeEn: '48 hours',
    notes: 'Requerido: formularios DOT',
    notesEn: 'Required: DOT forms',
    tier: 'us',
  },
  {
    name: 'Southwest Airlines',
    flag: '🇺🇸',
    allowed: '✅ Solo animales de servicio',
    allowedEn: '✅ Service animals only',
    notice: 'Sin aviso previo requerido',
    noticeEn: 'No advance notice required',
    notes: 'Política más flexible',
    notesEn: 'More flexible policy',
    tier: 'us',
  },
  {
    name: 'Copa Airlines',
    flag: '🇵🇦',
    allowed: '✅ Varía según ruta',
    allowedEn: '✅ Varies by route',
    notice: '48–72 horas',
    noticeEn: '48–72 hours',
    notes: 'Verificar reglas por ruta específica',
    notesEn: 'Check rules for the specific route',
    tier: 'latam',
  },
  {
    name: 'Avianca',
    flag: '🇨🇴',
    allowed: '✅ Rutas limitadas',
    allowedEn: '✅ Limited routes',
    notice: '72 horas',
    noticeEn: '72 hours',
    notes: 'Requiere: cert. veterinaria + formulario equivalente al DOT',
    notesEn: 'Requires: veterinary cert. + DOT-equivalent form',
    tier: 'latam',
  },
  {
    name: 'LATAM Airlines',
    flag: '🇧🇷',
    allowed: '✅ Limitado',
    allowedEn: '✅ Limited',
    notice: '72 horas',
    noticeEn: '72 hours',
    notes: 'Solo perros guía en algunas rutas',
    notesEn: 'Guide dogs only on some routes',
    tier: 'latam',
  },
]

const COUNTRIES = [
  // América del Norte
  { flag: '🇺🇸', name: 'EE.UU. / USA', nameEn: 'United States', law: 'ACAA aplica — destino más accesible', lawEn: 'ACAA applies — most accessible destination', level: 'green' },
  { flag: '🇵🇷', name: 'Puerto Rico', nameEn: 'Puerto Rico', law: 'Territorio de EE.UU. — ACAA aplica', lawEn: 'U.S. territory — ACAA applies', level: 'green' },
  { flag: '🇨🇦', name: 'Canadá', nameEn: 'Canada', law: 'Canada Transportation Act — perros de servicio permitidos en todos los vuelos', lawEn: 'Canada Transportation Act — service dogs allowed on all flights', level: 'green' },
  { flag: '🇲🇽', name: 'México', nameEn: 'Mexico', law: 'Perros guía protegidos por ley federal (NOM)', lawEn: 'Guide dogs protected by federal law (NOM)', level: 'amber' },
  // Caribe y LATAM
  { flag: '🇩🇴', name: 'Rep. Dominicana', nameEn: 'Dominican Republic', law: 'Sin ley específica — aerolíneas varían', lawEn: 'No specific law — airlines vary', level: 'red' },
  { flag: '🇨🇷', name: 'Costa Rica', nameEn: 'Costa Rica', law: 'Sin ley nacional, pero generalmente aceptado', lawEn: 'No national law, but generally accepted', level: 'amber' },
  { flag: '🇨🇴', name: 'Colombia', nameEn: 'Colombia', law: 'Ley 1618 — perros guía permitidos en transporte público', lawEn: 'Law 1618 — guide dogs allowed on public transport', level: 'amber' },
  { flag: '🇧🇷', name: 'Brasil', nameEn: 'Brazil', law: 'ABNT NBR 9050 — perros guía totalmente protegidos', lawEn: 'ABNT NBR 9050 — guide dogs fully protected', level: 'amber' },
  { flag: '🇦🇷', name: 'Argentina', nameEn: 'Argentina', law: 'Ley 22.431 — perros guía protegidos; animales de servicio permitidos', lawEn: 'Law 22.431 — guide dogs protected; service animals allowed', level: 'amber' },
  { flag: '🇵🇪', name: 'Perú', nameEn: 'Peru', law: 'Ley 29830 — perros guía con certificado permitidos', lawEn: 'Law 29830 — certified guide dogs allowed', level: 'amber' },
  { flag: '🇵🇦', name: 'Panamá', nameEn: 'Panama', law: 'Decreto Ejecutivo 27 — perros guía permitidos en espacios públicos', lawEn: 'Executive Decree 27 — guide dogs allowed in public spaces', level: 'amber' },
  { flag: '🇨🇺', name: 'Cuba', nameEn: 'Cuba', law: 'No hay ley de animales de servicio — solo perros guía visuales en algunos hoteles', lawEn: 'No service animal law — only visual guide dogs in some hotels', level: 'red' },
  // Europa
  { flag: '🇪🇸', name: 'España', nameEn: 'Spain', law: 'Reglamento UE 1107/2006 — animales de asistencia garantizados en todos los vuelos UE', lawEn: 'EU Regulation 1107/2006 — assistance animals guaranteed on all EU flights', level: 'green' },
  { flag: '🇫🇷', name: 'Francia', nameEn: 'France', law: 'Reglamento UE 1107/2006 — perros guía y de asistencia permitidos', lawEn: 'EU Regulation 1107/2006 — guide and assistance dogs allowed', level: 'green' },
  { flag: '🇩🇪', name: 'Alemania', nameEn: 'Germany', law: 'Reglamento UE 1107/2006 + Gleichstellungsgesetz — protección completa', lawEn: 'EU Regulation 1107/2006 + Gleichstellungsgesetz — full protection', level: 'green' },
  { flag: '🇳🇱', name: 'Países Bajos', nameEn: 'Netherlands', law: 'Reglamento UE 1107/2006 — uno de los más accesibles de Europa', lawEn: 'EU Regulation 1107/2006 — one of the most accessible in Europe', level: 'green' },
  { flag: '🇬🇧', name: 'Reino Unido', nameEn: 'United Kingdom', law: 'Equality Act 2010 — animales de servicio protegidos post-Brexit', lawEn: 'Equality Act 2010 — service animals protected post-Brexit', level: 'green' },
  { flag: '🇮🇹', name: 'Italia', nameEn: 'Italy', law: 'Reglamento UE 1107/2006 — perros guía permitidos en cabina', lawEn: 'EU Regulation 1107/2006 — guide dogs allowed in cabin', level: 'green' },
  { flag: '🇵🇹', name: 'Portugal', nameEn: 'Portugal', law: 'Reglamento UE 1107/2006 — acceso garantizado en vuelos UE', lawEn: 'EU Regulation 1107/2006 — guaranteed access on EU flights', level: 'green' },
  // Asia-Pacífico
  { flag: '🇯🇵', name: 'Japón', nameEn: 'Japan', law: 'Ley de Asistencia a Personas con Discapacidad — perros guía, sordos y físicos permitidos', lawEn: 'Law on Assistance for Persons with Disabilities — guide, hearing and mobility dogs allowed', level: 'green' },
  { flag: '🇸🇬', name: 'Singapur', nameEn: 'Singapore', law: 'Misguided Dogs and Assistance Dogs Act — acceso garantizado en transporte y espacios públicos', lawEn: 'Misguided Dogs and Assistance Dogs Act — guaranteed access on transport and in public spaces', level: 'green' },
  { flag: '🇦🇺', name: 'Australia', nameEn: 'Australia', law: 'Disability Discrimination Act 1992 — animales de asistencia con amplia protección legal', lawEn: 'Disability Discrimination Act 1992 — assistance animals with broad legal protection', level: 'green' },
]

export default async function DocumentosViajePage() {
  const locale = await getLocale()
  const en = locale === 'en'
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  // Función premium — solo miembros
  await requireMember(locale)

  const t = await getTranslations('documentos')

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4">
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="no-print max-w-4xl mx-auto flex items-start justify-between mb-6 gap-4">
        <div>
          <Link href="/dashboard" className="text-[#1B6FB5] hover:underline text-sm font-medium">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-1">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('subtitle')}</p>
        </div>
        <PrintButton label={t('printLabel')} />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Section A: DOT Forms ── */}
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-[#1B6FB5] px-6 py-4">
            <h2 className="text-white text-lg font-bold">🐾 {t('acaaTitle')}</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-gray-700 leading-relaxed text-sm">{t('acaaDesc')}</p>
          </div>
        </section>

        {/* DOT Forms */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4">📋 {t('dotTitle')}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* Form 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-100 px-5 py-3">
                <h3 className="font-bold text-[#1B6FB5] text-sm leading-tight">{t('form1Title')}</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">{t('form1Desc')}</p>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold text-gray-500 whitespace-nowrap">{t('form1When')}:</span>
                    <span className="text-gray-700">{t('form1WhenText')}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold text-gray-500 whitespace-nowrap">{t('form1Who')}:</span>
                    <span className="text-gray-700">{t('form1WhoText')}</span>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg px-4 py-2.5 text-xs text-blue-800 leading-relaxed">
                  ℹ️ {t('form1Note')}
                </div>
              </div>
            </div>

            {/* Form 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
              <div className="bg-teal-50 border-b border-teal-100 px-5 py-3">
                <h3 className="font-bold text-[#0D9488] text-sm leading-tight">{t('form2Title')}</h3>
              </div>
              <div className="px-5 py-4 space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">{t('form2Desc')}</p>
                <div className="space-y-2">
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold text-gray-500 whitespace-nowrap">{t('form2When')}:</span>
                    <span className="text-gray-700">{t('form2WhenText')}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <span className="font-semibold text-gray-500 whitespace-nowrap">{t('form2Who')}:</span>
                    <span className="text-gray-700">{t('form2WhoText')}</span>
                  </div>
                </div>
                <div className="bg-teal-50 rounded-lg px-4 py-2.5 text-xs text-teal-800 leading-relaxed">
                  ℹ️ {t('form2Note')}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bilingual tip card */}
        <div className="bg-[#F97316] rounded-2xl shadow p-5 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-5xl flex-shrink-0">⏰</span>
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-wide mb-1 opacity-80">
              {t('tipLabel')}
            </p>
            <p className="text-white font-bold text-base leading-snug">{t('tipEs')}</p>
            <p className="text-orange-100 text-sm mt-0.5 leading-snug italic">{t('tipEn')}</p>
          </div>
          <div className="sm:ml-auto no-print">
            <PrintButton label={t('printLabel')} />
          </div>
        </div>

        {/* ── Section B: Airline Regulations ── */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-1">✈️ {t('airlineTitle')}</h2>
          <p className="text-gray-500 text-sm mb-4">{t('airlineSubtitle')}</p>

          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
              {en ? 'U.S. airlines — clear policy' : 'Aerolíneas EE.UU. — política clara'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-400"></span>
              {en ? 'LATAM airlines — variable policy' : 'Aerolíneas LATAM — política variable'}
            </span>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <span>{t('colAirline')}</span>
              <span>{t('colAllowed')}</span>
              <span>{t('colNotice')}</span>
              <span className="hidden sm:block">{t('colNotes')}</span>
            </div>

            {AIRLINES.map((airline, i) => (
              <div
                key={airline.name}
                className={`grid grid-cols-4 px-4 py-3.5 text-sm border-b border-gray-100 last:border-0 items-start gap-2 ${
                  airline.tier === 'us'
                    ? 'bg-green-50/40 hover:bg-green-50'
                    : 'bg-amber-50/40 hover:bg-amber-50'
                }`}
              >
                <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                  <span>{airline.flag}</span>
                  <span className="leading-tight">{airline.name}</span>
                </div>
                <div className="text-gray-700 text-xs leading-relaxed">{en ? airline.allowedEn : airline.allowed}</div>
                <div className="text-gray-600 text-xs">{en ? airline.noticeEn : airline.notice}</div>
                <div className="hidden sm:block text-gray-500 text-xs leading-relaxed">{en ? airline.notesEn : airline.notes}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Country Regulations */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-1">🌍 {t('countryTitle')}</h2>
          <p className="text-gray-500 text-sm mb-4">{t('countrySubtitle')}</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTRIES.map(country => (
              <div
                key={country.name}
                className={`rounded-xl p-4 border flex gap-3 items-start ${
                  country.level === 'green'
                    ? 'bg-green-50 border-green-200'
                    : country.level === 'amber'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <span className="text-3xl leading-none flex-shrink-0">{country.flag}</span>
                <div>
                  <p className={`font-bold text-sm ${
                    country.level === 'green'
                      ? 'text-green-800'
                      : country.level === 'amber'
                      ? 'text-amber-800'
                      : 'text-red-800'
                  }`}>
                    {en ? country.nameEn : country.name}
                  </p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${
                    country.level === 'green'
                      ? 'text-green-700'
                      : country.level === 'amber'
                      ? 'text-amber-700'
                      : 'text-red-700'
                  }`}>
                    {en ? country.lawEn : country.law}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <p className="no-print text-center text-xs text-gray-400 pb-4">
          {en ? 'AllGo Travel App · Accessible travel for everyone 🌍' : 'AllGo Travel App · Turismo accesible para todos 🌍'}
        </p>
      </div>
    </main>
  )
}
