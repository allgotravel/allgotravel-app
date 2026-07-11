// Meta (Facebook) Pixel — client-side event helpers.
// All calls are no-ops when NEXT_PUBLIC_META_PIXEL_ID isn't set or fbq hasn't loaded.

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function isMetaPixelEnabled(): boolean {
  return Boolean(META_PIXEL_ID) && typeof window !== 'undefined' && typeof window.fbq === 'function'
}

function track(event: string, params?: Record<string, unknown>) {
  if (!isMetaPixelEnabled()) return
  window.fbq!('track', event, params)
}

export function trackCompleteRegistration(params?: Record<string, unknown>) {
  track('CompleteRegistration', params)
}

export function trackSubscribe(params?: Record<string, unknown>) {
  track('Subscribe', params)
}

export function trackPurchase(params?: Record<string, unknown>) {
  track('Purchase', params)
}
