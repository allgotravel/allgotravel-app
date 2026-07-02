'use client'

import { QRCodeSVG } from 'qrcode.react'

const APP_URL = 'https://allgotravel-app-six.vercel.app'

export default function QRCodeDisplay() {
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-2xl p-6 shadow-lg inline-block">
        <QRCodeSVG
          value={APP_URL}
          size={256}
          level="H"
          marginSize={2}
          fgColor="#1B6FB5"
          imageSettings={{
            src: '/logo-allgo.jpg',
            height: 48,
            width: 48,
            excavate: true,
          }}
          title="AllGo Travel PWA"
        />
      </div>
    </div>
  )
}
