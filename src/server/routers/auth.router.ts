/**
 * Router tRPC pour l'authentification
 */
import { hash } from 'bcryptjs'
import { z } from 'zod'

import { router, publicProcedure, protectedProcedure } from '@/server/trpc'

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════

const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  name: z.string().min(1, 'Nom requis'),
  company: z.string().optional(),
  phone: z.string().optional(),
})

const updateProfileSchema = z.object({
  name: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export const authRouter = router({
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: publicProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const { email, password, name, company, phone } = input

    // Vérifier si l'email existe déjà
    const existingUser = await ctx.prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé')
    }

    // Hasher le mot de passe
    const passwordHash = await hash(password, 12)

    // Créer l'utilisateur
    const user = await ctx.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        company,
        phone,
        role: 'CLIENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
      },
    })

    return user
  }),

  /**
   * Vérifier si un email est disponible
   */
  checkEmail: publicProcedure.input(z.string().email()).query(async ({ ctx, input: email }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return { available: !user }
  }),

  /**
   * Obtenir le profil de l'utilisateur connecté
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        address: true,
        role: true,
        discountRate: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    })

    return user
  }),

  /**
   * Mettre à jour le profil
   */
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
        select: {
          id: true,
          email: true,
          name: true,
          company: true,
          phone: true,
          address: true,
        },
      })

      return user
    }),
})
