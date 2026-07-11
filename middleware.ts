import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // `e/` = public emergency medical-card page (language-neutral, no locale prefix)
  matcher: ['/((?!api|_next|_vercel|e/|.*\\..*).*)'],
}
