'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { isMarketingPath, MARKETING_PATH_LIST } from '@/lib/metaPixel'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

// Loads the Meta Pixel ONLY when the visitor lands on a marketing page (see
// lib/metaPixel.ts). If they then move into the app with client-side navigation,
// consent is revoked so nothing is sent from app pages, and no PageView fires there.
function ConsentAndPageViews() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (typeof window.fbq !== 'function') return
    const allowed = isMarketingPath(pathname)
    window.fbq('consent', allowed ? 'grant' : 'revoke')
    // Base script already fired the first PageView.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (allowed) window.fbq('track', 'PageView')
  }, [pathname])

  return null
}

export default function MetaPixel() {
  const pathname = usePathname()
  // Decided once, on the first page of the visit.
  const [landedOnMarketing] = useState(() => isMarketingPath(pathname))

  // Never inject the script if the visit started outside marketing pages.
  if (!PIXEL_ID || !landedOnMarketing) return null

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          if (${JSON.stringify(MARKETING_PATH_LIST)}.indexOf(location.pathname.replace(/\\/+$/, '') || '/') !== -1) {
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('set', 'autoConfig', false, '${PIXEL_ID}');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
          }
        `}
      </Script>
      <ConsentAndPageViews />
    </>
  )
}
