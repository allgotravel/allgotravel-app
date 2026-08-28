import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import PlanButton from './PlanButton'

export const dynamic = 'force-dynamic'

const BLUE = '#1B6FB5'
const BLUE_DARK = '#0E4E85'
const ORANGE = '#F97316'
const FOUNDING_LIMIT = 50

// Suscripción "Membresía AllGo Travel" — Hotmart producto Q107023060D
const HOTMART = {
  founding: 'https://pay.hotmart.com/Q107023060D?off=osgbatei', // plan FUNDADOR $14.99/mes (50% OFF)
  monthly: 'https://pay.hotmart.com/Q107023060D?off=zk0d9b2e',
  annual: 'https://pay.hotmart.com/Q107023060D?off=2nx7unav',
}

const ANNUAL_ENABLED: boolean = true

async function getFoundingRemaining(): Promise<number> {
  try {
    const supa = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { count } = await supa
      .from('memberships')
      .select('*', { count: 'exact', head: true })
      .eq('plan_type', 'founding')
      .eq('status', 'active')
    return Math.max(0, FOUNDING_LIMIT - (count ?? 0))
  } catch {
    return FOUNDING_LIMIT
  }
}

function Check() {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white text-sm font-bold"
      style={{ backgroundColor: BLUE }}
    >
      ✓
    </span>
  )
}
function Cross() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-400 text-sm font-bold">
      –
    </span>
  )
}

const COMPARISON: { label: string; free: React.ReactNode; member: React.ReactNode }[] = [
  { label: 'Directorio de aerolíneas', free: <span className="text-gray-500 text-sm">3 de muestra</span>, member: <span className="font-semibold" style={{ color: BLUE }}>Las 25, verificadas</span> },
  { label: 'Ebook «Viaja con tu Perro de Servicio»', free: <Check />, member: <Check /> },
  { label: 'Service Dog Travel Hub (7 módulos)', free: <Cross />, member: <Check /> },
  { label: 'Alli, tu asistente de viaje', free: <span className="text-gray-500 text-sm">Limitada</span>, member: <span className="font-semibold" style={{ color: BLUE }}>Ilimitada</span> },
  { label: 'Formularios y documentos descargables', free: <Cross />, member: <Check /> },
  { label: 'Alertas de cambios de política', free: <Cross />, member: <Check /> },
]

export default async function MembresiaPage() {
  const remaining = await getFoundingRemaining()
  const foundingOpen = remaining > 0

  return (
    <main className="min-h-screen bg-[#f5f8f8] text-[#16292b]">
      {/* Hero */}
      <section
        className="px-5 pt-14 pb-24 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE_DARK})` }}
      >
        <Image
          src="/logo-allgo.jpg"
          alt="AllGo Travel"
          width={72}
          height={72}
          className="rounded-full mx-auto mb-5"
        />
        <p className="text-sm font-semibold tracking-wide" style={{ color: ORANGE }}>
          MEMBRESÍA ALLGO TRAVEL
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold leading-tight max-w-2xl mx-auto">
          Viaja con tu perro de servicio, sin adivinar nada
        </h1>
        <p className="mt-4 text-white/80 max-w-xl mx-auto">
          Acceso completo al directorio verificado de 25 aerolíneas, el Service Dog
          Travel Hub y Alli sin límites. Cada dato con su fuente oficial y su fecha.
        </p>

        {foundingOpen && (
          <div
            className="inline-flex items-center gap-2 mt-6 rounded-full px-5 py-2 text-sm font-bold"
            style={{ backgroundColor: ORANGE, color: BLUE_DARK }}
          >
            🔥 Cupos founding limitados
          </div>
        )}
      </section>

      {/* Planes */}
      <section className="px-5 -mt-16 pb-4">
        <div className={`mx-auto grid gap-5 ${ANNUAL_ENABLED ? 'max-w-4xl sm:grid-cols-3' : 'max-w-2xl sm:grid-cols-2'}`}>
          {/* Founding */}
          {foundingOpen && (
            <div
              className="relative rounded-2xl bg-white p-6 shadow-lg flex flex-col"
              style={{ border: `2px solid ${ORANGE}` }}
            >
              <h3 className="text-lg font-extrabold" style={{ color: BLUE }}>Fundador</h3>
              <p className="mt-1 text-xs text-gray-500">50% OFF · precio congelado, por tiempo limitado</p>
              <div className="mt-4">
                <span className="text-lg font-bold text-gray-400 line-through mr-1">$29</span>
                <span className="text-4xl font-extrabold">$14.99</span>
                <span className="text-gray-500">/mes</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
                <li>✅ Todo el acceso MEMBER</li>
                <li>✅ Precio congelado de fundador</li>
                <li>✅ Insignia de miembro fundador</li>
              </ul>
              <PlanButton
                href={HOTMART.founding}
                label="Unirme ahora →"
                plan="founding"
                value={14.99}
                className="allgo-tap allgo-cta mt-5 block rounded-full py-3 text-center font-bold text-white hover:opacity-90"
                style={{ backgroundColor: ORANGE }}
              />
            </div>
          )}

          {/* Mensual */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-extrabold" style={{ color: BLUE }}>Mensual</h3>
            <p className="mt-1 text-xs text-gray-500">Flexible, cancela cuando quieras</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">$29</span>
              <span className="text-gray-500">/mes</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
              <li>✅ Acceso completo MEMBER</li>
              <li>✅ Sin permanencia</li>
            </ul>
            <PlanButton
              href={HOTMART.monthly}
              label="Elegir mensual"
              plan="monthly"
              value={29}
              className="allgo-tap mt-5 block rounded-full py-3 text-center font-bold border hover:bg-gray-50"
              style={{ borderColor: BLUE, color: BLUE }}
            />
          </div>

          {/* Anual */}
          {ANNUAL_ENABLED && (
          <div
            className="relative rounded-2xl bg-white p-6 shadow-sm flex flex-col"
            style={{ border: `2px solid ${BLUE}` }}
          >
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold text-white whitespace-nowrap"
              style={{ backgroundColor: BLUE }}
            >
              Mejor valor
            </div>
            <h3 className="text-lg font-extrabold" style={{ color: BLUE }}>Anual</h3>
            <p className="mt-1 text-xs font-semibold" style={{ color: ORANGE }}>Ahorra $58 = 2 meses gratis</p>
            <div className="mt-4">
              <span className="text-4xl font-extrabold">$290</span>
              <span className="text-gray-500">/año</span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-gray-700 flex-1">
              <li>✅ Acceso completo MEMBER</li>
              <li>✅ Equivale a ~$24/mes</li>
              <li>✅ 2 meses gratis vs mensual</li>
            </ul>
            <PlanButton
              href={HOTMART.annual}
              label="Elegir anual →"
              plan="annual"
              value={290}
              className="allgo-tap allgo-cta mt-5 block rounded-full py-3 text-center font-bold text-white hover:opacity-90"
              style={{ backgroundColor: ORANGE }}
            />
          </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Pago seguro con Hotmart · Cancela cuando quieras
        </p>
      </section>

      {/* Comparativa FREE vs MEMBER */}
      <section className="px-5 py-12">
        <h2 className="text-center text-2xl font-extrabold" style={{ color: BLUE }}>
          Qué incluye cada nivel
        </h2>
        <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
          <div className="grid grid-cols-[1fr_90px_110px] items-center px-5 py-4" style={{ backgroundColor: BLUE, color: 'white' }}>
            <span className="text-sm font-bold">Beneficio</span>
            <span className="text-center text-sm font-bold">Free</span>
            <span className="text-center text-sm font-bold" style={{ color: ORANGE }}>Member</span>
          </div>
          {COMPARISON.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_90px_110px] items-center px-5 py-4 border-t border-gray-100"
            >
              <span className="text-sm text-gray-800 pr-2">{row.label}</span>
              <span className="flex justify-center">{row.free}</span>
              <span className="flex justify-center">{row.member}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Cierre de confianza */}
      <section className="px-5 pb-16 text-center">
        <p className="mx-auto max-w-xl text-sm text-gray-600">
          Cada política se verifica en la fuente oficial de la aerolínea o la
          autoridad, con su fecha. Nunca inventamos un dato: si no está verificado,
          te lo decimos.
        </p>
        {foundingOpen && (
          <p className="mt-4 text-sm font-bold" style={{ color: BLUE }}>
            Los cupos founding se agotan pronto. Asegura tu precio de fundador.
          </p>
        )}
      </section>
    </main>
  )
}
