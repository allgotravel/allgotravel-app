'use client'

import { useState } from 'react'
import { Link } from '@/i18n/navigation'

interface Props {
  contactName?: string | null
  contactPhone?: string | null
  en?: boolean
}

export default function SosButton({ contactName, contactPhone, en = false }: Props) {
  const [open, setOpen] = useState(false)
  const [loc, setLoc] = useState<string | null>(null)
  const [locating, setLocating] = useState(false)

  function shareLocation() {
    if (!('geolocation' in navigator)) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const url = `https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`
        setLoc(url)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const smsBody = loc ? encodeURIComponent((en ? 'Emergency. My location: ' : 'Emergencia. Mi ubicación: ') + loc) : ''

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="SOS"
        style={{ boxShadow: '0 14px 30px -6px rgba(220,38,38,0.6), 0 6px 14px rgba(0,0,0,0.25)' }}
        className="fixed bottom-6 left-5 z-40 allgo-float bg-red-600 hover:bg-red-700 text-white font-extrabold text-lg rounded-full w-16 h-16 flex items-center justify-center ring-4 ring-white/60"
      >
        SOS
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-red-600">🚨 SOS</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label={en ? 'Close' : 'Cerrar'} className="text-gray-400 text-3xl leading-none">×</button>
            </div>

            {contactPhone && (
              <a href={`tel:${contactPhone}`} className="block w-full text-center bg-red-600 text-white text-xl font-bold rounded-2xl py-5 shadow">
                📞 {en ? 'Call' : 'Llamar a'} {contactName || (en ? 'emergency contact' : 'contacto')}
              </a>
            )}

            <a href="tel:911" className="block w-full text-center bg-gray-900 text-white text-lg font-bold rounded-2xl py-4">
              📞 911
            </a>

            <Link href="/tarjeta-medica" className="block w-full text-center bg-[#1B6FB5] text-white text-lg font-bold rounded-2xl py-4">
              🏥 {en ? 'Show my medical card' : 'Mostrar mi tarjeta médica'}
            </Link>

            <button type="button" onClick={shareLocation} className="w-full bg-teal-600 text-white text-lg font-bold rounded-2xl py-4">
              📍 {locating ? (en ? 'Locating…' : 'Ubicando…') : (en ? 'Get my location' : 'Obtener mi ubicación')}
            </button>

            {loc && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 space-y-2">
                <a href={loc} target="_blank" rel="noreferrer" className="block text-[#1B6FB5] font-semibold underline break-all text-sm">{loc}</a>
                {contactPhone && (
                  <a href={`sms:${contactPhone}?&body=${smsBody}`} className="block w-full text-center bg-green-600 text-white font-bold rounded-xl py-3">
                    💬 {en ? 'Text my location' : 'Enviar mi ubicación por SMS'}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
