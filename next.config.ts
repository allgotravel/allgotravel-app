import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // La página vieja de membresía manda a la página oficial del Club ($14.99), para que nadie vea el precio roto de $19.
      { source: '/:locale/membresia', destination: '/club.html', permanent: false },
      { source: '/membresia', destination: '/club.html', permanent: false },
    ]
  },
}

export default withNextIntl(nextConfig)
