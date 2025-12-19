/**
 * Router tRPC pour la gestion des utilisateurs
 */
import { z } from 'zod'

import { router, adminProcedure } from '@/server/trpc'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const userUpdateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  discountRate: z.number().min(0).max(100).optional(),
  role: z.enum(['CLIENT', 'ADMIN', 'PRODUCTION']).optional(),
})

const userListInput = z.object({
  search: z.string().optional(),
  role: z.enum(['CLIENT', 'ADMIN', 'PRODUCTION', 'ALL']).optional().default('ALL'),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
})

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const userRouter = router({
  /**
   * Liste tous les utilisateurs (admin)
   */
  list: adminProcedure.input(userListInput).query(async ({ ctx, input }) => {
    const { search, role, limit, offset } = input

    const where = {
      ...(role !== 'ALL' && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [users, total] = await Promise.all([
      ctx.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          phone: true,
          role: true,
          discountRate: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      ctx.prisma.user.count({ where }),
    ])

    return {
      users: users.map(u => ({
        ...u,
        orderCount: u._count.orders,
      })),
      total,
    }
  }),

  /**
   * Détails d'un utilisateur (admin)
   */
  getById: adminProcedure.input(z.string()).query(async ({ ctx, input: id }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalPrice: true,
            createdAt: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    })

    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }

    // Calculer le total dépensé
    const totalSpent = await ctx.prisma.order.aggregate({
      where: {
        customerId: id,
        status: { notIn: ['CANCELLED', 'DRAFT'] },
      },
      _sum: { totalPrice: true },
    })

    return {
      ...user,
      orderCount: user._count.orders,
      totalSpent: totalSpent._sum.totalPrice ?? 0,
    }
  }),

  /**
   * Mettre à jour un utilisateur (admin)
   */
  update: adminProcedure.input(userUpdateSchema).mutation(async ({ ctx, input }) => {
    const { id, ...data } = input

    const user = await ctx.prisma.user.update({
      where: { id },
      data,
    })

    return user
  }),

  /**
   * Statistiques des clients (admin)
   */
  stats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers, newThisMonth, withOrders] = await Promise.all([
      ctx.prisma.user.count({ where: { role: 'CLIENT' } }),
      ctx.prisma.user.count({
        where: {
          role: 'CLIENT',
          createdAt: {
            gte: new Date(new Date().setDate(1)), // Premier jour du mois
          },
        },
      }),
      ctx.prisma.user.count({
        where: {
          role: 'CLIENT',
          orders: { some: {} },
        },
      }),
    ])

    // Top clients par CA
    const topClients = await ctx.prisma.user.findMany({
      where: {
        role: 'CLIENT',
        orders: { some: { status: { notIn: ['CANCELLED', 'DRAFT'] } } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        orders: {
          where: { status: { notIn: ['CANCELLED', 'DRAFT'] } },
          select: { totalPrice: true },
        },
      },
      take: 10,
    })

    const topClientsWithTotal = topClients
      .map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        totalSpent: client.orders.reduce((sum, o) => sum + Number(o.totalPrice), 0),
        orderCount: client.orders.length,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    return {
      totalUsers,
      newThisMonth,
      withOrders,
      conversionRate: totalUsers > 0 ? Math.round((withOrders / totalUsers) * 100) : 0,
      topClients: topClientsWithTotal,
    }
  }),
})
