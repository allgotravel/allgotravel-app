import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'
import { getSessionUser, checkRateLimit } from '@/lib/apiGuard'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Diagnóstico de viaje corto y sin afirmaciones no verificadas (sin hoteles, sin plazos concretos).
// Se arma con reglas a partir del perfil; no usa IA ni gasta saldo de Anthropic.
type Status = 'ok' | 'warn'
interface Item { area: string; status: Status; note: string }

function buildDiagnosis(profile: Profile | null, destination: string, en: boolean) {
  // disability_types guarda también 'animal_servicio' (opción del onboarding), aunque no esté en el tipo.
  const types = new Set<string>([
    ...((profile?.disability_types ?? []) as string[]),
    ...((profile?.group_members ?? []).flatMap(m => (m.disability_types ?? []) as string[])),
  ])
  const serviceDog = (profile as { service_dog?: { has?: boolean } } | null)?.service_dog
  const dog = types.has('animal_servicio') || !!serviceDog?.has
  const mobility = types.has('motriz') || types.has('mixta')
  const sensory = ['autismo', 'cognitiva', 'cronica_invisible', 'visual', 'auditiva'].some(t => types.has(t))
  const hasMeds = (profile?.medications?.length ?? 0) > 0 || !!profile?.chronic_conditions

  const items: Item[] = [
    {
      area: en ? 'Service dog requirements' : 'Requisitos de perro de servicio',
      status: dog ? 'warn' : 'ok',
      note: dog
        ? (en ? 'Forms and rules from your airline and your destination to review before flying.' : 'Formularios y reglas de tu aerolínea y de tu destino que debes revisar antes de volar.')
        : (en ? 'Does not apply to your profile.' : 'No aplica a tu perfil.'),
    },
    {
      area: en ? 'Airport assistance' : 'Asistencia en el aeropuerto',
      status: mobility || sensory ? 'warn' : 'ok',
      note: mobility || sensory
        ? (en ? 'Assistance to request in advance and confirm in writing.' : 'Asistencia que conviene pedir con anticipación y confirmar por escrito.')
        : (en ? 'No special assistance in your profile.' : 'Tu perfil no indica asistencia especial.'),
    },
    {
      area: en ? 'Documentation' : 'Documentación',
      status: 'warn',
      note: hasMeds
        ? (en ? 'Travel, health and medication documents to have ready.' : 'Documentos de viaje, de salud y de tus medicinas que debes tener listos.')
        : (en ? 'Travel documents to check before you leave.' : 'Documentos de viaje que debes revisar antes de salir.'),
    },
    {
      area: en ? `Accessibility in ${destination}` : `Accesibilidad en ${destination}`,
      status: 'warn',
      note: en ? 'Lodging and activities to confirm before booking.' : 'Alojamiento y actividades que conviene confirmar antes de reservar.',
    },
    {
      area: en ? 'Transport' : 'Transporte',
      status: mobility ? 'warn' : 'ok',
      note: mobility
        ? (en ? 'Accessible transfers to request before arriving.' : 'Traslados accesibles que conviene pedir antes de llegar.')
        : (en ? 'No special transport needs in your profile.' : 'Tu perfil no indica necesidades de transporte especiales.'),
    },
  ]

  return {
    title: en ? `Your trip diagnosis for ${destination}` : `Tu diagnóstico de viaje a ${destination}`,
    items,
    tema: dog ? 'perro' : 'movilidad',
  }
}

export async function POST(req: NextRequest) {
  try {
    // Solo con sesión. El usuario sale SIEMPRE de la sesión del servidor, nunca del body.
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'auth_required' }, { status: 401 })
    }

    const { destination, startDate, endDate, locale = 'es' } = await req.json()

    if (!destination || !startDate || !endDate) {
      return NextResponse.json({ error: 'destination, startDate and endDate required' }, { status: 400 })
    }

    const { data: profileData } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
    const profile: Profile | null = profileData

    // Función de miembros (igual que la página). Sin perfil o sin suscripción activa = no miembro.
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev && (profile as { subscription_status?: string } | null)?.subscription_status !== 'active') {
      return NextResponse.json({ error: 'membership_required' }, { status: 403 })
    }

    // Límite por persona: 5 al día.
    if (!(await checkRateLimit(user.id, 'planificador', 5, 24 * 60 * 60 * 1000))) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }

    const dest = String(destination).trim().slice(0, 80)
    return NextResponse.json(buildDiagnosis(profile, dest, locale === 'en'))
  } catch (err) {
    console.error('[/api/planificador]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
