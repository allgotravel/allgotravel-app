import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// Pantallas del app (detrás del login o de uso personal): que Google no las indexe.
const APP_SECTIONS = [
  'dashboard', 'perfil', 'documentos', 'documentos-viaje', 'hub', 'planificador', 'destinos',
  'tarjeta-medica', 'tarjeta-comunicacion', 'onboarding', 'paywall', 'vip', 'login', 'register',
].join('|')

const NOINDEX = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: `/:locale(es|en)/:section(${APP_SECTIONS})/:path*`, headers: NOINDEX },
      // Tarjeta médica QR pública (/e/<token>): datos personales, nunca indexar.
      { source: '/e/:path*', headers: NOINDEX },
    ]
  },
}

export default withNextIntl(nextConfig)
