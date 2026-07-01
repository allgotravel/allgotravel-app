import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function buildSystemPrompt(profile: Profile | null, locale: string): string {
  const lang = locale === 'en' ? 'English' : 'español'

  const base =
    locale === 'en'
      ? `You are AllGo Travel's accessible-travel assistant. You help travelers with disabilities plan trips, find accessible accommodations, transport, and services. Always be empathetic, clear, and practical. Respond in English.`
      : `Eres el asistente de viajes accesibles de AllGo Travel. Ayudas a viajeros con discapacidad a planificar viajes, encontrar alojamientos accesibles, transporte y servicios. Sé siempre empático/a, claro/a y práctico/a. Responde en español.`

  if (!profile) return base

  const parts: string[] = [base, '']

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
    parts.push(`\nAlways take these accessibility needs into account in every recommendation. Never suggest inaccessible options without warning.`)
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
    parts.push(`\nTen siempre en cuenta estas necesidades en cada recomendación. Nunca sugieras opciones inaccesibles sin advertirlo.`)
  }

  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId, userId, locale = 'es' } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    // Fetch user profile for context (optional — no profile = generic assistant)
    let profile: Profile | null = null
    if (userId) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      profile = data
    }

    const systemPrompt = buildSystemPrompt(profile, locale)

    // Stream response from Claude
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    // Collect full text for persistence
    let assistantText = ''

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            assistantText += chunk.delta.text
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()

        // Persist conversation asynchronously
        if (userId) {
          const newMessages = [
            ...messages,
            { role: 'assistant', content: assistantText, ts: new Date().toISOString() },
          ]

          if (conversationId) {
            await supabaseAdmin
              .from('conversations')
              .update({ messages: newMessages, updated_at: new Date().toISOString() })
              .eq('id', conversationId)
          } else {
            await supabaseAdmin
              .from('conversations')
              .insert({ user_id: userId, messages: newMessages })
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
