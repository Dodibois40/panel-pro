/**
 * Extension des types NextAuth
 */
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: 'ADMIN' | 'PRODUCTION' | 'CLIENT'
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: 'ADMIN' | 'PRODUCTION' | 'CLIENT'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'ADMIN' | 'PRODUCTION' | 'CLIENT'
  }
}
