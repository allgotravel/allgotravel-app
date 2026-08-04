'use client'

import { trackInitiateCheckout } from '@/lib/metaPixel'

interface PlanButtonProps {
  href: string
  label: string
  plan: string
  value: number
  className?: string
  style?: React.CSSProperties
}

// Botón de plan: dispara el evento InitiateCheckout del Meta Pixel
// y abre el checkout de Hotmart en una pestaña nueva.
export default function PlanButton({ href, label, plan, value, className, style }: PlanButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackInitiateCheckout({
          content_name: plan,
          content_category: 'membership',
          value,
          currency: 'USD',
        })
      }
      className={className}
      style={style}
    >
      {label}
    </a>
  )
}
