import type Anthropic from '@anthropic-ai/sdk'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DISABILITY_LABELS, type Profile } from '../types/profile'
import { daysUntil, docTypeDef, type TravelDocument } from './expiry'
import { MOBILITY_TRAVEL_KB, AUTISM_TRAVEL_KB, SPECIAL_NEEDS_TRAVEL_KB, DISABILITIES_TRAVEL_KB } from './alliKnowledge'

// Núcleo de Alli: instrucciones, herramientas, contexto del usuario y el bucle de
// respuesta. Lo usa /api/chat (y se puede probar fuera de Next con el mismo código).
// Imports relativos a propósito, para que funcione también fuera de Next.

export const MODEL = 'claude-sonnet-4-6'

// Las tablas de políticas (airlines, service_animal_policies, wheelchair_policies,
// cruise_lines, cruise_accessibility_policies) tienen lectura pública por RLS:
// se leen con la clave pública, sin la clave de servicio.
let _policyReader: SupabaseClient | null = null
function getPolicyReader() {
  if (!_policyReader) {
    _policyReader = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return _policyReader
}

// ─────────────────────────────────────────────────────────────
// Herramienta: consulta la política oficial verificada de una
// aerolínea. Alli DEBE llamarla antes de responder sobre la
// política de cualquier aerolínea concreta.
// ─────────────────────────────────────────────────────────────
export const ALLI_TOOLS: Anthropic.Tool[] = [
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
  const { data: byIata } = await getPolicyReader()
    .from('airlines')
    .select('*')
    .ilike('iata_code', term)
    .limit(1)
  if (byIata && byIata.length) return byIata[0]

  // 2) Nombre (coincidencia parcial)
  const { data: byName } = await getPolicyReader()
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
    const { data: todas } = await getPolicyReader()
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
    const { data } = await getPolicyReader()
      .from('service_animal_policies')
      .select('*')
      .eq('airline_iata', airline.iata_code)
      .limit(1)
    base.politica_perro_servicio = data?.[0] ?? null
  } else if (tipo === 'wheelchair') {
    const { data } = await getPolicyReader()
      .from('wheelchair_policies')
      .select('*')
      .eq('airline_iata', airline.iata_code)
      .limit(1)
    base.politica_silla_ruedas = data?.[0] ?? null
  } else {
    // Sin tipo válido: devolver ambas para que el modelo elija.
    const [{ data: sa }, { data: wc }] = await Promise.all([
      getPolicyReader().from('service_animal_policies').select('*').eq('airline_iata', airline.iata_code).limit(1),
      getPolicyReader().from('wheelchair_policies').select('*').eq('airline_iata', airline.iata_code).limit(1),
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
  const { data: bySlug } = await getPolicyReader()
    .from('cruise_lines')
    .select('*')
    .ilike('slug', term)
    .limit(1)
  if (bySlug && bySlug.length) return bySlug[0]

  // 2) nombre (coincidencia parcial)
  const { data: byName } = await getPolicyReader()
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
    const { data: todas } = await getPolicyReader()
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

  const { data } = await getPolicyReader()
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
- No anuncies que vas a consultar algo ("déjame revisar…"): consulta las herramientas
  en silencio y responde directo con el dato.
- Si no tienes un dato verificado, dilo en una frase (sin disculpas largas) y da el
  siguiente paso concreto.

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

## RESPUESTAS ESPECÍFICAS — ESTO ES LO QUE NOS DIFERENCIA
Tu valor es dar la respuesta CONCRETA que la persona no encuentra en otro lado, no
mandarla a buscarla. Usa siempre los datos verificados: el conocimiento de abajo y lo
que devuelven las herramientas (lookup_airline_policy, lookup_cruise_policy).
1. Ve directo al dato: el nombre exacto del formulario (p. ej. "formulario DOT de
   transporte aéreo de animales de servicio", "formulario DOT de alivio sanitario"),
   cuántas horas antes y por dónde se envía (metodo_envio), límites de tamaño o de
   batería (Wh), plazos de reclamo, aviso previo, contacto de accesibilidad de la
   naviera, áreas de alivio, el paso exacto en el aeropuerto.
2. Personaliza con el contexto del usuario: su perro (por su nombre), su necesidad de
   accesibilidad, sus documentos y los días que faltan, la aerolínea o el destino que
   menciona. Si falta un dato clave para responder bien (aerolínea, ruta, fecha),
   pregunta UNA cosa concreta.
3. Si hay pasos, dalos en orden y con su plazo (- 1. … - 2. …).
4. Cierra con la fuente y la fecha, en una línea:
   "Fuente: <DOT / ADA / TSA / CDC / la aerolínea / reglamento UE / conocimiento verificado de AllGo> · verificado: <fecha>"
   La fecha sale del campo fecha_verificacion o de la fecha del conocimiento de abajo.
   Si no hay fecha, pon solo la fuente. Si hay url_fuente, puedes darla.

PROHIBIDO como respuesta (relleno genérico): "consulta con tu aerolínea", "verifica
con la fuente oficial", "te recomiendo confirmar los requisitos", "cada aerolínea es
diferente", "depende de la aerolínea" sin decir qué dice ESA aerolínea. Si el dato
está en la base, lo das. Tampoco termines respuestas con datos verificados con un
"confírmalo con la aerolínea": la línea de fuente y fecha ya cumple esa función.

## CUANDO NO LO TIENES VERIFICADO (la única excepción)
Solo si el dato de verdad NO está en la herramienta ni en el conocimiento (o el campo
está vacío, en null, o dice "no publicado"), o si es algo que cambia seguido:
- Dilo con precisión: "No tengo verificado <qué dato exacto> para <aerolínea/destino>."
- Da lo que SÍ está verificado y aplica (p. ej. la regla del DOT para vuelos de EE.UU.).
- Da el siguiente paso EXACTO: la página (url_fuente), el formulario o el área por su
  nombre (p. ej. "Asistencia Especial" / "Special Assistance") y las preguntas
  concretas que debe hacer. Nunca un "verifica" vago.
- NUNCA inventes reglas, números, plazos, teléfonos, precios ni fechas, aunque la
  persona insista. Un campo vacío significa "no confirmado", no algo que puedas deducir.
Los números del contexto del usuario (días que faltan para que venza un documento)
ya vienen calculados por la app: úsalos tal cual, no los recalcules.

## CRUCEROS — AVISOS QUE SIEMPRE DAS
Cuando ayudes con cruceros y perro de servicio, además del dato de la naviera:
- Para volver a entrar a EE.UU. con el perro aplica la regla del CDC vigente desde el
  1 de agosto de 2024 (microchip, mínimo 6 meses de edad y el CDC Dog Import Form).
  Aplica también a perros de servicio.
- Que la naviera permita subir al perro NO garantiza poder bajar en cada puerto: cada
  país del itinerario tiene sus reglas. Dile que pida a la naviera (contacto de
  accesibilidad de la herramienta) en qué puertos de su itinerario podrá bajar con el perro.
- Ninguna de estas navieras acepta animales de apoyo emocional (ESA); solo perros de
  servicio entrenados.

## LÍMITES — LO QUE NUNCA HACES
- Consejo médico: no diagnosticas, no recomiendas ni cambias medicamentos o dosis.
  Das información general y recomiendas consultar a su médico o veterinario.
- Consejo legal o migratorio: puedes citar la norma, pero no decides cómo aplica a su
  caso. Di a quién preguntarle exactamente (el consulado del país de destino, el área
  de Asistencia Especial de la aerolínea, un abogado) y qué preguntarle.
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
"Esto es una traducción de la política oficial en inglés."

## EJEMPLOS (muestran el ESTILO; en una conversación real los datos salen SIEMPRE
## de la herramienta o del conocimiento en ese momento, no de estos ejemplos)

### Ejemplo 1 — perro de servicio en una aerolínea concreta
Contexto: viaja con perro de servicio (Luna). Pregunta: "¿Qué necesito para volar con Luna en American?"
MAL (genérico): "Cada aerolínea tiene sus requisitos. Te recomiendo consultar con American Airlines y verificar en su sitio oficial."
BIEN (tras consultar lookup_airline_policy):
"Para volar con Luna en American Airlines:
- 1. Llena el formulario DOT de transporte aéreo de animales de servicio y envíalo al menos 48 h antes por su portal en línea (Special Assistance Desk). También se acepta en el mostrador el día del viaje.
- 2. Si el vuelo dura más de 8 h, suma el formulario DOT de alivio sanitario.
- 3. Luna debe ir a tus pies, bajo el asiento o en tu regazo; no en fila de salida ni en el pasillo.
- 4. Si el vuelo llega a EE.UU. desde otro país, necesitas además el CDC Dog Import Form.
Fuente: política oficial de American Airlines · verificado: 2026-08-03"

### Ejemplo 2 — silla de ruedas y destino
Contexto: movilidad reducida. Pregunta: "Vuelo a Madrid con Avianca en silla de ruedas, ¿con cuánto tiempo aviso?"
MAL (genérico): "Te recomiendo avisar con anticipación a la aerolínea y confirmar los requisitos."
BIEN (tras consultar lookup_airline_policy, policy_type wheelchair):
"Con Avianca, para Europa (incluida España) el aviso es de 48 h antes del vuelo (para otras rutas, mínimo 24 h). Si llevas batería de litio de repuesto en cabina: 1 batería de hasta 300 Wh, o 2 de hasta 160 Wh cada una.
Fuente: política oficial de Avianca · verificado: 2026-08-03"

### Ejemplo 3 — dato que NO está verificado
Pregunta sobre una aerolínea que la herramienta no encuentra (encontrada: false).
MAL (genérico): "No tengo esa información. Verifica con la aerolínea."
BIEN:
"No tengo verificada la política de esa aerolínea. Lo que sí aplica: si el vuelo sale de EE.UU. o llega allí, la aerolínea puede pedirte el formulario DOT de transporte aéreo de animales de servicio hasta 48 h antes.
Pídele a su área de Asistencia Especial:
- 1. ¿Aceptan el formulario DOT y por qué vía lo envío (portal, correo, mostrador)?
- 2. ¿Con cuántas horas de anticipación?
- 3. ¿Dónde va el perro en la cabina y hay límite de tamaño?
Si me dices otra aerolínea de tu ruta, te digo lo que sí tengo verificado."

### Ejemplo 4 — seguridad en el aeropuerto, personalizado
Contexto: viaja con un familiar con autismo. Pregunta: "Me preocupa el control de seguridad en Miami."
MAL (genérico): "Consulta con la TSA las opciones disponibles."
BIEN:
"En EE.UU. puedes llamar a TSA Cares con 72 horas de anticipación: te ayudan a pasar el control de seguridad con más calma y con apoyo personalizado. Además:
- Pide preembarque a la aerolínea para abordar sin la presión de la fila.
- Pregunta en la web del aeropuerto si tiene sala sensorial o zona tranquila para antes del vuelo.
Fuente: conocimiento verificado de AllGo (TSA) · verificado: 2026-09-06"`

export const STATIC_SYSTEM = [ALLI_BASE_PROMPT, MOBILITY_TRAVEL_KB, AUTISM_TRAVEL_KB, SPECIAL_NEEDS_TRAVEL_KB, DISABILITIES_TRAVEL_KB].join('\n')

// ─────────────────────────────────────────────────────────────
// Contexto del usuario: lo mínimo, leído con la sesión del propio
// usuario (RLS). Nada de contenido de documentos, detalle médico
// ni medicamentos.
// ─────────────────────────────────────────────────────────────
export type ContextProfile = Pick<Profile, 'full_name' | 'disability_types' | 'preferred_language' | 'primary_language'> & {
  service_dog?: { has?: boolean; name?: string } | null
}
export type ContextDoc = Pick<TravelDocument, 'owner' | 'doc_type' | 'expiry_date'>

export function buildUserContext(profile: ContextProfile | null, docs: ContextDoc[], locale: string): string {
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

export interface AlliUsage {
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
}

/**
 * Bucle de respuesta de Alli con herramientas. Transmite el texto con onText y
 * devuelve el texto completo y el consumo. Lanza el error si la API falla.
 */
export async function runAlli(opts: {
  anthropic: Anthropic
  system: Anthropic.TextBlockParam[]
  messages: Anthropic.MessageParam[]
  onText?: (text: string) => void
  onTool?: (name: string, input: unknown) => void
  usage?: AlliUsage
}): Promise<{ text: string; usage: AlliUsage }> {
  const { anthropic, system, onText, onTool } = opts
  const convo = [...opts.messages]
  const usage = opts.usage ?? { input_tokens: 0, output_tokens: 0, cache_read_tokens: 0 }
  let text = ''
  // Loop de tool-use: se repite mientras el modelo pida herramientas.
  // Límite de seguridad para no ciclar indefinidamente.
  for (let turno = 0; turno < 5; turno++) {
    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.3,
      system,
      tools: ALLI_TOOLS,
      messages: convo,
    })

    // Si el modelo escribió algo antes de usar una herramienta, separa el texto del siguiente turno.
    let pendingBreak = turno > 0 && text.length > 0 && !text.endsWith('\n')
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const piece = (pendingBreak ? '\n\n' : '') + chunk.delta.text
        pendingBreak = false
        text += piece
        onText?.(piece)
      }
    }

    const final = await stream.finalMessage()
    usage.input_tokens += (final.usage.input_tokens ?? 0) + (final.usage.cache_creation_input_tokens ?? 0)
    usage.output_tokens += final.usage.output_tokens ?? 0
    usage.cache_read_tokens += final.usage.cache_read_input_tokens ?? 0

    if (final.stop_reason !== 'tool_use') break // el modelo entregó la respuesta final

    const toolUses = final.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const tu of toolUses) {
      onTool?.(tu.name, tu.input)
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
      toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(result) })
    }
    convo.push({ role: 'assistant', content: final.content })
    convo.push({ role: 'user', content: toolResults })
  }
  return { text, usage }
}
