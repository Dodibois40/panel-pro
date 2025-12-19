/**
 * Router tRPC pour les panneaux
 */
import { z } from 'zod'

import { router, publicProcedure, adminProcedure } from '@/server/trpc'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const panelFilterSchema = z.object({
  material: z.string().optional(),
  supplier: z.string().optional(),
  thickness: z.number().optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
})

const panelCreateSchema = z.object({
  reference: z.string().min(1, 'Référence requise'),
  name: z.string().min(1, 'Nom requis'),
  supplier: z.string().min(1, 'Fournisseur requis'),
  material: z.enum([
    'MELAMINE',
    'MDF',
    'MDF_LAQUE',
    'STRATIFIE',
    'PLAQUE_BOIS',
    'CONTREPLAQUE',
    'AGGLO',
    'COMPACT',
  ]),
  thickness: z.number().min(1).max(100),
  length: z.number().min(100).max(5000),
  width: z.number().min(100).max(3000),
  pricePerM2: z.number().min(0),
  grainDirection: z.boolean().optional().default(false),
  colorCode: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const panelRouter = router({
  /**
   * Liste des panneaux avec filtres
   */
  list: publicProcedure.input(panelFilterSchema).query(async ({ ctx, input }) => {
    const { material, supplier, thickness, search, isActive, limit, offset } = input

    const panels = await ctx.prisma.supplierPanel.findMany({
      where: {
        isActive,
        ...(material && { material: material as never }),
        ...(supplier && { supplier: { contains: supplier, mode: 'insensitive' } }),
        ...(thickness && { thickness }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { reference: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        compatibleEdges: {
          include: { edge: true },
          where: { isDefault: true },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
      skip: offset,
    })

    const total = await ctx.prisma.supplierPanel.count({
      where: {
        isActive,
        ...(material && { material: material as never }),
        ...(supplier && { supplier: { contains: supplier, mode: 'insensitive' } }),
        ...(thickness && { thickness }),
      },
    })

    return { panels, total }
  }),

  /**
   * Récupérer un panneau par ID
   */
  getById: publicProcedure.input(z.string()).query(async ({ ctx, input: id }) => {
    const panel = await ctx.prisma.supplierPanel.findUnique({
      where: { id },
      include: {
        compatibleEdges: {
          include: { edge: true },
        },
      },
    })

    if (!panel) {
      throw new Error('Panneau non trouvé')
    }

    return panel
  }),

  /**
   * Créer un panneau (admin)
   */
  create: adminProcedure.input(panelCreateSchema).mutation(async ({ ctx, input }) => {
    const panel = await ctx.prisma.supplierPanel.create({
      data: input,
    })

    return panel
  }),

  /**
   * Mettre à jour un panneau (admin)
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        data: panelCreateSchema.partial(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const panel = await ctx.prisma.supplierPanel.update({
        where: { id: input.id },
        data: input.data,
      })

      return panel
    }),

  /**
   * Supprimer un panneau (admin) - soft delete
   */
  delete: adminProcedure.input(z.string()).mutation(async ({ ctx, input: id }) => {
    await ctx.prisma.supplierPanel.update({
      where: { id },
      data: { isActive: false },
    })

    return { success: true }
  }),

  /**
   * Liste des fournisseurs distincts
   */
  getSuppliers: publicProcedure.query(async ({ ctx }) => {
    const suppliers = await ctx.prisma.supplierPanel.findMany({
      where: { isActive: true },
      select: { supplier: true },
      distinct: ['supplier'],
      orderBy: { supplier: 'asc' },
    })

    return suppliers.map(s => s.supplier)
  }),

  /**
   * Liste des épaisseurs distinctes
   */
  getThicknesses: publicProcedure.query(async ({ ctx }) => {
    const thicknesses = await ctx.prisma.supplierPanel.findMany({
      where: { isActive: true },
      select: { thickness: true },
      distinct: ['thickness'],
      orderBy: { thickness: 'asc' },
    })

    return thicknesses.map(t => Number(t.thickness))
  }),
})
