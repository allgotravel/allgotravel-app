'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import PrepUpsell from '@/components/PrepUpsell'

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('### ')) {
      elements.push(<p key={i} className="font-semibold text-blue-700 mt-2">{parseLine(line.slice(4))}</p>)
    } else if (line.startsWith('## ')) {
      elements.push(<p key={i} className="font-bold text-blue-800 mt-3">{parseLine(line.slice(3))}</p>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(<p key={i} className="pl-3 before:content-['•'] before:mr-2 before:text-blue-500">{parseLine(line.slice(2))}</p>)
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />)
    } else {
      elements.push(<p key={i}>{parseLine(line)}</p>)
    }
    i++
  }

  return <div className="space-y-0.5">{elements}</div>
}

function parseLine(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

interface SpeechRecognitionInstance {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((e: { error?: string }) => void) | null
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null
  start(): void
  stop(): void
}

interface ChatWidgetProps {
  userId?: string
}

export default function ChatWidget({ userId }: ChatWidgetProps) {
  const t = useTranslations('chat')
  const locale = useLocale()
  const en = locale === 'en'

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
  const [isListening, setIsListening] = useState(false)
  const [micHint, setMicHint] = useState<'' | 'keyboard' | 'denied'>('')
  const [ttsSupported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null)
  // Bloqueo: sin membresía se muestra el panel con las guías y el Pack (no el Club).
  const [gate, setGate] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  useEffect(() => {
    if (ttsSupported) {
      // Precargar las voces (iOS/Chrome las cargan async)
      window.speechSynthesis.getVoices()
    }
  }, [ttsSupported])

  // Idioma para dictado y lectura: español de EE.UU./Latinoamérica (es-US) salvo que el
  // navegador esté en español de España (es-ES). En inglés, en-US.
  function speechLang(): string {
    if (en) return 'en-US'
    const nav = (typeof navigator !== 'undefined' ? navigator.language : '') || ''
    return nav.toLowerCase() === 'es-es' ? 'es-ES' : 'es-US'
  }

  function pickBestVoice(lang: string): SpeechSynthesisVoice | null {
    const voices = window.speechSynthesis.getVoices()
    const norm = (l: string) => l.toLowerCase().replace('_', '-')
    const want = norm(lang)
    const prefix = want.slice(0, 2)
    // Misma variante (es-US) → cualquier español latino (es-MX, es-419…) → cualquier español.
    // Si no hay voz en ese idioma, null: el navegador elige según utterance.lang.
    return (
      voices.find(v => norm(v.lang) === want) ??
      (prefix === 'es' ? voices.find(v => /^es-(mx|419|us|co|ar|cl|pe)/.test(norm(v.lang))) : undefined) ??
      voices.find(v => norm(v.lang).startsWith(prefix)) ??
      null
    )
  }

  function speakText(text: string, index: number) {
    if (!ttsSupported) return
    if (speakingIndex === index) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }
    window.speechSynthesis.cancel()
    // Sin símbolos de formato ni emojis, para que la lectura suene natural
    const clean = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,3} /g, '')
      .replace(/^\s*[-*] /gm, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
      // Pronunciación: la voz en español lee "Alli" como "allí"; se dice "Ali".
      // Solo en lo hablado; en pantalla sigue "Alli".
      .replace(/(?<![\p{L}\p{N}])alli(?![\p{L}\p{N}])/giu, 'Ali')
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.lang = speechLang()
    utterance.rate = 0.95
    utterance.pitch = 1
    utterance.volume = 1
    // Wait for voices to load (Chrome needs this)
    const assignVoice = () => {
      const voice = pickBestVoice(utterance.lang)
      if (voice) utterance.voice = voice
    }
    if (window.speechSynthesis.getVoices().length > 0) {
      assignVoice()
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', assignVoice, { once: true })
    }
    utterance.onstart = () => setSpeakingIndex(index)
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  // Al cerrar el chat se detienen la lectura y el micrófono.
  useEffect(() => {
    if (!open) {
      if (ttsSupported) window.speechSynthesis.cancel()
      recognitionRef.current?.stop()
    }
  }, [open, ttsSupported])

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const w = window as Window & { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) {
      // iPhone y navegadores sin reconocimiento: guiar al dictado del teclado (siempre funciona)
      inputRef.current?.focus()
      setMicHint('keyboard')
      setTimeout(() => setMicHint(''), 7000)
      return
    }

    const recognition = new SR()
    recognition.lang = speechLang()
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onerror = (e) => {
      setIsListening(false)
      // Sin permiso de micrófono o servicio no disponible: ofrecer el dictado del teclado.
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed' || e?.error === 'audio-capture') {
        inputRef.current?.focus()
        setMicHint('denied')
        setTimeout(() => setMicHint(''), 7000)
      }
    }
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setInput(prev => prev ? `${prev} ${transcript}` : transcript)
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    // Sin sesión no se llama a la API: Alli solo responde a cuentas con sesión.
    if (!userId) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: text, ts: new Date().toISOString() },
        { role: 'assistant', content: en ? 'Log in to talk to Alli, your AI assistant.' : 'Inicia sesión para hablar con Alli, tu asistente con IA.', ts: new Date().toISOString() },
      ])
      setInput('')
      return
    }

    const userMsg: Message = { role: 'user', content: text, ts: new Date().toISOString() }
    const nextMessages = [...messages, userMsg]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    // Placeholder for streaming assistant response
    const placeholder: Message = { role: 'assistant', content: '', ts: new Date().toISOString() }
    setMessages([...nextMessages, placeholder])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          conversationId,
          locale,
        }),
      })

      if (res.status === 401 || res.status === 403 || res.status === 429) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; tier?: string; resets_at?: string }
        let note: string
        if (res.status === 401) {
          note = en ? 'Log in to talk to Alli, your AI assistant.' : 'Inicia sesión para hablar con Alli, tu asistente con IA.'
        } else if (body.error === 'monthly_cap') {
          // Tope de gasto del mes: se renueva el día 1. Sin acceso de pago, se muestran las guías y el Pack.
          const resets = body.resets_at
            ? new Date(body.resets_at).toLocaleDateString(en ? 'en-US' : 'es', { day: 'numeric', month: 'long', timeZone: 'UTC' })
            : ''
          const free = body.tier !== 'paid'
          note = en
            ? `You've reached Alli's limit for this month.${resets ? ` It renews on ${resets}.` : ''}${free ? ' In the meantime, everything you need for your trip is in the guides:' : ''}`
            : `Llegaste al límite de Alli de este mes.${resets ? ` Se renueva el ${resets}.` : ''}${free ? ' Mientras tanto, todo lo que necesitas para tu viaje está en las guías:' : ''}`
          if (free) setGate(true)
        } else if (res.status === 429) {
          note = en ? "You've reached the question limit for now. Please try again in a while." : 'Llegaste al límite de preguntas por ahora. Intenta de nuevo en un rato.'
        } else {
          note = en ? 'Detailed answers are part of your complete preparation:' : 'Las respuestas detalladas son parte de tu preparación completa:'
          setGate(true)
        }
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: note, ts: placeholder.ts }
          return updated
        })
        return
      }
      if (!res.ok || !res.body) throw new Error('Request failed')

      const newConvId = res.headers.get('X-Conversation-Id')
      if (newConvId) setConversationId(newConvId)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: assistantText,
            ts: placeholder.ts,
          }
          return updated
        })
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: t('error'),
          ts: placeholder.ts,
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? t('close') : t('open')}
        className="allgo-float allgo-glow fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full allgo-aurora ring-2 ring-white/40 text-white shadow-lg flex items-center justify-center text-2xl transition-transform active:scale-95"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="allgo-aurora relative overflow-hidden text-white px-4 py-3 flex items-center gap-2">
            <div className="allgo-grid pointer-events-none absolute inset-0" />
            <span className="relative text-xl allgo-float inline-block">🌍</span>
            <div className="relative">
              <p className="font-semibold leading-tight">{t('title')}</p>
              <p className="text-xs text-blue-100">{t('subtitle')}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px] bg-gray-50" aria-live="polite" aria-busy={loading}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center gap-2 pt-8">
                <p className="text-sm text-gray-500 text-center">{t('empty')}</p>
                {ttsSupported && (
                  <button
                    type="button"
                    onClick={() => speakText(t('empty'), -1)}
                    aria-label={speakingIndex === -1 ? (en ? 'Stop reading the greeting aloud' : 'Detener la lectura del saludo') : (en ? 'Read the greeting aloud' : 'Escuchar el saludo en voz alta')}
                    aria-pressed={speakingIndex === -1}
                    className="flex min-h-[44px] items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    <span aria-hidden="true">{speakingIndex === -1 ? '⏹' : '🔊'}</span>
                    {speakingIndex === -1 ? (en ? 'Stop' : 'Detener') : (en ? 'Listen' : 'Escuchar')}
                  </button>
                )}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                    }`}
                  >
                    {msg.content ? (
                      msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content
                    ) : (loading && i === messages.length - 1 ? (
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce">·</span>
                        <span className="animate-bounce [animation-delay:100ms]">·</span>
                        <span className="animate-bounce [animation-delay:200ms]">·</span>
                      </span>
                    ) : null)}
                  </div>
                  {/* TTS button — only on completed Alli messages */}
                  {ttsSupported && msg.role === 'assistant' && msg.content && !(loading && i === messages.length - 1) && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.content, i)}
                      aria-label={speakingIndex === i ? (en ? 'Stop reading the answer aloud' : 'Detener la lectura de la respuesta') : (en ? 'Read this answer aloud' : 'Escuchar esta respuesta en voz alta')}
                      aria-pressed={speakingIndex === i}
                      className={`flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all duration-200 ${
                        speakingIndex === i
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50 border border-gray-200 bg-white'
                      }`}
                    >
                      <span aria-hidden="true">{speakingIndex === i ? '⏹' : '🔊'}</span>
                      {speakingIndex === i ? (en ? 'Stop' : 'Detener') : (en ? 'Listen' : 'Escuchar')}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {gate && <PrepUpsell en={en} tema="perro" />}
            <div ref={bottomRef} />
          </div>

          {/* Aviso: Alli es una IA y cita fuente y fecha */}
          <p className="border-t border-gray-200 bg-blue-50 px-4 py-1.5 text-center text-[11px] leading-snug text-blue-800">
            {t('disclaimer')}
          </p>

          {/* Input */}
          <div className="relative p-3 border-t border-gray-200 bg-white flex gap-2 items-end">
            {micHint && (
              <div role="status" className="absolute -top-2 left-3 right-3 -translate-y-full bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg">
                {micHint === 'denied'
                  ? (en
                    ? "I can't use the microphone here. Allow it in your browser, or tap the 🎤 on your keyboard."
                    : 'No puedo usar el micrófono aquí. Permítelo en tu navegador o toca el 🎤 de tu teclado.')
                  : (en
                    ? 'Voice dictation isn\'t available in this browser. Tap the 🎤 on your keyboard to talk to Alli.'
                    : 'El dictado por voz no está disponible en este navegador. Toca el 🎤 de tu teclado para hablarle a Alli.')}
              </div>
            )}
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={t('placeholder')}
              aria-label={t('placeholder')}
              rows={1}
              disabled={loading}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 max-h-28 overflow-y-auto"
              style={{ fieldSizing: 'content' } as React.CSSProperties}
            />
            <button
              type="button"
              onClick={toggleListening}
              disabled={loading}
              aria-label={isListening ? (en ? 'Stop dictation' : 'Detener el dictado') : (en ? 'Dictate your question by voice' : 'Dictar tu pregunta por voz')}
              aria-pressed={isListening}
              title={en ? 'Dictate by voice' : 'Dictar por voz'}
              className={`shrink-0 w-11 h-11 rounded-xl text-white text-lg flex items-center justify-center disabled:opacity-40 transition ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              <span aria-hidden="true">{isListening ? '⏹' : '🎤'}</span>
            </button>
            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label={t('send')}
              className="shrink-0 w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-40 transition"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  )
}
