import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'
import { getSessionUser, checkRateLimit } from '@/lib/apiGuard'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildPlanPrompt(
  profile: Profile | null,
  destination: string,
  startDate: string,
  endDate: string,
  tripType: string,
  locale: string
): string {
  const isES = locale !== 'en'

  if (isES) {
    let groupContext = ''
    if (profile?.is_group_profile && profile.group_members?.length) {
      const members = profile.group_members
        .map(m => {
          const needs = m.disability_types.length ? m.disability_types.join(', ') : 'sin necesidades especiales'
          return `• ${m.name}${m.age ? ` (${m.age} años)` : ''}: ${needs}`
        })
        .join('\n')
      groupContext = `\n\nMIEMBROS DEL GRUPO:\n${members}`
    }

    const travelerNeeds = [
      profile?.disability_types?.length && `Necesidades: ${profile.disability_types.join(', ')}`,
      profile?.chronic_conditions && `Condiciones crónicas: ${profile.chronic_conditions}`,
      profile?.invisible_needs && `Necesidades invisibles: ${profile.invisible_needs}`,
      profile?.medications?.length && `Medicamentos: ${profile.medications.map(m => `${m.name} ${m.dose}`).join(', ')}`,
    ].filter(Boolean).join('\n')

    return `Eres un experto en turismo accesible. Genera un plan de viaje detallado y práctico para el siguiente grupo.

DESTINO: ${destination}
FECHAS: ${startDate} al ${endDate}
TIPO DE VIAJE: ${tripType}
${travelerNeeds ? `\nNECESIDADES DEL TITULAR:\n${travelerNeeds}` : ''}${groupContext}

Crea un plan de viaje estructurado que:
1. Tenga en cuenta TODAS las necesidades de accesibilidad de cada miembro
2. Sugiera alojamiento accesible específico (con criterios concretos de accesibilidad)
3. Proponga actividades compatibles con el grupo completo
4. Incluya transporte accesible (cómo llegar y moverse allí)
5. Dé consejos específicos por necesidad (ej: qué pedir en el hotel, apps útiles, documentos)
6. Incluya un día a día organizado por fechas

Formato: usa encabezados claros (##), listas con guion, y resalta en **negrita** la información crítica de accesibilidad.`
  }

  let groupContext = ''
  if (profile?.is_group_profile && profile.group_members?.length) {
    const members = profile.group_members
      .map(m => {
        const needs = m.disability_types.length ? m.disability_types.join(', ') : 'no special needs'
        return `• ${m.name}${m.age ? ` (${m.age}y)` : ''}: ${needs}`
      })
      .join('\n')
    groupContext = `\n\nGROUP MEMBERS:\n${members}`
  }

  const travelerNeeds = [
    profile?.disability_types?.length && `Disabilities: ${profile.disability_types.join(', ')}`,
    profile?.chronic_conditions && `Chronic conditions: ${profile.chronic_conditions}`,
    profile?.invisible_needs && `Invisible needs: ${profile.invisible_needs}`,
    profile?.medications?.length && `Medications: ${profile.medications.map(m => `${m.name} ${m.dose}`).join(', ')}`,
  ].filter(Boolean).join('\n')

  return `You are an expert in accessible tourism. Generate a detailed, practical travel plan for the following group.

DESTINATION: ${destination}
DATES: ${startDate} to ${endDate}
TRIP TYPE: ${tripType}
${travelerNeeds ? `\nPRIMARY TRAVELER NEEDS:\n${travelerNeeds}` : ''}${groupContext}

Create a structured travel plan that:
1. Takes into account ALL accessibility needs of each member
2. Suggests specific accessible accommodation (with concrete accessibility criteria)
3. Proposes activities compatible with the whole group
4. Includes accessible transport (how to get there and get around)
5. Gives specific tips per need (e.g. what to request at the hotel, useful apps, documents)
6. Includes a day-by-day itinerary organized by date

Format: use clear headings (##), dash lists, and **bold** critical accessibility information.`
}

export async function POST(req: NextRequest) {
  try {
    // Solo con sesión. El usuario sale SIEMPRE de la sesión del servidor, nunca del body.
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'auth_required' }, { status: 401 })
    }

    const { destination, startDate, endDate, tripType, locale = 'es' } = await req.json()

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

    const prompt = buildPlanPrompt(profile, destination, startDate, endDate, tripType, locale)

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[/api/planificador]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
