/**
 * Router principal tRPC
 * Combine tous les routers de l'application
 */
import { router } from '@/server/trpc'

import { authRouter } from './auth.router'
import { edgeRouter } from './edge.router'
import { orderRouter } from './order.router'
import { panelRouter } from './panel.router'
import { pricingRouter } from './pricing.router'
import { userRouter } from './user.router'

export const appRouter = router({
  auth: authRouter,
  edge: edgeRouter,
  order: orderRouter,
  panel: panelRouter,
  pricing: pricingRouter,
  user: userRouter,
})

// Type du router pour le client
export type AppRouter = typeof appRouter
