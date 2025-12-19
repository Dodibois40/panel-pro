/**
 * Router tRPC pour les commandes
 */
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@/generated/prisma'

import { router, protectedProcedure, adminProcedure } from '@/server/trpc'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const edgeConfigSchema = z.object({
  position: z.enum(['top', 'bottom', 'left', 'right']),
  edgeId: z.string().nullable(),
  edgeName: z.string().optional(),
})

const partSchema = z.object({
  reference: z.string().min(1),
  quantity: z.number().int().min(1),
  panelId: z.string(),
  panelName: z.string().optional(),
  length: z.number().int().min(1),
  width: z.number().int().min(1),
  grainDirection: z.enum(['length', 'width']).nullable(),
  edges: z.array(edgeConfigSchema),
  drillingLines: z.array(z.any()).default([]),
  drillingPoints: z.array(z.any()).default([]),
  hardwareDrillings: z.array(z.any()).default([]),
  machiningOperations: z.array(z.any()).default([]),
  finish: z.object({
    type: z.enum(['none', 'varnish', 'oil', 'wax', 'paint']),
    color: z.string().optional(),
    faces: z.array(z.enum(['front', 'back', 'both'])),
  }).optional(),
  notes: z.string().optional(),
  calculatedPrice: z.number(),
  priceBreakdown: z.object({
    panel: z.number(),
    cutting: z.number(),
    edges: z.number(),
    drilling: z.number(),
    hardware: z.number(),
    machining: z.number(),
    finish: z.number(),
    total: z.number(),
  }),
})

const createOrderSchema = z.object({
  projectName: z.string().optional(),
  parts: z.array(partSchema).min(1, 'Au moins une pièce requise'),
  deliveryOption: z.enum(['PICKUP', 'DELIVERY', 'EXPRESS', 'TRANSPORT']).default('PICKUP'),
  deliveryAddress: z.string().optional(),
  deliveryDate: z.date().optional(),
  notes: z.string().optional(),
})

const updateStatusSchema = z.object({
  orderId: z.string(),
  status: z.enum([
    'DRAFT',
    'PENDING',
    'CONFIRMED',
    'IN_PRODUCTION',
    'READY',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ]),
})

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `CMD-${year}${month}${day}-${random}`
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const orderRouter = router({
  /**
   * Créer une nouvelle commande
   */
  create: protectedProcedure.input(createOrderSchema).mutation(async ({ ctx, input }) => {
    const { parts, ...orderData } = input
    const userId = ctx.session.user.id

    // Calculer le total
    const totalPrice = parts.reduce((sum, part) => sum + part.calculatedPrice * part.quantity, 0)

    // Créer la commande avec les pièces
    const order = await ctx.prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        projectName: orderData.projectName,
        customerId: userId,
        status: 'PENDING',
        totalPrice,
        deliveryOption: orderData.deliveryOption,
        deliveryAddress: orderData.deliveryAddress,
        deliveryDate: orderData.deliveryDate,
        notes: orderData.notes,
        parts: {
          create: parts.map(part => ({
            reference: part.reference,
            quantity: part.quantity,
            panel: { connect: { id: part.panelId } },
            length: part.length,
            width: part.width,
            grainOrientation: part.grainDirection === 'length' ? 'LENGTH' : part.grainDirection === 'width' ? 'WIDTH' : null,
            edgeConfig: part.edges,
            assemblyDrillings: [...part.drillingLines, ...part.drillingPoints],
            hardwareDrillings: part.hardwareDrillings,
            machiningOperations: part.machiningOperations,
            finish: part.finish ?? Prisma.JsonNull,
            calculatedPrice: part.calculatedPrice,
            priceBreakdown: part.priceBreakdown,
            notes: part.notes,
          })),
        },
      },
      include: {
        parts: true,
      },
    })

    return order
  }),

  /**
   * Liste des commandes du client connecté
   */
  myOrders: protectedProcedure
    .input(
      z.object({
        status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']).optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id
      const { status, limit = 20, offset = 0 } = input ?? {}

      const [orders, total] = await Promise.all([
        ctx.prisma.order.findMany({
          where: {
            customerId: userId,
            ...(status && { status }),
          },
          include: {
            parts: {
              include: {
                panel: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.order.count({
          where: {
            customerId: userId,
            ...(status && { status }),
          },
        }),
      ])

      return { orders, total }
    }),

  /**
   * Récupérer une commande par ID
   */
  getById: protectedProcedure.input(z.string()).query(async ({ ctx, input: orderId }) => {
    const userId = ctx.session.user.id
    const isAdmin = ctx.session.user.role === 'ADMIN'

    const order = await ctx.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            company: true,
            phone: true,
          },
        },
        parts: {
          include: {
            panel: true,
          },
        },
      },
    })

    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Commande non trouvée',
      })
    }

    // Vérifier que l'utilisateur a accès à cette commande
    if (!isAdmin && order.customerId !== userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Vous n\'avez pas accès à cette commande',
      })
    }

    return order
  }),

  /**
   * Annuler une commande (client)
   */
  cancel: protectedProcedure.input(z.string()).mutation(async ({ ctx, input: orderId }) => {
    const userId = ctx.session.user.id

    const order = await ctx.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Commande non trouvée',
      })
    }

    if (order.customerId !== userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Vous n\'avez pas accès à cette commande',
      })
    }

    // On ne peut annuler que les commandes en attente
    if (!['DRAFT', 'PENDING'].includes(order.status)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cette commande ne peut plus être annulée',
      })
    }

    const updated = await ctx.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    })

    return updated
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // ADMIN PROCEDURES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Liste de toutes les commandes (admin)
   */
  listAll: adminProcedure
    .input(
      z.object({
        status: z.enum(['DRAFT', 'PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELLED']).optional(),
        customerId: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const { status, customerId, search, limit = 50, offset = 0 } = input ?? {}

      const where = {
        ...(status && { status }),
        ...(customerId && { customerId }),
        ...(search && {
          OR: [
            { orderNumber: { contains: search, mode: 'insensitive' as const } },
            { projectName: { contains: search, mode: 'insensitive' as const } },
            { customer: { name: { contains: search, mode: 'insensitive' as const } } },
            { customer: { company: { contains: search, mode: 'insensitive' as const } } },
          ],
        }),
      }

      const [orders, total] = await Promise.all([
        ctx.prisma.order.findMany({
          where,
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                company: true,
              },
            },
            parts: true,
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.order.count({ where }),
      ])

      return { orders, total }
    }),

  /**
   * Mettre à jour le statut d'une commande (admin)
   */
  updateStatus: adminProcedure.input(updateStatusSchema).mutation(async ({ ctx, input }) => {
    const { orderId, status } = input

    const order = await ctx.prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Commande non trouvée',
      })
    }

    // Mettre à jour les timestamps selon le statut
    const timestamps: Record<string, Date> = {}
    if (status === 'CONFIRMED' && !order.confirmedAt) {
      timestamps.confirmedAt = new Date()
    }
    if (status === 'READY' && !order.producedAt) {
      timestamps.producedAt = new Date()
    }
    if (status === 'COMPLETED' && !order.completedAt) {
      timestamps.completedAt = new Date()
    }

    const updated = await ctx.prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        ...timestamps,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        parts: true,
      },
    })

    return updated
  }),

  /**
   * Statistiques des commandes (admin)
   */
  stats: adminProcedure.query(async ({ ctx }) => {
    const [
      totalOrders,
      pendingOrders,
      inProductionOrders,
      completedOrders,
      totalRevenue,
      ordersThisMonth,
    ] = await Promise.all([
      ctx.prisma.order.count(),
      ctx.prisma.order.count({ where: { status: 'PENDING' } }),
      ctx.prisma.order.count({ where: { status: 'IN_PRODUCTION' } }),
      ctx.prisma.order.count({ where: { status: 'COMPLETED' } }),
      ctx.prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { in: ['CONFIRMED', 'IN_PRODUCTION', 'READY', 'COMPLETED'] } },
      }),
      ctx.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    return {
      totalOrders,
      pendingOrders,
      inProductionOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalPrice?.toNumber() ?? 0,
      ordersThisMonth,
    }
  }),
})
