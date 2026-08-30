import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'

type Country = { flag: string; name: string; nameEn: string; law: string; lawEn: string; level: 'green' | 'amber' | 'red' }

const COUNTRIES: Country[] = [
  { flag: '🇺🇸', name: 'EE.UU. / USA', nameEn: 'United States', law: 'ACAA aplica — destino más accesible', lawEn: 'ACAA applies — most accessible destination', level: 'green' },
  { flag: '🇵🇷', name: 'Puerto Rico', nameEn: 'Puerto Rico', law: 'Territorio de EE.UU. — ACAA aplica', lawEn: 'U.S. territory — ACAA applies', level: 'green' },
  { flag: '🇨🇦', name: 'Canadá', nameEn: 'Canada', law: 'Canada Transportation Act — perros de servicio permitidos en todos los vuelos', lawEn: 'Canada Transportation Act — service dogs allowed on all flights', level: 'green' },
  { flag: '🇲🇽', name: 'México', nameEn: 'Mexico', law: 'Perros guía protegidos por ley federal (NOM)', lawEn: 'Guide dogs protected by federal law (NOM)', level: 'amber' },
  { flag: '🇩🇴', name: 'Rep. Dominicana', nameEn: 'Dominican Republic', law: 'Sin ley específica — aerolíneas varían', lawEn: 'No specific law — airlines vary', level: 'red' },
  { flag: '🇨🇷', name: 'Costa Rica', nameEn: 'Costa Rica', law: 'Sin ley nacional, pero generalmente aceptado', lawEn: 'No national law, but generally accepted', level: 'amber' },
  { flag: '🇨🇴', name: 'Colombia', nameEn: 'Colombia', law: 'Ley 1618 — perros guía permitidos en transporte público', lawEn: 'Law 1618 — guide dogs allowed on public transport', level: 'amber' },
  { flag: '🇧🇷', name: 'Brasil', nameEn: 'Brazil', law: 'ABNT NBR 9050 — perros guía totalmente protegidos', lawEn: 'ABNT NBR 9050 — guide dogs fully protected', level: 'amber' },
  { flag: '🇦🇷', name: 'Argentina', nameEn: 'Argentina', law: 'Ley 22.431 — perros guía protegidos; animales de servicio permitidos', lawEn: 'Law 22.431 — guide dogs protected; service animals allowed', level: 'amber' },
  { flag: '🇵🇪', name: 'Perú', nameEn: 'Peru', law: 'Ley 29830 — perros guía con certificado permitidos', lawEn: 'Law 29830 — certified guide dogs allowed', level: 'amber' },
  { flag: '🇵🇦', name: 'Panamá', nameEn: 'Panama', law: 'Decreto Ejecutivo 27 — perros guía permitidos en espacios públicos', lawEn: 'Executive Decree 27 — guide dogs allowed in public spaces', level: 'amber' },
  { flag: '🇨🇺', name: 'Cuba', nameEn: 'Cuba', law: 'No hay ley de animales de servicio — solo perros guía visuales en algunos hoteles', lawEn: 'No service animal law — only visual guide dogs in some hotels', level: 'red' },
  { flag: '🇪🇸', name: 'España', nameEn: 'Spain', law: 'Reglamento UE 1107/2006 — animales de asistencia garantizados en todos los vuelos UE', lawEn: 'EU Regulation 1107/2006 — assistance animals guaranteed on all EU flights', level: 'green' },
  { flag: '🇫🇷', name: 'Francia', nameEn: 'France', law: 'Reglamento UE 1107/2006 — perros guía y de asistencia permitidos', lawEn: 'EU Regulation 1107/2006 — guide and assistance dogs allowed', level: 'green' },
  { flag: '🇩🇪', name: 'Alemania', nameEn: 'Germany', law: 'Reglamento UE 1107/2006 + Gleichstellungsgesetz — protección completa', lawEn: 'EU Regulation 1107/2006 + Gleichstellungsgesetz — full protection', level: 'green' },
  { flag: '🇳🇱', name: 'Países Bajos', nameEn: 'Netherlands', law: 'Reglamento UE 1107/2006 — uno de los más accesibles de Europa', lawEn: 'EU Regulation 1107/2006 — one of the most accessible in Europe', level: 'green' },
  { flag: '🇬🇧', name: 'Reino Unido', nameEn: 'United Kingdom', law: 'Equality Act 2010 — animales de servicio protegidos post-Brexit', lawEn: 'Equality Act 2010 — service animals protected post-Brexit', level: 'green' },
  { flag: '🇮🇹', name: 'Italia', nameEn: 'Italy', law: 'Reglamento UE 1107/2006 — perros guía permitidos en cabina', lawEn: 'EU Regulation 1107/2006 — guide dogs allowed in cabin', level: 'green' },
  { flag: '🇵🇹', name: 'Portugal', nameEn: 'Portugal', law: 'Reglamento UE 1107/2006 — acceso garantizado en vuelos UE', lawEn: 'EU Regulation 1107/2006 — guaranteed access on EU flights', level: 'green' },
  { flag: '🇯🇵', name: 'Japón', nameEn: 'Japan', law: 'Ley de Asistencia a Personas con Discapacidad — perros guía, sordos y físicos permitidos', lawEn: 'Law on Assistance for Persons with Disabilities — guide, hearing and mobility dogs allowed', level: 'green' },
  { flag: '🇸🇬', name: 'Singapur', nameEn: 'Singapore', law: 'Assistance Dogs Act — acceso garantizado en transporte y espacios públicos', lawEn: 'Assistance Dogs Act — guaranteed access on transport and in public spaces', level: 'green' },
  { flag: '🇦🇺', name: 'Australia', nameEn: 'Australia', law: 'Disability Discrimination Act 1992 — animales de asistencia con amplia protección legal', lawEn: 'Disability Discrimination Act 1992 — assistance animals with broad legal protection', level: 'green' },
]

type Legend = { level: 'green' | 'amber' | 'red'; label: string }

function getLegend(en: boolean): Legend[] {
  return [
    { level: 'green', label: en ? 'Clear law — well protected' : 'Ley clara — bien protegido' },
    { level: 'amber', label: en ? 'Partial or variable protection' : 'Protección parcial o variable' },
    { level: 'red', label: en ? 'No specific law — check with the airline' : 'Sin ley específica — verifica con la aerolínea' },
  ]
}

const colorText: Record<string, string> = { green: 'text-green-800', amber: 'text-amber-800', red: 'text-red-800' }
const colorBg: Record<string, string> = {
  green: 'bg-green-50 border-green-200',
  amber: 'bg-amber-50 border-amber-200',
  red: 'bg-red-50 border-red-200',
}
const dot: Record<string, string> = { green: 'bg-green-400', amber: 'bg-amber-400', red: 'bg-red-400' }

export default async function HubPaisesPage() {
  const locale = await getLocale()
  const en = locale === 'en'
  await requireMember(locale)

  const legend = getLegend(en)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">{en ? '🌍 Requirements by Country' : '🌍 Requisitos por País'}</h1>
          <p className="mt-2 text-white/80">
            {en
              ? `The law that protects your service dog in each destination. ${COUNTRIES.length} countries.`
              : `La ley que protege a tu perro de servicio en cada destino. ${COUNTRIES.length} países.`}
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-6 text-xs font-medium">
            {legend.map((l) => (
              <span key={l.level} className="flex items-center gap-1.5">
                <span className={`inline-block w-3 h-3 rounded-full ${dot[l.level]}`} /> {l.label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTRIES.map((c) => (
              <div key={c.name} className={`rounded-xl p-4 border flex gap-3 items-start ${colorBg[c.level]}`}>
                <span className="text-3xl leading-none flex-shrink-0">{c.flag}</span>
                <div>
                  <p className={`font-bold text-sm ${colorText[c.level]}`}>{en ? c.nameEn : c.name}</p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${colorText[c.level]}`}>{en ? c.lawEn : c.law}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            {en
              ? 'The country law is only one part: your airline policy also applies. Check both before flying.'
              : 'La ley del país es solo una parte: la política de tu aerolínea también aplica. Revisa ambas antes de volar.'}
          </p>
        </div>
      </section>
    </main>
  )
}
