import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma'
import { Pool } from 'pg'

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined')
  }

  // Réutiliser le pool existant pour éviter les fuites de connexion
  if (!global.pgPool) {
    global.pgPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  }

  const adapter = new PrismaPg(global.pgPool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

// Singleton pattern pour éviter les connexions multiples
export const prisma = global.prismaClient ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prismaClient = prisma
}

export default prisma
