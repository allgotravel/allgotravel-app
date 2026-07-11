'use client'

import { QRCodeSVG } from 'qrcode.react'

interface Props {
  /** Unguessable emergency token from the profile (NOT the user id). */
  token: string | null | undefined
}

export default function MedicalQRCode({ token }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://allgotravel.app'

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl w-[144px] h-[144px] flex items-center justify-center">
          <span className="text-3xl">🏥</span>
        </div>
        <p className="text-xs text-gray-400">
          Guarda tu perfil para generar el QR
          <br />
          Save your profile to generate the QR
        </p>
      </div>
    )
  }

  const url = `${baseUrl}/e/${token}`

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <QRCodeSVG
          value={url}
          size={128}
          bgColor="#ffffff"
          fgColor="#1B6FB5"
          level="M"
        />
      </div>
      <p className="text-xs text-gray-500 text-center font-medium">
        Escanea en una emergencia
        <br />
        Scan in an emergency
      </p>
    </div>
  )
}
