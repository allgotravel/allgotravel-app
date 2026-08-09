import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'

type Alert = {
  date: string
  tag: string
  tone: 'red' | 'amber' | 'blue'
  title: string
  text: string
  source?: { url: string; label: string }
}

const ALERTS: Alert[] = [
  {
    date: 'jul 2026',
    tag: 'Avianca',
    tone: 'amber',
    title: 'Avianca limita a 1 perro de servicio por tiquete',
    text: 'Desde el 31 de julio de 2026, Avianca acepta como máximo 1 perro de servicio, guía o de rescate por tiquete, salvo excepción legal.',
    source: { url: 'https://ayuda.avianca.com/hc/es/articles/13091453290523', label: 'Avianca — política oficial' },
  },
  {
    date: '2024',
    tag: 'EE.UU. · CDC',
    tone: 'blue',
    title: 'Nuevo formulario del CDC para perros que entran a EE.UU.',
    text: 'El CDC exige un formulario de importación (CDC Dog Import Form) para todos los perros que ingresan a Estados Unidos. Se llena en línea y te dan un recibo con código QR.',
    source: { url: 'https://www.cdc.gov/importation/dogs/index.html', label: 'CDC — importación de perros' },
  },
  {
    date: '2021',
    tag: 'EE.UU. · DOT',
    tone: 'red',
    title: 'Las aerolíneas de EE.UU. ya no aceptan animales de apoyo emocional (ESA)',
    text: 'Desde la regla del DOT de 2021, las aerolíneas estadounidenses solo están obligadas a aceptar perros de servicio entrenados. Los ESA viajan como mascota (con tarifa y restricciones). Además se exige el formulario DOT de animal de servicio.',
    source: {
      url: 'https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals',
      label: 'DOT — animales de servicio',
    },
  },
]

const toneStyles: Record<string, { bg: string; text: string; badge: string }> = {
  red: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-700' },
  amber: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-800' },
  blue: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' },
}

export default async function HubAlertasPage() {
  const locale = await getLocale()
  await requireMember(locale)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">🔔 Alertas de Políticas</h1>
          <p className="mt-2 text-white/80">
            Los cambios recientes en las reglas de aerolíneas y autoridades que debes conocer. Cada uno con su fuente.
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {ALERTS.map((a) => {
            const s = toneStyles[a.tone]
            return (
              <div key={a.title} className={`rounded-2xl p-5 border ${s.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${s.badge}`}>{a.tag}</span>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <h3 className={`font-extrabold leading-tight ${s.text}`}>{a.title}</h3>
                <p className="mt-1.5 text-sm text-gray-700">{a.text}</p>
                {a.source && (
                  <a
                    href={a.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs font-bold underline"
                    style={{ color: BLUE }}
                  >
                    {a.source.label} →
                  </a>
                )}
              </div>
            )
          })}

          <p className="text-center text-xs text-gray-400">
            Monitoreamos las políticas y actualizamos esta lista. Aun así, confirma siempre con tu aerolínea
            antes de volar: las reglas pueden cambiar sin aviso.
          </p>
        </div>
      </section>
    </main>
  )
}
