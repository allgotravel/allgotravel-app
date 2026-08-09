'use client'

import { useState } from 'react'

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

const CSS = `
.vipform{--navy:#0a2440;--gold:#d9b45b;--gold-l:#f3d68a;--gold-d:#b8912f;--line:#ece4d2;--muted:#6b7683;background:#fff;border:1px solid var(--line);border-radius:20px;padding:22px;box-shadow:0 14px 40px rgba(20,40,70,.10);position:relative;overflow:hidden}
.vipform::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--gold-d),var(--gold-l),var(--gold-d))}
.vipform h3{font-family:'Playfair Display',Georgia,serif;font-size:1.2rem;font-weight:600;color:var(--navy);margin:0}
.vipform .sub{font-size:.83rem;color:var(--muted);margin:3px 0 15px}
.vipform label{display:block;font-size:.7rem;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#8a94a0;margin:12px 0 5px}
.vipform input,.vipform textarea,.vipform select{width:100%;border:1px solid #e2e6ec;border-radius:11px;padding:12px 14px;font-size:.92rem;outline:none;font-family:inherit;background:#fcfcfd;transition:border-color .2s,box-shadow .2s;color:#1b2733}
.vipform input:focus,.vipform textarea:focus,.vipform select:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(217,180,91,.16);background:#fff}
.vipform .row{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.vipform .cta{display:block;width:100%;margin-top:20px;position:relative;overflow:hidden;background:linear-gradient(135deg,#14406b,var(--navy));color:#fff;border:1px solid rgba(217,180,91,.6);border-radius:14px;padding:16px;font-size:1.02rem;font-weight:700;letter-spacing:.3px;cursor:pointer;box-shadow:0 10px 26px rgba(10,36,64,.3)}
.vipform .cta:disabled{opacity:.6;cursor:default}
.vipform .cta .g{color:var(--gold-l)}
.vipform .trust{text-align:center;font-size:.76rem;color:var(--muted);margin-top:11px}
.vipform .err{margin-top:12px;color:#b42323;font-size:.86rem}
.vipform .done{text-align:center;padding:14px 6px}
.vipform .done .em{font-size:2.4rem}
.vipform .done h3{margin-top:6px}
.vipform .done p{font-size:.9rem;color:#55606c;margin-top:8px}
@media(max-width:480px){.vipform .row{grid-template-columns:1fr}}
`

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
      <div className="vipform">
        <style>{CSS}</style>
        <div className="done">
          <div className="em">🎉</div>
          <h3>¡Recibido! Empezamos con tu viaje.</h3>
          <p>Guardamos tus datos y te contactaremos por WhatsApp para arrancar tu experiencia VIP. 🐾</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vipform">
      <style>{CSS}</style>
      <h3>Reserva tu experiencia VIP</h3>
      <div className="sub">Cuéntanos de tu viaje y arrancamos de inmediato.</div>

      <label>Nombre completo</label>
      <input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Tu nombre" />

      <div className="row">
        <div>
          <label>Correo</label>
          <input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="tu@correo.com" />
        </div>
        <div>
          <label>WhatsApp</label>
          <input value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+1 ..." />
        </div>
      </div>

      <label>¿A dónde viajas?</label>
      <input value={f.destination} onChange={(e) => set('destination', e.target.value)} placeholder="Ciudad / país de destino" />

      <div className="row">
        <div>
          <label>Fechas (aprox.)</label>
          <input value={f.travel_dates} onChange={(e) => set('travel_dates', e.target.value)} placeholder="Ej: 15-22 sep" />
        </div>
        <div>
          <label>Aerolínea (si la tienes)</label>
          <input value={f.airline} onChange={(e) => set('airline', e.target.value)} placeholder="Ej: United" />
        </div>
      </div>

      <div className="row">
        <div>
          <label>Tu perro — nombre y raza</label>
          <input value={f.dog_info} onChange={(e) => set('dog_info', e.target.value)} placeholder="Ej: Luna, frenchie" />
        </div>
        <div>
          <label>Tipo de servicio</label>
          <select value={f.service_type} onChange={(e) => set('service_type', e.target.value)}>
            <option>Perro de servicio</option>
            <option>Perro de servicio psiquiátrico</option>
            <option>En entrenamiento</option>
            <option>Otro</option>
          </select>
        </div>
      </div>

      <label>Necesidades especiales o notas</label>
      <textarea rows={3} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Cuéntanos cualquier detalle que debamos saber…" />

      {state === 'error' && <p className="err">Revisa tu correo e inténtalo de nuevo.</p>}

      <button className="cta" onClick={submit} disabled={state === 'sending'}>
        {state === 'sending' ? 'Enviando…' : (<>Reservar mi experiencia <span className="g">VIP</span> →</>)}
      </button>
      <div className="trust">Pago único de $297 · Empezamos apenas recibamos tus datos</div>
    </div>
  )
}
