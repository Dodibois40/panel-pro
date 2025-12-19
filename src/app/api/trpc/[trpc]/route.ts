/**
 * API Route tRPC pour Next.js App Router
 */
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { appRouter } from '@/server/routers/_app'
import { createContext } from '@/server/trpc'

/**
 * Handler pour les requêtes tRPC
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(`❌ tRPC error on ${path ?? '<no-path>'}:`, error)
          }
        : undefined,
  })

export { handler as GET, handler as POST }
