/**
 * Router tRPC pour les chants
 */
import { z } from 'zod'

import { router, publicProcedure, adminProcedure } from '@/server/trpc'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const edgeFilterSchema = z.object({
  material: z.string().optional(),
  thickness: z.number().optional(),
  search: z.string().optional(),
  panelId: z.string().optional(), // Pour filtrer les chants compatibles
  isActive: z.boolean().optional().default(true),
  limit: z.number().min(1).max(100).optional().default(50),
})

const edgeCreateSchema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  name: z.string().min(1, 'Nom requis'),
  material: z.enum([
    'ABS',
    'ABS_LASER',
    'MELAMINE',
    'PVC',
    'BOIS_MASSIF',
    'ALUMINIUM',
    'ACRYLIQUE',
  ]),
  thickness: z.number().min(0.1).max(10),
  width: z.number().min(10).max(100),
  pricePerMeter: z.number().min(0),
  colorCode: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const edgeRouter = router({
  /**
   * Liste des chants avec filtres
   */
  list: publicProcedure.input(edgeFilterSchema).query(async ({ ctx, input }) => {
    const { material, thickness, search, panelId, isActive, limit } = input

    // Si panelId est fourni, récupérer les chants compatibles
    if (panelId) {
      const compatibleEdges = await ctx.prisma.supplierPanelEdge.findMany({
        where: { panelId },
        include: {
          edge: {
            include: {
              _count: { select: { compatiblePanels: true } },
            },
          },
        },
      })

      return compatibleEdges.map(ce => ({
        ...ce.edge,
        isDefault: ce.isDefault,
      }))
    }

    // Sinon, liste générale
    const edges = await ctx.prisma.edgeBanding.findMany({
      where: {
        isActive,
        ...(material && { material: material as never }),
        ...(thickness && { thickness }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { reference: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
      take: limit,
    })

    return edges
  }),

  /**
   * Récupérer un chant par ID
   */
  getById: publicProcedure.input(z.string()).query(async ({ ctx, input: id }) => {
    const edge = await ctx.prisma.edgeBanding.findUnique({
      where: { id },
      include: {
        compatiblePanels: {
          include: { panel: true },
        },
      },
    })

    if (!edge) {
      throw new Error('Chant non trouvé')
    }

    return edge
  }),

  /**
   * Créer un chant (admin)
   */
  create: adminProcedure.input(edgeCreateSchema).mutation(async ({ ctx, input }) => {
    const edge = await ctx.prisma.edgeBanding.create({
      data: input,
    })

    return edge
  }),

  /**
   * Mettre à jour un chant (admin)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: edgeCreateSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const edge = await ctx.prisma.edgeBanding.update({
        where: { id: input.id },
        data: input.data,
      })

      return edge
    }),

  /**
   * Associer un chant à un panneau (admin)
   */
  linkToPanel: adminProcedure
    .input(
      z.object({
        edgeId: z.string(),
        panelId: z.string(),
        isDefault: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.prisma.supplierPanelEdge.upsert({
        where: {
          panelId_edgeId: {
            panelId: input.panelId,
            edgeId: input.edgeId,
          },
        },
        create: {
          panelId: input.panelId,
          edgeId: input.edgeId,
          isDefault: input.isDefault,
        },
        update: {
          isDefault: input.isDefault,
        },
      })

      return link
    }),

  /**
   * Liste des matériaux de chant distincts
   */
  getMaterials: publicProcedure.query(async ({ ctx }) => {
    const materials = await ctx.prisma.edgeBanding.findMany({
      where: { isActive: true },
      select: { material: true },
      distinct: ['material'],
    })

    return materials.map(m => m.material)
  }),
})
