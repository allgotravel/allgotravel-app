// Meta (Facebook) Pixel — client-side helpers.
//
// PRIVACY RULE: the pixel may only run on public MARKETING pages. Never on the app
// (dashboard, profile, medical card, documents, Alli, planner…), never on /e/<token>,
// never on login/register. Health-related browsing must not reach Meta.
// All calls are no-ops when NEXT_PUBLIC_META_PIXEL_ID isn't set, fbq hasn't loaded,
// or the current page is not a marketing page.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

// Exact paths where the pixel is allowed (Next.js routes). Static landing pages in
// /public (*.html) carry their own pixel snippet and are outside the app.
export const MARKETING_PATH_LIST = [
  '/', '/es', '/en',
  '/es/nosotros', '/en/nosotros',
  '/es/membresia', '/en/membresia',
]
const MARKETING_PATHS = new Set(MARKETING_PATH_LIST)

export function isMarketingPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return MARKETING_PATHS.has(p)
}

export function isMetaPixelEnabled(): boolean {
  return (
    Boolean(META_PIXEL_ID) &&
    typeof window !== 'undefined' &&
    typeof window.fbq === 'function' &&
    isMarketingPath(window.location.pathname)
  )
}

function track(event: string, params?: Record<string, unknown>) {
  if (!isMetaPixelEnabled()) return
  window.fbq!('track', event, params)
}

export function trackSubscribe(params?: Record<string, unknown>) {
  track('Subscribe', params)
}

export function trackPurchase(params?: Record<string, unknown>) {
  track('Purchase', params)
}

export function trackInitiateCheckout(params?: Record<string, unknown>) {
  track('InitiateCheckout', params)
}
