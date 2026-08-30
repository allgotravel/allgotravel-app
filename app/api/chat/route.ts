import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'
import { MOBILITY_TRAVEL_KB } from '@/lib/alliKnowledge'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MODEL = 'claude-sonnet-4-6'

// ─────────────────────────────────────────────────────────────
// Herramienta: consulta la política oficial verificada de una
// aerolínea. Alli DEBE llamarla antes de responder sobre la
// política de cualquier aerolínea concreta.
// ─────────────────────────────────────────────────────────────
const tools: Anthropic.Tool[] = [
  {
    name: 'lookup_airline_policy',
    description:
      'Consulta la política oficial verificada de una aerolínea específica sobre perros de servicio o sillas de ruedas. Úsala SIEMPRE que el usuario pregunte sobre la política de una aerolínea concreta. Nunca respondas sobre políticas de aerolíneas sin consultar esta herramienta primero. Si no conoces el código IATA exacto, pásalo lo mejor que puedas: la herramienta devolverá la lista de aerolíneas disponibles con su código si no hay coincidencia.',
    input_schema: {
      type: 'object',
      properties: {
        iata_code: {
          type: 'string',
          description: 'Código IATA de 2-3 letras de la aerolínea (ej: AA, AV, DL, CM). También acepta el nombre si no conoces el código.',
        },
        policy_type: {
          type: 'string',
          enum: ['service_animal', 'wheelchair'],
          description: 'Tipo de política a consultar',
        },
      },
      required: ['iata_code', 'policy_type'],
    },
  },
  {
    name: 'lookup_cruise_policy',
    description:
      'Consulta la política oficial verificada de una naviera de cruceros sobre perros de servicio, accesibilidad y movilidad reducida. Úsala SIEMPRE que el usuario pregunte sobre viajar en crucero con perro de servicio, silla de ruedas, movilidad reducida o condiciones especiales. Nunca respondas sobre políticas de cruceros sin consultar esta herramienta primero. Si no conoces el nombre exacto, pásalo lo mejor que puedas: la herramienta devolverá la lista de navieras disponibles si no hay coincidencia.',
    input_schema: {
      type: 'object',
      properties: {
        cruise_line: {
          type: 'string',
          description: 'Nombre o identificador de la naviera (ej: Royal Caribbean, Carnival, NCL, Norwegian, MSC, Princess, Celebrity, Disney, Holland America).',
        },
      },
      required: ['cruise_line'],
    },
  },
]

// ─────────────────────────────────────────────────────────────
// Ejecución de la herramienta contra Supabase.
// Devuelve SIEMPRE datos verificados tal como están en la base:
// campos vacíos se devuelven vacíos (Alli no debe inventarlos).
// ─────────────────────────────────────────────────────────────
async function resolverAerolinea(consulta: string) {
  const term = (consulta || '').trim()
  if (!term) return null

  // 1) Código IATA exacto (case-insensitive)
  const { data: byIata } = await supabaseAdmin
    .from('airlines')
    .select('*')
    .ilike('iata_code', term)
    .limit(1)
  if (byIata && byIata.length) return byIata[0]

  // 2) Nombre (coincidencia parcial)
  const { data: byName } = await supabaseAdmin
    .from('airlines')
    .select('*')
    .ilike('name', `%${term}%`)
    .limit(1)
  if (byName && byName.length) return byName[0]

  return null
}

async function lookupAirlinePolicy(input: { iata_code?: string; policy_type?: string }) {
  const airline = await resolverAerolinea(input.iata_code || '')

  if (!airline) {
    const { data: todas } = await supabaseAdmin
      .from('airlines')
      .select('name, iata_code, status')
      .order('priority')
    return {
      encontrada: false,
      consulta: input.iata_code,
      mensaje:
        'No hay ninguna aerolínea que coincida en la base verificada. Revisa el código o el nombre. Aerolíneas disponibles abajo.',
      aerolineas_en_base: todas ?? [],
    }
  }

  const cerrada = (airline.status || '').toLowerCase().includes('cerr')

  const base: Record<string, unknown> = {
    encontrada: true,
    aerolinea: {
      nombre: airline.name,
      iata: airline.iata_code,
      pais: airline.country,
      region: airline.region,
      estado: airline.status,
      notas: airline.notes,
    },
  }
  if (cerrada) {
    base.aviso =
      'AEROLÍNEA MARCADA COMO CERRADA en la base. No tiene datos de política vigentes; avísalo al usuario.'
  }

  const tipo = input.policy_type
  if (tipo === 'service_animal') {
    const { data } = await supabaseAdmin
      .from('service_animal_policies')
      .select('*')
      .eq('airline_iata', airline.iata_code)
      .limit(1)
    base.politica_perro_servicio = data?.[0] ?? null
  } else if (tipo === 'wheelchair') {
    const { data } = await supabaseAdmin
      .from('wheelchair_policies')
      .select('*')
      .eq('airline_iata', airline.iata_code)
      .limit(1)
    base.politica_silla_ruedas = data?.[0] ?? null
  } else {
    // Sin tipo válido: devolver ambas para que el modelo elija.
    const [{ data: sa }, { data: wc }] = await Promise.all([
      supabaseAdmin.from('service_animal_policies').select('*').eq('airline_iata', airline.iata_code).limit(1),
      supabaseAdmin.from('wheelchair_policies').select('*').eq('airline_iata', airline.iata_code).limit(1),
    ])
    base.politica_perro_servicio = sa?.[0] ?? null
    base.politica_silla_ruedas = wc?.[0] ?? null
  }

  return base
}

// ─────────────────────────────────────────────────────────────
// Cruceros: resuelve la naviera por slug o nombre y devuelve su
// política verificada. Mismos principios: nunca inventar; campos
// vacíos se devuelven vacíos.
// ─────────────────────────────────────────────────────────────
async function resolverCrucero(consulta: string) {
  const term = (consulta || '').trim()
  if (!term) return null

  // 1) slug exacto (case-insensitive)
  const { data: bySlug } = await supabaseAdmin
    .from('cruise_lines')
    .select('*')
    .ilike('slug', term)
    .limit(1)
  if (bySlug && bySlug.length) return bySlug[0]

  // 2) nombre (coincidencia parcial)
  const { data: byName } = await supabaseAdmin
    .from('cruise_lines')
    .select('*')
    .ilike('name', `%${term}%`)
    .limit(1)
  if (byName && byName.length) return byName[0]

  return null
}

async function lookupCruisePolicy(input: { cruise_line?: string }) {
  const linea = await resolverCrucero(input.cruise_line || '')

  if (!linea) {
    const { data: todas } = await supabaseAdmin
      .from('cruise_lines')
      .select('name, slug, status')
      .order('priority')
    return {
      encontrada: false,
      consulta: input.cruise_line,
      mensaje:
        'No hay ninguna naviera que coincida en la base verificada. Revisa el nombre. Navieras disponibles abajo.',
      navieras_en_base: todas ?? [],
    }
  }

  const { data } = await supabaseAdmin
    .from('cruise_accessibility_policies')
    .select('*')
    .eq('cruise_slug', linea.slug)
    .limit(1)

  return {
    encontrada: true,
    naviera: {
      nombre: linea.name,
      slug: linea.slug,
      region: linea.region,
      estado: linea.status,
    },
    politica: data?.[0] ?? null,
  }
}

// ─────────────────────────────────────────────────────────────
// Prompt del sistema de Alli.
// ─────────────────────────────────────────────────────────────
const ALLI_BASE_PROMPT = `Eres Alli, la asistente de viaje de AllGo Travel. Ayudas a personas que viajan
con perros de servicio o con movilidad reducida a entender las políticas
reales de aerolíneas, aeropuertos y navieras de cruceros.

## REGLA PRINCIPAL — NUNCA LA ROMPES

Antes de responder cualquier pregunta sobre la política de una aerolínea
específica (perros de servicio, animales de apoyo emocional, sillas de
ruedas, baterías de litio), DEBES consultar la herramienta lookup_airline_policy.

Antes de responder cualquier pregunta sobre viajar en crucero con perro de
servicio, silla de ruedas, movilidad reducida o condiciones especiales con
una naviera específica (Royal Caribbean, Carnival, NCL/Norwegian, MSC,
Princess, Celebrity, Disney, Holland America, etc.), DEBES consultar la
herramienta lookup_cruise_policy.

No respondas desde tu conocimiento general del modelo. Tu conocimiento
general puede estar desactualizado o ser incorrecto, y una respuesta
equivocada aquí puede hacer que alguien pierda un vuelo o un crucero, o
quede separado de su animal de servicio.

## CRUCEROS — AVISOS QUE SIEMPRE DAS

Cuando ayudes con cruceros y perro de servicio, además del dato de la naviera:
- Recuérdale que para volver a entrar a EE.UU. con el perro aplica la regla
  del CDC vigente desde el 1 de agosto de 2024 (perro con microchip, mínimo
  6 meses de edad, y el CDC Dog Import Form). Aplica también a perros de
  servicio.
- Aclara que el hecho de que la naviera permita subir al perro NO garantiza
  poder bajar en cada puerto: cada país del itinerario tiene sus propias
  reglas. Sugiérele verificar los puertos de su itinerario.
- Ninguna de estas navieras acepta animales de apoyo emocional (ESA); solo
  perros de servicio entrenados.

## FORMATO OBLIGATORIO DE RESPUESTA

Cuando encuentres el dato en la base:
1. Da la respuesta directa y clara
2. Cita la fuente: nombre de la aerolínea + que es su política oficial
3. Cita la fecha de verificación exacta (campo fecha_verificacion) que aparece en la base

Ejemplo:
"American Airlines acepta perros de servicio entrenados. Debes enviar el
formulario del DOT con al menos 48 horas de anticipación a través de su
portal en línea. Fuente: política oficial de American Airlines, verificada
el 3 de agosto de 2026."

## CUANDO NO TIENES EL DATO

Si la aerolínea no está en la base (encontrada: false), o el campo específico
está vacío, en null o marcado como "no publicado":
- Dilo con claridad: "No tengo verificado ese dato para [aerolínea]."
- Ofrece el enlace a la página oficial de la aerolínea si existe en la base (campo url_fuente)
- NUNCA completes el hueco con lo que "sueles saber" sobre aerolíneas en
  general. Un campo vacío en la base significa que no se puede confirmar,
  no que puedas inferirlo.

## LO QUE NUNCA HACES — GUARDARRAÍLES PERMANENTES

- NUNCA afirmes que un animal de apoyo emocional (ESA) vuela gratis o sin
  restricciones. Desde enero de 2021 el DOT ya no obliga a las aerolíneas
  de EE.UU. a tratarlos como animales de servicio. La mayoría los trata
  como mascotas. Si el usuario pregunta por un ESA, acláraselo aunque no
  lo haya preguntado directamente.

- NUNCA promuevas, vendas, valides ni menciones como legítimos los
  "certificados" o "registros" de perros de servicio que se venden en
  internet. No existe un registro oficial de perros de servicio en
  Estados Unidos. Si el usuario pregunta dónde conseguir uno, explica
  que no existe tal registro y que lo que necesita es que el perro esté
  entrenado para tareas específicas relacionadas con su discapacidad.

- NUNCA das consejo médico ni legal. Puedes citar la norma; no
  interpretes cómo aplica al caso médico o legal específico de la
  persona. Si la pregunta requiere eso, sugiere que consulte a un
  profesional o a la aerolínea directamente.

- NUNCA inventes un dato aunque el usuario insista o se muestre
  frustrado. Si no está verificado, no está verificado. Puedes ofrecerte
  a ayudarle a contactar a la aerolínea directamente.

## TONO

Cálido y directo. La persona que te escribe puede estar planeando un
viaje importante o resolviendo algo urgente. No uses lenguaje corporativo
ni evasivo. Si no sabes algo, dilo en una frase, no en un párrafo de
disculpas.

## IDIOMA

Respondes en el idioma en que te escriben. Si la base tiene el dato en
español e inglés, usa la versión del idioma de la conversación. Si solo
existe en un idioma, tradúcelo tú y acláralo: "Esto es una traducción de
la política oficial en inglés."`

function buildSystemPrompt(profile: Profile | null, locale: string, hoy: string): string {
  const parts: string[] = [ALLI_BASE_PROMPT, MOBILITY_TRAVEL_KB, '', `Fecha de hoy: ${hoy}.`]

  if (!profile) return parts.join('\n')

  parts.push('')
  if (locale === 'en') {
    parts.push(`## Traveler profile`)
    if (profile.full_name) parts.push(`- Name: ${profile.full_name}`)
    if (profile.disability_types?.length)
      parts.push(`- Disability types: ${profile.disability_types.join(', ')}`)
    if (profile.chronic_conditions)
      parts.push(`- Chronic / invisible conditions: ${profile.chronic_conditions}`)
    if (profile.invisible_needs)
      parts.push(`- Invisible needs: ${profile.invisible_needs}`)
    if (profile.medications?.length) {
      parts.push(`- Medications: ${profile.medications.map(m => `${m.name} ${m.dose} at ${m.times.join(', ')}`).join('; ')}`)
    }
    if (profile.is_group_profile && profile.group_members?.length) {
      const members = profile.group_members.map(m => `${m.name}${m.age ? ` (${m.age}y)` : ''}: ${m.disability_types.join(', ')}`).join('; ')
      parts.push(`- Traveling as a group: ${members}`)
    }
    parts.push(`\nTake these accessibility needs into account in every recommendation.`)
  } else {
    parts.push(`## Perfil del viajero`)
    if (profile.full_name) parts.push(`- Nombre: ${profile.full_name}`)
    if (profile.disability_types?.length)
      parts.push(`- Tipos de discapacidad: ${profile.disability_types.join(', ')}`)
    if (profile.chronic_conditions)
      parts.push(`- Condiciones crónicas/invisibles: ${profile.chronic_conditions}`)
    if (profile.invisible_needs)
      parts.push(`- Necesidades invisibles: ${profile.invisible_needs}`)
    if (profile.medications?.length) {
      parts.push(`- Medicamentos: ${profile.medications.map(m => `${m.name} ${m.dose} a las ${m.times.join(', ')}`).join('; ')}`)
    }
    if (profile.is_group_profile && profile.group_members?.length) {
      const members = profile.group_members.map(m => `${m.name}${m.age ? ` (${m.age} años)` : ''}: ${m.disability_types.join(', ')}`).join('; ')
      parts.push(`- Viaja en grupo: ${members}`)
    }
    parts.push(`\nTen en cuenta estas necesidades en cada recomendación.`)
  }

  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, userId, locale = 'es' } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    // Perfil del usuario para contexto (opcional).
    let profile: Profile | null = null
    if (userId) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      profile = data
    }

    // Alli es una función de miembros. Defensa en el servidor (la UI ya está protegida).
    const isDev = process.env.NODE_ENV === 'development'
    const subStatus = (profile as { subscription_status?: string } | null)?.subscription_status
    if (!isDev && subStatus && subStatus !== 'active') {
      return NextResponse.json({ error: 'membership_required' }, { status: 403 })
    }

    const hoy = new Date().toISOString().slice(0, 10)
    const systemPrompt = buildSystemPrompt(profile, locale, hoy)

    // Historial de la conversación en formato de la API.
    const convo: Anthropic.MessageParam[] = messages.map(
      (m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })
    )

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        let assistantText = ''
        try {
          // Loop de tool-use: se repite mientras el modelo pida herramientas.
          // Cada turno se transmite en streaming; el turno final es la
          // respuesta al usuario.
          // Límite de seguridad para no ciclar indefinidamente.
          for (let turno = 0; turno < 5; turno++) {
            const stream = anthropic.messages.stream({
              model: MODEL,
              max_tokens: 1500,
              system: systemPrompt,
              tools,
              messages: convo,
            })

            for await (const chunk of stream) {
              if (
                chunk.type === 'content_block_delta' &&
                chunk.delta.type === 'text_delta'
              ) {
                assistantText += chunk.delta.text
                controller.enqueue(encoder.encode(chunk.delta.text))
              }
            }

            const final = await stream.finalMessage()

            if (final.stop_reason === 'tool_use') {
              const toolUses = final.content.filter(
                (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
              )
              const toolResults: Anthropic.ToolResultBlockParam[] = []
              for (const tu of toolUses) {
                let result: unknown
                try {
                  if (tu.name === 'lookup_airline_policy') {
                    result = await lookupAirlinePolicy(tu.input as { iata_code?: string; policy_type?: string })
                  } else if (tu.name === 'lookup_cruise_policy') {
                    result = await lookupCruisePolicy(tu.input as { cruise_line?: string })
                  } else {
                    result = { error: `Herramienta desconocida: ${tu.name}` }
                  }
                } catch (e) {
                  result = { error: 'Error al consultar la base de datos', detalle: String(e) }
                }
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: tu.id,
                  content: JSON.stringify(result),
                })
              }
              convo.push({ role: 'assistant', content: final.content })
              convo.push({ role: 'user', content: toolResults })
              continue // siguiente turno
            }

            break // el modelo entregó la respuesta final
          }
        } catch (err) {
          console.error('[/api/chat stream]', err)
          if (!assistantText) {
            controller.enqueue(
              encoder.encode(
                locale === 'en'
                  ? 'Sorry, something went wrong. Please try again.'
                  : 'Lo siento, algo salió mal. Intenta de nuevo.'
              )
            )
          }
        } finally {
          controller.close()
        }

        // Persistencia best-effort (no debe romper la respuesta).
        if (userId && assistantText) {
          try {
            await supabaseAdmin.from('conversations').insert([
              { user_id: userId, role: 'user', content: messages[messages.length - 1]?.content ?? '' },
              { user_id: userId, role: 'assistant', content: assistantText },
            ])
          } catch (e) {
            console.error('[/api/chat persist]', e)
          }
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Conversation-Id': conversationId ?? '',
      },
    })
  } catch (err) {
    console.error('[/api/chat]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
