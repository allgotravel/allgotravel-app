import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { MODEL, STATIC_SYSTEM, buildUserContext, runAlli, type AlliUsage, type ContextDoc, type ContextProfile } from '@/lib/alli'
import { getSessionUser, checkRateLimitWithId, recordUsageDetails } from '@/lib/apiGuard'
import { createSupabaseServer } from '@/lib/supabase-server'
import { ALLI_FREE_ACCESS, ALLI_MONTHLY_CAP_USD, monthWindow, monthlySpendUSD, type SpendTier } from '@/lib/alliSpend'

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

    // Acceso de pago: hoy solo se reconoce por subscription_status = 'active'.
    const isDev = process.env.NODE_ENV === 'development'
    const tier: SpendTier = profile?.subscription_status === 'active' ? 'paid' : 'free'
    if (!ALLI_FREE_ACCESS && !isDev && tier === 'free') {
      return NextResponse.json({ error: 'membership_required' }, { status: 403 })
    }

    // Tope de gasto de IA del mes (estimado con los tokens registrados en api_usage).
    const spent = await monthlySpendUSD(userId, 'chat')
    if (spent !== null && spent >= ALLI_MONTHLY_CAP_USD[tier]) {
      return NextResponse.json(
        { error: 'monthly_cap', tier, resets_at: monthWindow().next.toISOString() },
        { status: 429 },
      )
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
        const usage: AlliUsage = { input_tokens: 0, output_tokens: 0, cache_read_tokens: 0 }
        let status: 'ok' | 'error' = 'ok'
        try {
          await runAlli({
            anthropic,
            system,
            messages: convo,
            usage,
            onText: (t) => {
              assistantText += t
              controller.enqueue(encoder.encode(t))
            },
          })
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
