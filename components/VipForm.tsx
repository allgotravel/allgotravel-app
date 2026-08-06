'use client'

import { useState } from 'react'

const BLUE = '#1B6FB5'
const ORANGE = '#F97316'

type Fields = {
  name: string
  email: string
  whatsapp: string
  destination: string
  travel_dates: string
  airline: string
  dog_info: string
  service_type: string
  notes: string
}

const EMPTY: Fields = {
  name: '',
  email: '',
  whatsapp: '',
  destination: '',
  travel_dates: '',
  airline: '',
  dog_info: '',
  service_type: 'Perro de servicio',
  notes: '',
}

export default function VipForm() {
  const [f, setF] = useState<Fields>(EMPTY)
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  function set<K extends keyof Fields>(k: K, v: string) {
    setF((prev) => ({ ...prev, [k]: v }))
  }

  async function submit() {
    if (!f.email || !f.email.includes('@')) {
      setState('error')
      return
    }
    setState('sending')
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const res = await fetch(`${url}/rest/v1/vip_clients`, {
        method: 'POST',
        headers: {
          apikey: key as string,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(f),
      })
      if (!res.ok) throw new Error('insert failed')
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-gray-100">
        <div className="text-4xl mb-2">🎉</div>
        <h3 className="text-lg font-extrabold" style={{ color: BLUE }}>
          ¡Recibido! Empezamos con tu viaje.
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Guardamos tus datos y te contactaremos por WhatsApp para arrancar tu experiencia VIP. 🐾
        </p>
      </div>
    )
  }

  const inputCls =
    'w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white'
  const labelCls = 'block text-xs font-bold text-gray-600 mt-3 mb-1'

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
      <h3 className="text-base font-extrabold" style={{ color: BLUE }}>
        Reserva tu experiencia VIP
      </h3>
      <p className="text-xs text-gray-500 mb-3">Cuéntanos de tu viaje y arrancamos.</p>

      <label className={labelCls}>Nombre completo</label>
      <input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Tu nombre" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className={labelCls}>Correo</label>
          <input className={inputCls} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="tu@correo.com" />
        </div>
        <div>
          <label className={labelCls}>WhatsApp</label>
          <input className={inputCls} value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+1 ..." />
        </div>
      </div>

      <label className={labelCls}>¿A dónde viajas?</label>
      <input className={inputCls} value={f.destination} onChange={(e) => set('destination', e.target.value)} placeholder="Ciudad / país de destino" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className={labelCls}>Fechas (aprox.)</label>
          <input className={inputCls} value={f.travel_dates} onChange={(e) => set('travel_dates', e.target.value)} placeholder="Ej: 15-22 sep" />
        </div>
        <div>
          <label className={labelCls}>Aerolínea (si la tienes)</label>
          <input className={inputCls} value={f.airline} onChange={(e) => set('airline', e.target.value)} placeholder="Ej: United" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className={labelCls}>Tu perro — nombre y raza</label>
          <input className={inputCls} value={f.dog_info} onChange={(e) => set('dog_info', e.target.value)} placeholder="Ej: Luna, frenchie" />
        </div>
        <div>
          <label className={labelCls}>Tipo de servicio</label>
          <select className={inputCls} value={f.service_type} onChange={(e) => set('service_type', e.target.value)}>
            <option>Perro de servicio</option>
            <option>Perro de servicio psiquiátrico</option>
            <option>En entrenamiento</option>
            <option>Otro</option>
          </select>
        </div>
      </div>

      <label className={labelCls}>Necesidades especiales o notas</label>
      <textarea
        className={inputCls}
        rows={3}
        value={f.notes}
        onChange={(e) => set('notes', e.target.value)}
        placeholder="Cuéntanos cualquier detalle que debamos saber…"
      />

      {state === 'error' && (
        <p className="mt-3 text-sm text-red-600">Revisa tu correo e inténtalo de nuevo.</p>
      )}

      <button
        onClick={submit}
        disabled={state === 'sending'}
        className="mt-4 w-full rounded-2xl py-4 text-white font-extrabold shadow-lg disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${ORANGE}, #ff8f3c)` }}
      >
        {state === 'sending' ? 'Enviando…' : 'Reservar mi experiencia VIP →'}
      </button>
      <p className="text-center text-xs text-gray-400 mt-2.5">
        Pago único de $297 · Empezamos apenas recibamos tus datos
      </p>
    </div>
  )
}
