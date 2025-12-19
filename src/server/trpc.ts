/**
 * Configuration de base tRPC
 * Ce fichier initialise tRPC et définit les procédures de base
 */
import { initTRPC, TRPCError } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import superjson from 'superjson'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: 'ADMIN' | 'PRODUCTION' | 'CLIENT'
}

export interface AppSession {
  user: SessionUser
  expires: string
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

export interface Context {
  prisma: typeof prisma
  session: AppSession | null
}

export async function createContext(
  _opts: FetchCreateContextFnOptions
): Promise<Context> {
  const session = await auth()

  return {
    prisma,
    session: session as AppSession | null,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRPC INIT
// ═══════════════════════════════════════════════════════════════════════════

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    }
  },
})

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export const router = t.router
export const publicProcedure = t.procedure

// Context avec session garantie (après auth check)
export interface AuthenticatedContext extends Context {
  session: AppSession
}

/**
 * Procédure protégée - requiert une session authentifiée
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Vous devez être connecté pour effectuer cette action',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session as AppSession,
    } satisfies AuthenticatedContext,
  })
})

/**
 * Procédure admin - requiert un rôle ADMIN
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Vous devez être connecté pour effectuer cette action',
    })
  }

  if (ctx.session.user.role !== 'ADMIN') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Accès réservé aux administrateurs',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session as AppSession,
    } satisfies AuthenticatedContext,
  })
})
