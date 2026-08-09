import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'

type Country = { flag: string; name: string; law: string; level: 'green' | 'amber' | 'red' }

const COUNTRIES: Country[] = [
  { flag: '🇺🇸', name: 'EE.UU. / USA', law: 'ACAA aplica — destino más accesible', level: 'green' },
  { flag: '🇵🇷', name: 'Puerto Rico', law: 'Territorio de EE.UU. — ACAA aplica', level: 'green' },
  { flag: '🇨🇦', name: 'Canadá', law: 'Canada Transportation Act — perros de servicio permitidos en todos los vuelos', level: 'green' },
  { flag: '🇲🇽', name: 'México', law: 'Perros guía protegidos por ley federal (NOM)', level: 'amber' },
  { flag: '🇩🇴', name: 'Rep. Dominicana', law: 'Sin ley específica — aerolíneas varían', level: 'red' },
  { flag: '🇨🇷', name: 'Costa Rica', law: 'Sin ley nacional, pero generalmente aceptado', level: 'amber' },
  { flag: '🇨🇴', name: 'Colombia', law: 'Ley 1618 — perros guía permitidos en transporte público', level: 'amber' },
  { flag: '🇧🇷', name: 'Brasil', law: 'ABNT NBR 9050 — perros guía totalmente protegidos', level: 'amber' },
  { flag: '🇦🇷', name: 'Argentina', law: 'Ley 22.431 — perros guía protegidos; animales de servicio permitidos', level: 'amber' },
  { flag: '🇵🇪', name: 'Perú', law: 'Ley 29830 — perros guía con certificado permitidos', level: 'amber' },
  { flag: '🇵🇦', name: 'Panamá', law: 'Decreto Ejecutivo 27 — perros guía permitidos en espacios públicos', level: 'amber' },
  { flag: '🇨🇺', name: 'Cuba', law: 'No hay ley de animales de servicio — solo perros guía visuales en algunos hoteles', level: 'red' },
  { flag: '🇪🇸', name: 'España', law: 'Reglamento UE 1107/2006 — animales de asistencia garantizados en todos los vuelos UE', level: 'green' },
  { flag: '🇫🇷', name: 'Francia', law: 'Reglamento UE 1107/2006 — perros guía y de asistencia permitidos', level: 'green' },
  { flag: '🇩🇪', name: 'Alemania', law: 'Reglamento UE 1107/2006 + Gleichstellungsgesetz — protección completa', level: 'green' },
  { flag: '🇳🇱', name: 'Países Bajos', law: 'Reglamento UE 1107/2006 — uno de los más accesibles de Europa', level: 'green' },
  { flag: '🇬🇧', name: 'Reino Unido', law: 'Equality Act 2010 — animales de servicio protegidos post-Brexit', level: 'green' },
  { flag: '🇮🇹', name: 'Italia', law: 'Reglamento UE 1107/2006 — perros guía permitidos en cabina', level: 'green' },
  { flag: '🇵🇹', name: 'Portugal', law: 'Reglamento UE 1107/2006 — acceso garantizado en vuelos UE', level: 'green' },
  { flag: '🇯🇵', name: 'Japón', law: 'Ley de Asistencia a Personas con Discapacidad — perros guía, sordos y físicos permitidos', level: 'green' },
  { flag: '🇸🇬', name: 'Singapur', law: 'Assistance Dogs Act — acceso garantizado en transporte y espacios públicos', level: 'green' },
  { flag: '🇦🇺', name: 'Australia', law: 'Disability Discrimination Act 1992 — animales de asistencia con amplia protección legal', level: 'green' },
]

const LEGEND = [
  { level: 'green', label: 'Ley clara — bien protegido' },
  { level: 'amber', label: 'Protección parcial o variable' },
  { level: 'red', label: 'Sin ley específica — verifica con la aerolínea' },
] as const

const colorText: Record<string, string> = { green: 'text-green-800', amber: 'text-amber-800', red: 'text-red-800' }
const colorBg: Record<string, string> = {
  green: 'bg-green-50 border-green-200',
  amber: 'bg-amber-50 border-amber-200',
  red: 'bg-red-50 border-red-200',
}
const dot: Record<string, string> = { green: 'bg-green-400', amber: 'bg-amber-400', red: 'bg-red-400' }

export default async function HubPaisesPage() {
  const locale = await getLocale()
  await requireMember(locale)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-4xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">🌍 Requisitos por País</h1>
          <p className="mt-2 text-white/80">
            La ley que protege a tu perro de servicio en cada destino. {COUNTRIES.length} países.
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-4 mb-6 text-xs font-medium">
            {LEGEND.map((l) => (
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
                  <p className={`font-bold text-sm ${colorText[c.level]}`}>{c.name}</p>
                  <p className={`text-xs mt-0.5 leading-relaxed ${colorText[c.level]}`}>{c.law}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            La ley del país es solo una parte: la política de tu aerolínea también aplica. Revisa ambas antes de volar.
          </p>
        </div>
      </section>
    </main>
  )
}
