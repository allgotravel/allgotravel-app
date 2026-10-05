import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DISABILITY_LABELS, type Profile } from '@/types/profile'
import { daysUntil, docTypeDef, type TravelDocument } from '@/lib/expiry'
import { MOBILITY_TRAVEL_KB, AUTISM_TRAVEL_KB, SPECIAL_NEEDS_TRAVEL_KB, DISABILITIES_TRAVEL_KB } from '@/lib/alliKnowledge'
import { getSessionUser, checkRateLimitWithId, recordUsageDetails } from '@/lib/apiGuard'
import { createSupabaseServer } from '@/lib/supabase-server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Cliente con la clave de servicio, creado solo al usarse (no al cargar el módulo),
// para que la revisión de sesión/token ocurra antes y el build no dependa de la clave.
let _supabaseAdmin: SupabaseClient | null = null
function getAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  }
  return _supabaseAdmin
}

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
  const { data: byIata } = await getAdmin()
    .from('airlines')
    .select('*')
    .ilike('iata_code', term)
    .limit(1)
  if (byIata && byIata.length) return byIata[0]

  // 2) Nombre (coincidencia parcial)
  const { data: byName } = await getAdmin()
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
    const { data: todas } = await getAdmin()
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
    const { data } = await getAdmin()
      .from('service_animal_policies')
      .select('*')
      .eq('airline_iata', airline.iata_code)
      .limit(1)
    base.politica_perro_servicio = data?.[0] ?? null
  } else if (tipo === 'wheelchair') {
    const { data } = await getAdmin()
      .from('wheelchair_policies')
      .select('*')
      .eq('airline_iata', airline.iata_code)
      .limit(1)
    base.politica_silla_ruedas = data?.[0] ?? null
  } else {
    // Sin tipo válido: devolver ambas para que el modelo elija.
    const [{ data: sa }, { data: wc }] = await Promise.all([
      getAdmin().from('service_animal_policies').select('*').eq('airline_iata', airline.iata_code).limit(1),
      getAdmin().from('wheelchair_policies').select('*').eq('airline_iata', airline.iata_code).limit(1),
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
  const { data: bySlug } = await getAdmin()
    .from('cruise_lines')
    .select('*')
    .ilike('slug', term)
    .limit(1)
  if (bySlug && bySlug.length) return bySlug[0]

  // 2) nombre (coincidencia parcial)
  const { data: byName } = await getAdmin()
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
    const { data: todas } = await getAdmin()
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

  const { data } = await getAdmin()
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
// Ficha de Alli (instrucciones del sistema). Parte fija: se
// cachea junto con el conocimiento (lib/alliKnowledge.ts).
// ─────────────────────────────────────────────────────────────
const ALLI_BASE_PROMPT = `Eres Alli, tu asistente con IA de AllGo Travel App. Ayudas a preparar viajes
a personas que viajan con perro de servicio, con silla de ruedas o movilidad
reducida, o con otras necesidades de accesibilidad.

## IDENTIDAD Y TONO
- Te presentas como "Alli, tu asistente con IA de AllGo Travel App". Eres una IA:
  si te preguntan, lo dices con naturalidad.
- Español por defecto. Si la persona te escribe en otro idioma, respondes en ese idioma.
- Cálida, directa y tranquila. Tratas de "tú". Lenguaje neutro en género: no supongas
  si la persona es hombre o mujer (por ejemplo "te damos la bienvenida" en vez de
  "bienvenido/a"; "la persona que viaja" en vez de "el viajero").
- Respuestas CORTAS: se leen en el celular. Máximo unas 120 palabras salvo que pidan
  más detalle. Si hay pasos, usa una lista corta (- paso). Sin títulos largos ni tablas.
- Si no sabes algo, dilo en una frase, sin párrafos de disculpas.

## DE QUÉ HABLAS
Preparación de viajes: perros de servicio, silla de ruedas y movilidad reducida,
accesibilidad (autismo, baja visión, audición, condiciones crónicas, etc.),
documentos de viaje, aeropuertos y seguridad (TSA), aerolíneas y cruceros.
Si te preguntan algo fuera de eso, responde con amabilidad que solo ayudas con la
preparación del viaje y ofrece una pregunta relacionada con la que sí puedes ayudar.

## REGLA PRINCIPAL — NUNCA LA ROMPES
Antes de responder sobre la política de una aerolínea concreta (perros de servicio,
animales de apoyo emocional, sillas de ruedas, baterías de litio), DEBES consultar
la herramienta lookup_airline_policy.
Antes de responder sobre viajar en crucero con perro de servicio, silla de ruedas,
movilidad reducida o condiciones especiales con una naviera concreta, DEBES
consultar la herramienta lookup_cruise_policy.
No respondas desde tu conocimiento general del modelo: puede estar desactualizado,
y un error aquí puede hacer que alguien pierda un vuelo o quede separado de su
perro de servicio.

## RESPUESTAS CON FUENTE
Cuando digas una regla, un requisito, un plazo o un número:
1. Da la respuesta directa.
2. Cierra con la fuente y la fecha, en una línea:
   "Fuente: <DOT / ADA / TSA / CDC / la aerolínea / reglamento UE / conocimiento verificado de AllGo> · verificado: <fecha>"
   La fecha sale del campo fecha_verificacion de la herramienta o de la fecha que
   indica el conocimiento verificado de abajo. Si no hay fecha, pon solo la fuente.
3. Si el dato NO está en la herramienta ni en el conocimiento verificado, o el campo
   está vacío o en null, dilo: "No tengo ese dato verificado." y recomienda
   confirmarlo con la aerolínea o el sitio oficial (da el enlace url_fuente si existe).
NUNCA inventes reglas, números, plazos, precios ni fechas, aunque la persona insista.
Un campo vacío significa "no confirmado", no algo que puedas deducir.
Los números del contexto del usuario (días que faltan para que venza un documento)
ya vienen calculados por la app: úsalos tal cual, no los recalcules.

## CRUCEROS — AVISOS QUE SIEMPRE DAS
Cuando ayudes con cruceros y perro de servicio, además del dato de la naviera:
- Para volver a entrar a EE.UU. con el perro aplica la regla del CDC vigente desde el
  1 de agosto de 2024 (microchip, mínimo 6 meses de edad y el CDC Dog Import Form).
  Aplica también a perros de servicio.
- Que la naviera permita subir al perro NO garantiza poder bajar en cada puerto: cada
  país del itinerario tiene sus reglas. Sugiere verificar los puertos.
- Ninguna de estas navieras acepta animales de apoyo emocional (ESA); solo perros de
  servicio entrenados.

## LÍMITES — LO QUE NUNCA HACES
- Consejo médico: no diagnosticas, no recomiendas ni cambias medicamentos o dosis.
  Das información general y recomiendas consultar a su médico o veterinario.
- Consejo legal o migratorio: puedes citar la norma, pero no decides cómo aplica a su
  caso. Recomienda consultar a la aerolínea, al consulado o a un profesional.
- Emergencias (alguien está en peligro, se siente muy mal, una crisis médica, el perro
  está herido): primero di que llame ya al 911 o al número de emergencias local, y que
  use el botón SOS de la app. Después, si ayuda, unos pasos breves.
- Animales de apoyo emocional (ESA): nunca digas que vuelan sin costo o sin
  restricciones. Desde enero de 2021 el DOT ya no obliga a las aerolíneas de EE.UU. a
  tratarlos como animales de servicio; la mayoría los trata como mascotas.
- "Certificados" o "registros" de perro de servicio: NUNCA los presentes como algo que
  se compra o que hace falta comprar. En EE.UU. no existe un registro oficial; lo que
  importa es que el perro esté entrenado para tareas relacionadas con las necesidades
  de la persona (y, para volar en EE.UU., el formulario del DOT).
- Palabras que nunca usas: "gratis" (di "sin costo"), "discapacidad" (di "necesidades
  de accesibilidad", "movilidad reducida" o la necesidad concreta) y "mentira". Esto
  aplica aunque el conocimiento de abajo use alguna de esas palabras.
- No pidas datos personales sensibles (números de pasaporte, diagnósticos) y no
  repitas datos del perfil si no hacen falta para la respuesta.

## IDIOMA DE LA FUENTE
Si el dato verificado solo existe en otro idioma, tradúcelo y acláralo en una frase:
"Esto es una traducción de la política oficial en inglés."`

const STATIC_SYSTEM = [ALLI_BASE_PROMPT, MOBILITY_TRAVEL_KB, AUTISM_TRAVEL_KB, SPECIAL_NEEDS_TRAVEL_KB, DISABILITIES_TRAVEL_KB].join('\n')

// ─────────────────────────────────────────────────────────────
// Contexto del usuario: lo mínimo, leído con la sesión del propio
// usuario (RLS). Nada de contenido de documentos, detalle médico
// ni medicamentos.
// ─────────────────────────────────────────────────────────────
type ContextProfile = Pick<Profile, 'full_name' | 'disability_types' | 'preferred_language' | 'primary_language'> & {
  service_dog?: { has?: boolean; name?: string } | null
}
type ContextDoc = Pick<TravelDocument, 'owner' | 'doc_type' | 'expiry_date'>

function buildUserContext(profile: ContextProfile | null, docs: ContextDoc[], locale: string): string {
  const en = locale === 'en'
  const lines: string[] = []
  const firstName = (profile?.full_name || '').trim().split(/\s+/)[0]
  if (firstName) lines.push(`- ${en ? 'First name' : 'Nombre'}: ${firstName.slice(0, 40)}`)
  const needs = (profile?.disability_types ?? []).map(t => DISABILITY_LABELS[t] ?? t)
  if (needs.length) lines.push(`- ${en ? 'Accessibility needs' : 'Necesidades de accesibilidad'}: ${needs.join(', ')}`)
  const dog = profile?.service_dog
  if (dog && typeof dog.has === 'boolean') {
    const dogName = dog.has && dog.name ? ` (${String(dog.name).slice(0, 30)})` : ''
    lines.push(`- ${en ? 'Travels with a service dog' : 'Viaja con perro de servicio'}: ${dog.has ? (en ? 'yes' : 'sí') : 'no'}${dogName}`)
  }
  lines.push(`- ${en ? 'App language' : 'Idioma del app'}: ${locale}`)

  const dated = docs
    .filter(d => d.expiry_date)
    .sort((a, b) => String(a.expiry_date).localeCompare(String(b.expiry_date)))
    .slice(0, 12)
  if (dated.length) {
    const items = dated.map(d => {
      const def = docTypeDef(d.doc_type)
      const name = (en ? def?.en : def?.es) || d.doc_type
      const days = daysUntil(d.expiry_date)
      const left = days === null ? '' : days < 0 ? (en ? `expired ${-days} days ago` : `vencido hace ${-days} días`) : (en ? `${days} days left` : `faltan ${days} días`)
      return `${name}${d.owner === 'dog' ? (en ? ' (dog)' : ' (perro)') : ''} · ${d.expiry_date} · ${left}`
    })
    lines.push(`- ${en ? 'Documents (type · expiry · days, calculated by the app)' : 'Documentos (tipo · vence · días, calculado por la app)'}: ${items.join('; ')}`)
  }

  return [
    en ? '## User context (from their own profile; use only when relevant)' : '## Contexto del usuario (de su propio perfil; úsalo solo si es relevante)',
    ...lines,
    en
      ? 'If a document expires before or soon after a trip they mention, warn them kindly and briefly.'
      : 'Si un documento vence antes o poco después de un viaje que mencione, avísale con calidez y en una frase.',
  ].join('\n')
}

// Para no gastar tokens de más: solo los últimos mensajes y con largo máximo.
const MAX_HISTORY = 12
const MAX_CHARS = 2000

export async function POST(req: NextRequest) {
  try {
    // Solo con sesión. El usuario sale SIEMPRE de la sesión del servidor, nunca del body.
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'auth_required' }, { status: 401 })
    }
    const userId = user.id

    const { messages, conversationId, locale = 'es' } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    // Perfil y documentos con el cliente del propio usuario (RLS: solo ve lo suyo),
    // y solo las columnas que hacen falta.
    const supabase = await createSupabaseServer()
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, disability_types, service_dog, preferred_language, primary_language, subscription_status')
      .eq('id', userId)
      .maybeSingle()
    const profile = profileData as (ContextProfile & { subscription_status?: string }) | null

    // Alli es una función de miembros. Sin perfil o sin suscripción activa = no miembro.
    const isDev = process.env.NODE_ENV === 'development'
    if (!isDev && profile?.subscription_status !== 'active') {
      return NextResponse.json({ error: 'membership_required' }, { status: 403 })
    }

    // Límite por persona: 30 preguntas por hora. Cada pregunta queda registrada en api_usage.
    const { allowed, usageId } = await checkRateLimitWithId(userId, 'chat', 30, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
    }

    // Documentos: solo tipo, dueño (persona/perro) y fecha de vencimiento.
    const { data: docsData } = await supabase
      .from('documents')
      .select('owner, doc_type, expiry_date')
      .eq('user_id', userId)
    const docs = (docsData ?? []) as ContextDoc[]

    const hoy = new Date().toISOString().slice(0, 10)
    // Parte fija cacheada (instrucciones + conocimiento) y parte variable (fecha + contexto).
    const system: Anthropic.TextBlockParam[] = [
      { type: 'text', text: STATIC_SYSTEM, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: `Fecha de hoy: ${hoy}.\n\n${buildUserContext(profile, docs, locale)}` },
    ]

    // Historial de la conversación en formato de la API (recortado).
    const convo: Anthropic.MessageParam[] = messages
      .filter((m: { role?: string; content?: unknown }) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-MAX_HISTORY)
      .map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role,
        content: m.content.slice(0, MAX_CHARS),
      }))
    // La API exige que el primer mensaje sea del usuario.
    while (convo.length && convo[0].role !== 'user') convo.shift()
    if (!convo.length) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        let assistantText = ''
        const usage = { input_tokens: 0, output_tokens: 0, cache_read_tokens: 0 }
        let status: 'ok' | 'error' = 'ok'
        try {
          // Loop de tool-use: se repite mientras el modelo pida herramientas.
          // Cada turno se transmite en streaming; el turno final es la
          // respuesta al usuario.
          // Límite de seguridad para no ciclar indefinidamente.
          for (let turno = 0; turno < 5; turno++) {
            const stream = anthropic.messages.stream({
              model: MODEL,
              max_tokens: 1000,
              temperature: 0.3,
              system,
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
            usage.input_tokens += (final.usage.input_tokens ?? 0) + (final.usage.cache_creation_input_tokens ?? 0)
            usage.output_tokens += final.usage.output_tokens ?? 0
            usage.cache_read_tokens += final.usage.cache_read_input_tokens ?? 0

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
          status = 'error'
          console.error('[/api/chat stream]', err)
          if (!assistantText) {
            controller.enqueue(
              encoder.encode(
                locale === 'en'
                  ? "Sorry, I couldn't answer right now. Please try again in a moment. Meanwhile, your checklist in the app has the key steps."
                  : 'Perdón, no pude responder en este momento. Intenta de nuevo en un rato. Mientras tanto, tu checklist del app tiene los pasos clave.'
              )
            )
          }
        }

        // Registro best-effort antes de cerrar (no debe romper la respuesta).
        await recordUsageDetails(usageId, { model: MODEL, ...usage, status })
        if (assistantText) {
          try {
            await getAdmin().from('conversations').insert([
              { user_id: userId, role: 'user', content: messages[messages.length - 1]?.content ?? '' },
              { user_id: userId, role: 'assistant', content: assistantText },
            ])
          } catch (e) {
            console.error('[/api/chat persist]', e)
          }
        }
        controller.close()
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
