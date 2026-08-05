import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'
const ORANGE = '#F97316'

type Module = {
  href: string
  emoji: string
  title: string
  desc: string
  ready: boolean
}

const MODULES: Module[] = [
  {
    href: '/hub/aerolineas',
    emoji: '✈️',
    title: 'Requisitos por Aerolínea',
    desc: '25 aerolíneas verificadas: qué exige cada una para tu perro de servicio y tu silla de ruedas, con fuente y fecha.',
    ready: true,
  },
  {
    href: '/hub/paises',
    emoji: '🌍',
    title: 'Requisitos por País',
    desc: 'La ley que aplica en cada destino: dónde tu perro de servicio está protegido y dónde hay que tener cuidado.',
    ready: true,
  },
  {
    href: '/hub/formularios',
    emoji: '📋',
    title: 'Formularios y Documentos',
    desc: 'Los formularios oficiales del DOT y la lista de documentos que necesitas antes de volar.',
    ready: true,
  },
  {
    href: '/hub/areas-alivio',
    emoji: '🐾',
    title: 'Áreas de Alivio',
    desc: 'Dónde encontrar las áreas de alivio para tu perro dentro de los aeropuertos.',
    ready: true,
  },
  {
    href: '/hub/checklist',
    emoji: '✅',
    title: 'Checklist Personalizado',
    desc: 'Tu lista de preparación paso a paso para viajar sin sorpresas con tu perro de servicio.',
    ready: true,
  },
  {
    href: '/hub/alertas',
    emoji: '🔔',
    title: 'Alertas de Políticas',
    desc: 'Los cambios recientes en las reglas de aerolíneas y autoridades que debes conocer.',
    ready: true,
  },
]

export default async function HubPage() {
  const locale = await getLocale()
  await requireMember(locale)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      {/* Hero */}
      <section
        className="px-5 pt-12 pb-16 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}
      >
        <Link href="/dashboard" className="text-white/70 hover:text-white text-sm font-medium">
          ← Dashboard
        </Link>
        <p className="mt-4 text-sm font-semibold tracking-wide" style={{ color: ORANGE }}>
          SERVICE DOG TRAVEL HUB
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight max-w-2xl mx-auto">
          Todo para volar con tu perro de servicio, en un solo lugar
        </h1>
        <p className="mt-4 text-white/80 max-w-xl mx-auto">
          Información verificada, con su fuente y su fecha. Nunca inventamos un dato: si no está
          confirmado, te lo decimos.
        </p>
      </section>

      {/* Modules */}
      <section className="px-5 -mt-10 pb-16">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {MODULES.map((m) => (
            <Link
              key={m.href}
              href={m.href as '/hub/aerolineas'}
              className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition hover:shadow-md hover:border-[#1B6FB5]/30 flex flex-col"
            >
              <span className="text-3xl">{m.emoji}</span>
              <h3 className="mt-3 text-lg font-extrabold" style={{ color: BLUE }}>
                {m.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 flex-1">{m.desc}</p>
              <span className="mt-4 text-sm font-bold" style={{ color: ORANGE }}>
                Abrir →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
