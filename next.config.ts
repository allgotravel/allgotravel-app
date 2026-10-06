import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// Pantallas del app (detrás del login o de uso personal): que Google no las indexe.
const APP_SECTIONS = [
  'dashboard', 'perfil', 'documentos', 'documentos-viaje', 'hub', 'planificador', 'destinos',
  'tarjeta-medica', 'tarjeta-comunicacion', 'onboarding', 'paywall', 'vip', 'login', 'register',
].join('|')

const NOINDEX = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }]

// ── Security headers ─────────────────────────────────────────────────────────
const SUPABASE = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ywtkkxpuebwqvmylzwew.supabase.co').replace(/\/+$/, '')
const SUPABASE_WS = SUPABASE.replace(/^https:/, 'wss:')
const isDev = process.env.NODE_ENV !== 'production'

// Next.js needs inline scripts for hydration ('unsafe-inline'). The Anthropic API is only
// called from the server, so it never appears here. Hotmart is a plain link (navigation).
function csp(opts: { metaPixel: boolean }) {
  const fb = opts.metaPixel
  const d: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...(fb ? ['https://connect.facebook.net'] : [])],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', SUPABASE, ...(fb ? ['https://www.facebook.com'] : [])],
    'font-src': ["'self'", 'data:'],
    'connect-src': ["'self'", SUPABASE, SUPABASE_WS, ...(fb ? ['https://www.facebook.com', 'https://connect.facebook.net'] : []), ...(isDev ? ['ws:'] : [])],
    'media-src': ["'self'", 'blob:'],
    'worker-src': ["'self'", 'blob:'],
    'manifest-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  }
  const s = Object.entries(d).map(([k, v]) => `${k} ${v.join(' ')}`).join('; ')
  return isDev ? s : s + '; upgrade-insecure-requests'
}

const BASE_SECURITY = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // microphone = Alli voice; geolocation = SOS button. Everything else off.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(self), payment=(), usb=(), serial=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=(), browsing-topics=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

// App, login, Alli, medical card, /e/: no Meta Pixel allowed at all.
const APP_HEADERS = [...BASE_SECURITY, { key: 'Content-Security-Policy', value: csp({ metaPixel: false }) }]
// Public marketing pages only (home, nosotros, membresía, static landing .html files).
const MARKETING_HEADERS = [...BASE_SECURITY, { key: 'Content-Security-Policy', value: csp({ metaPixel: true }) }]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      // 1) Default for everything: strict CSP, no third-party trackers.
      { source: '/:path*', headers: APP_HEADERS },
      // 2) Marketing pages may load the Meta Pixel (later entries override earlier ones).
      { source: '/', headers: MARKETING_HEADERS },
      { source: '/:locale(es|en)', headers: MARKETING_HEADERS },
      { source: '/:locale(es|en)/:page(nosotros|membresia)', headers: MARKETING_HEADERS },
      { source: '/:file([A-Za-z0-9._-]+\\.html)', headers: MARKETING_HEADERS },

      { source: `/:locale(es|en)/:section(${APP_SECTIONS})/:path*`, headers: NOINDEX },
      // Tarjeta médica QR pública (/e/<token>): datos personales. Nunca indexar, nunca
      // guardar en caché, nunca enviar la URL (que contiene el token) como Referer.
      {
        source: '/e/:path*',
        headers: [
          ...NOINDEX,
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
    ]
  },
}

export default withNextIntl(nextConfig)
