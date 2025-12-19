/**
 * Configuration client tRPC
 */
import { createTRPCReact } from '@trpc/react-query'

import type { AppRouter } from '@/server/routers/_app'

/**
 * Client tRPC React pour les composants
 */
export const trpc = createTRPCReact<AppRouter>()

/**
 * Helper pour obtenir l'URL de l'API tRPC
 */
export function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return ''
  }

  // Railway
  if (process.env.RAILWAY_STATIC_URL) {
    return `https://${process.env.RAILWAY_STATIC_URL}`
  }

  // Vercel/Netlify
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Localhost
  return `http://localhost:${process.env.PORT ?? 3000}`
}
