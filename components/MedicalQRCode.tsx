'use client'

import { QRCodeSVG } from 'qrcode.react'

interface Props {
  userId: string
}

export default function MedicalQRCode({ userId }: Props) {
  const url = `https://allgotravel-app.vercel.app/es/tarjeta-medica?uid=${userId}`

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
      <p className="text-xs text-gray-400 text-center">
        Escanea para ver perfil completo
        <br />
        Scan to view full profile
      </p>
    </div>
  )
}
