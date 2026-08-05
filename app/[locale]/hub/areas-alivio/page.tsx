import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'
const ORANGE = '#F97316'

const STEPS = [
  {
    emoji: '🇺🇸',
    title: 'En aeropuertos de EE.UU. siempre hay',
    text: 'Por ley (ACAA), todos los aeropuertos grandes de EE.UU. deben tener un área de alivio para animales de servicio en cada terminal, y al menos una pasando el control de seguridad. Es tu derecho usarla.',
  },
  {
    emoji: '🗺️',
    title: 'Cómo encontrarla rápido',
    text: 'Busca los letreros «Service Animal Relief Area» o «Pet Relief Area». Muchos aeropuertos las marcan en su mapa y en su app oficial. Si no la ves, pregunta en cualquier mostrador — el personal está obligado a indicártela.',
  },
  {
    emoji: '⏰',
    title: 'Planéalo con tiempo',
    text: 'Dale a tu perro la oportunidad de aliviarse justo antes de abordar. En vuelos largos (8+ h), recuerda que la aerolínea puede pedirte el formulario DOT de alivio sanitario.',
  },
  {
    emoji: '🌎',
    title: 'Fuera de EE.UU.',
    text: 'En otros países no siempre existe esta obligación legal. Antes de viajar, revisa el sitio web del aeropuerto de destino o escríbeles para confirmar si tienen área de alivio y dónde queda.',
  },
]

export default async function HubAreasAlivioPage() {
  const locale = await getLocale()
  await requireMember(locale)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section className="px-5 pt-10 pb-8 text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}>
        <div className="max-w-3xl mx-auto">
          <Link href="/hub" className="text-white/70 hover:text-white text-sm font-medium">← Hub</Link>
          <h1 className="mt-3 text-3xl font-extrabold">🐾 Áreas de Alivio</h1>
          <p className="mt-2 text-white/80">
            Dónde y cómo encontrar el área para que tu perro haga sus necesidades dentro del aeropuerto.
          </p>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex items-start gap-3">
              <span className="text-3xl">{s.emoji}</span>
              <div>
                <h3 className="font-extrabold" style={{ color: BLUE }}>{s.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{s.text}</p>
              </div>
            </div>
          ))}

          <div className="rounded-2xl p-5 border-2 bg-orange-50" style={{ borderColor: ORANGE }}>
            <p className="text-sm text-orange-900">
              <span className="font-bold">Próximamente:</span> el mapa con la ubicación exacta del área de
              alivio en los principales aeropuertos. Lo estamos verificando aeropuerto por aeropuerto para
              darte solo información confirmada.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
