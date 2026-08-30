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

function getModules(en: boolean): Module[] {
  return [
    {
      href: '/hub/aerolineas',
      emoji: '✈️',
      title: en ? 'Requirements by Airline' : 'Requisitos por Aerolínea',
      desc: en
        ? '25 verified airlines: what each one requires for your service dog and your wheelchair, with source and date.'
        : '25 aerolíneas verificadas: qué exige cada una para tu perro de servicio y tu silla de ruedas, con fuente y fecha.',
      ready: true,
    },
    {
      href: '/hub/cruceros',
      emoji: '🚢',
      title: en ? 'Requirements by Cruise Line' : 'Requisitos por Crucero',
      desc: en
        ? '8 verified cruise lines: service dog, accessibility and reduced mobility on each cruise, with source and date.'
        : '8 navieras verificadas: perro de servicio, accesibilidad y movilidad reducida en cada crucero, con fuente y fecha.',
      ready: true,
    },
    {
      href: '/hub/paises',
      emoji: '🌍',
      title: en ? 'Requirements by Country' : 'Requisitos por País',
      desc: en
        ? 'The law that applies at each destination: where your service dog is protected and where to be careful.'
        : 'La ley que aplica en cada destino: dónde tu perro de servicio está protegido y dónde hay que tener cuidado.',
      ready: true,
    },
    {
      href: '/hub/formularios',
      emoji: '📋',
      title: en ? 'Forms and Documents' : 'Formularios y Documentos',
      desc: en
        ? 'The official DOT forms and the list of documents you need before flying.'
        : 'Los formularios oficiales del DOT y la lista de documentos que necesitas antes de volar.',
      ready: true,
    },
    {
      href: '/hub/areas-alivio',
      emoji: '🐾',
      title: en ? 'Relief Areas' : 'Áreas de Alivio',
      desc: en
        ? 'Where to find the relief areas for your dog inside airports.'
        : 'Dónde encontrar las áreas de alivio para tu perro dentro de los aeropuertos.',
      ready: true,
    },
    {
      href: '/hub/checklist',
      emoji: '✅',
      title: en ? 'Personalized Checklist' : 'Checklist Personalizado',
      desc: en
        ? 'Your step-by-step prep list to travel with your service dog without surprises.'
        : 'Tu lista de preparación paso a paso para viajar sin sorpresas con tu perro de servicio.',
      ready: true,
    },
    {
      href: '/hub/alertas',
      emoji: '🔔',
      title: en ? 'Policy Alerts' : 'Alertas de Políticas',
      desc: en
        ? 'Recent changes in airline and authority rules you should know about.'
        : 'Los cambios recientes en las reglas de aerolíneas y autoridades que debes conocer.',
      ready: true,
    },
  ]
}

export default async function HubPage() {
  const locale = await getLocale()
  await requireMember(locale)
  const en = locale === 'en'
  const MODULES = getModules(en)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      {/* Hero */}
      <section
        className="px-5 pt-12 pb-16 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${BLUE}, #0E4E85)` }}
      >
        <Link href="/dashboard" className="text-white/70 hover:text-white text-sm font-medium">
          ← {en ? 'Dashboard' : 'Panel'}
        </Link>
        <p className="mt-4 text-sm font-semibold tracking-wide" style={{ color: ORANGE }}>
          SERVICE DOG TRAVEL HUB
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight max-w-2xl mx-auto">
          {en
            ? 'Everything to fly with your service dog, in one place'
            : 'Todo para volar con tu perro de servicio, en un solo lugar'}
        </h1>
        <p className="mt-4 text-white/80 max-w-xl mx-auto">
          {en
            ? 'Verified information, with its source and date. We never make up a fact: if it isn\'t confirmed, we tell you.'
            : 'Información verificada, con su fuente y su fecha. Nunca inventamos un dato: si no está confirmado, te lo decimos.'}
        </p>
      </section>

      {/* Modules */}
      <section className="px-5 -mt-10 pb-16">
        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {MODULES.map((m, i) => (
            <Link
              key={m.href}
              href={m.href as '/hub/aerolineas'}
              style={{ animationDelay: `${i * 70}ms` }}
              className="allgo-rise allgo-tap group rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-[#1B6FB5]/30 flex flex-col"
            >
              <span className="text-3xl transition-transform duration-200 group-hover:scale-110">{m.emoji}</span>
              <h3 className="mt-3 text-lg font-extrabold" style={{ color: BLUE }}>
                {m.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600 flex-1">{m.desc}</p>
              <span className="mt-4 text-sm font-bold transition-transform duration-200 group-hover:translate-x-1" style={{ color: ORANGE }}>
                {en ? 'Open →' : 'Abrir →'}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
