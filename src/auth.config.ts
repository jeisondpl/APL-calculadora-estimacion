import type { NextAuthConfig } from 'next-auth'

/**
 * Configuración Edge-safe de NextAuth (sin Prisma, sin bcrypt).
 * Usada por el middleware (que corre en Edge runtime).
 * El runtime Node con Credentials + DB se monta en `auth.ts`.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages:   { signIn: '/login' },

  // Sin providers aquí — los Credentials con Prisma se agregan en auth.ts
  providers: [],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol    = (user as unknown as { rol: string }).rol
        token.userId = Number(user.id)
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { rol: string; userId: number }).rol    = token.rol    as string
        (session.user as unknown as { rol: string; userId: number }).userId = token.userId as number
      }
      return session
    },
  },
} satisfies NextAuthConfig
