/**
 * Router tRPC pour la tarification
 */
import { z } from 'zod'

import { router, publicProcedure, adminProcedure } from '@/server/trpc'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const pricingUpdateSchema = z.object({
  key: z.string(),
  value: z.number().min(0),
  reason: z.string().optional(),
})

const pricingBulkUpdateSchema = z.array(pricingUpdateSchema)

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const pricingRouter = router({
  /**
   * Récupérer toute la configuration de prix
   */
  getAll: publicProcedure.query(async ({ ctx }) => {
    const configs = await ctx.prisma.pricingConfig.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    })

    // Grouper par catégorie
    const grouped: Record<string, typeof configs> = {}
    for (const config of configs) {
      const category = config.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category]!.push(config)
    }

    return grouped
  }),

  /**
   * Récupérer un prix par clé
   */
  getByKey: publicProcedure.input(z.string()).query(async ({ ctx, input: key }) => {
    const config = await ctx.prisma.pricingConfig.findUnique({
      where: { key },
    })

    if (!config) {
      throw new Error(`Configuration de prix non trouvée: ${key}`)
    }

    return config
  }),

  /**
   * Récupérer les prix par catégorie
   */
  getByCategory: publicProcedure.input(z.string()).query(async ({ ctx, input: category }) => {
    const configs = await ctx.prisma.pricingConfig.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    })

    return configs
  }),

  /**
   * Mettre à jour un prix (admin)
   */
  update: adminProcedure.input(pricingUpdateSchema).mutation(async ({ ctx, input }) => {
    const { key, value, reason } = input
    const userId = ctx.session.user.id

    // Récupérer l'ancienne valeur
    const oldConfig = await ctx.prisma.pricingConfig.findUnique({
      where: { key },
    })

    if (!oldConfig) {
      throw new Error(`Configuration de prix non trouvée: ${key}`)
    }

    // Mettre à jour et créer l'historique en transaction
    const [updatedConfig] = await ctx.prisma.$transaction([
      ctx.prisma.pricingConfig.update({
        where: { key },
        data: {
          value,
          updatedById: userId,
        },
      }),
      ctx.prisma.pricingHistory.create({
        data: {
          configKey: key,
          oldValue: oldConfig.value,
          newValue: value,
          changedById: userId,
          reason,
        },
      }),
    ])

    return updatedConfig
  }),

  /**
   * Mise à jour en masse des prix (admin)
   */
  bulkUpdate: adminProcedure.input(pricingBulkUpdateSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    // Utiliser une transaction interactive
    const results = await ctx.prisma.$transaction(async tx => {
      const updates = []

      for (const { key, value, reason } of input) {
        const oldConfig = await tx.pricingConfig.findUnique({ where: { key } })
        if (!oldConfig) continue

        await tx.pricingHistory.create({
          data: {
            configKey: key,
            oldValue: oldConfig.value,
            newValue: value,
            changedById: userId,
            reason,
          },
        })

        const updated = await tx.pricingConfig.update({
          where: { key },
          data: { value, updatedById: userId },
        })

        updates.push(updated)
      }

      return updates
    })

    return results
  }),

  /**
   * Créer une nouvelle configuration de prix (admin)
   */
  create: adminProcedure
    .input(
      z.object({
        key: z.string().min(1),
        value: z.number().min(0),
        unit: z.string().optional(),
        description: z.string().optional(),
        category: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.pricingConfig.create({
        data: {
          ...input,
          updatedById: ctx.session.user.id,
        },
      })

      return config
    }),

  /**
   * Historique des modifications de prix
   */
  getHistory: adminProcedure
    .input(
      z.object({
        key: z.string().optional(),
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { key, limit } = input

      const history = await ctx.prisma.pricingHistory.findMany({
        where: key ? { configKey: key } : undefined,
        include: {
          changedBy: {
            select: { name: true, email: true },
          },
        },
        orderBy: { changedAt: 'desc' },
        take: limit,
      })

      return history
    }),

  /**
   * Liste des catégories de prix
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.prisma.pricingConfig.findMany({
      select: { category: true },
      distinct: ['category'],
    })

    return categories.map(c => c.category)
  }),
})
