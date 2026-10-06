'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'

interface Props {
  userId: string
  sharingEnabled: boolean
  en: boolean
}

// Owner controls for the public emergency QR (/e/<token>):
//  - turn the public card on/off
//  - generate a new QR (the old printed/saved QR stops working right away)
export default function EmergencyQRControls({ userId, sharingEnabled, en }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  async function toggle() {
    setBusy(true)
    setMsg('')
    const supabase = createSupabaseBrowser()
    const { error } = await supabase
      .from('profiles')
      .update({ emergency_sharing_enabled: !sharingEnabled })
      .eq('id', userId)
    setBusy(false)
    if (error) setMsg(en ? 'Could not save. Try again.' : 'No se pudo guardar. Intenta de nuevo.')
    else router.refresh()
  }

  async function rotate() {
    const ok = window.confirm(
      en
        ? 'Create a new QR? Any QR you printed or saved before will stop working.'
        : '¿Crear un QR nuevo? El QR que imprimiste o guardaste antes dejará de funcionar.'
    )
    if (!ok) return
    setBusy(true)
    setMsg('')
    const supabase = createSupabaseBrowser()
    const { error } = await supabase.rpc('rotate_emergency_token')
    setBusy(false)
    if (error) setMsg(en ? 'Could not create a new QR. Try again.' : 'No se pudo crear el QR nuevo. Intenta de nuevo.')
    else {
      setMsg(en ? 'New QR ready. Print it again.' : 'QR nuevo listo. Vuelve a imprimirlo.')
      router.refresh()
    }
  }

  return (
    <div className="no-print print:hidden flex flex-col items-center gap-2 text-center">
      <p className="text-xs text-gray-500">
        {sharingEnabled
          ? (en ? 'Public QR card: ON' : 'Tarjeta pública por QR: ACTIVADA')
          : (en ? 'Public QR card: OFF' : 'Tarjeta pública por QR: DESACTIVADA')}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className="min-h-[44px] px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {sharingEnabled ? (en ? 'Turn off' : 'Desactivar') : (en ? 'Turn on' : 'Activar')}
        </button>
        <button
          type="button"
          onClick={rotate}
          disabled={busy}
          className="min-h-[44px] px-3 py-2 rounded-lg border border-[#1B6FB5] text-sm font-medium text-[#1B6FB5] hover:bg-blue-50 disabled:opacity-50"
        >
          {en ? 'New QR (cancel the old one)' : 'QR nuevo (anula el anterior)'}
        </button>
      </div>
      {msg && <p className="text-xs text-gray-600" role="status">{msg}</p>}
    </div>
  )
}
