import { getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireMember } from '@/lib/subscription'
import VipForm from '@/components/VipForm'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'
const BLUE_DARK = '#0E4E85'

type Included = { icon: string; title: string; text: string }

const INCLUDED: Included[] = [
  {
    icon: '🔎',
    title: 'Verificación de tu ruta exacta',
    text: 'Revisamos tu aerolínea y tu país de destino, con la fuente oficial y la fecha. Nada de suposiciones.',
  },
  {
    icon: '📄',
    title: 'Dossier de viaje personalizado (PDF)',
    text: 'Todo tu caso en un solo documento: requisitos, formularios, contactos y pasos, listo para llevar.',
  },
  {
    icon: '📋',
    title: 'Tus documentos, preparados',
    text: 'Dejamos listo tu formulario del DOT y tu checklist de documentos, paso a paso, para tu caso.',
  },
  {
    icon: '🗺️',
    title: 'Itinerario accesible',
    text: 'Hoteles accesibles verificados, áreas de alivio del aeropuerto y tiempos, en un plan claro que puedes seguir.',
  },
  {
    icon: '💬',
    title: 'Soporte prioritario por WhatsApp',
    text: 'Nos escribes antes y durante el viaje y te respondemos rápido. No estás solo en ningún momento.',
  },
  {
    icon: '🛡️',
    title: 'Garantía de tranquilidad',
    text: 'Revisamos y ajustamos hasta que todo quede claro. Tu objetivo es viajar sin sorpresas.',
  },
]

export default async function VipPage() {
  const locale = await getLocale()
  await requireMember(locale)

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      <section
        className="px-5 pt-10 pb-9 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${BLUE}, ${BLUE_DARK})` }}
      >
        <div className="max-w-2xl mx-auto relative z-10">
          <Link href="/dashboard" className="text-white/70 hover:text-white text-sm font-medium">
            ← Inicio
          </Link>
          <div
            className="inline-block mt-3 text-xs font-extrabold px-3 py-1.5 rounded-full"
            style={{ background: 'linear-gradient(90deg,#f9c313,#ffb066)', color: '#3a2a00' }}
          >
            👑 EXPERIENCIA VIP · SOLO MIEMBROS
          </div>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight">
            Tu viaje con tu perro de servicio, planificado por un especialista
          </h1>
          <p className="mt-2 text-white/85">
            Nosotros hacemos todo el trabajo por ti: verificamos tu ruta, preparamos tus documentos y armamos tu
            itinerario. Tú solo viajas tranquilo.
          </p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">$297</span>
            <span className="text-white/80 text-sm">pago único · por viaje</span>
          </div>
        </div>
      </section>

      <section className="px-5 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg font-extrabold mb-4" style={{ color: BLUE_DARK }}>
            Qué incluye tu paquete VIP
          </h2>
          <div className="grid gap-3">
            {INCLUDED.map((it) => (
              <div key={it.title} className="flex gap-3 items-start bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-lg bg-[#eaf3fb]">
                  {it.icon}
                </div>
                <div>
                  <div className="font-bold text-sm">{it.title}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{it.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-800">
            👉 <b>Ideal si</b> tienes un viaje importante pronto, una ruta complicada, o simplemente quieres que
            alguien se encargue de todo por ti.
          </div>
        </div>
      </section>

      <section className="px-5 pb-12">
        <div className="max-w-2xl mx-auto">
          <VipForm />
        </div>
      </section>
    </main>
  )
}
