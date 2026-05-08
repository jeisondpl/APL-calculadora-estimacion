import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/shared/lib/prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'

/**
 * Runtime Node con Credentials + Prisma + bcrypt.
 * NO usar en el middleware (Edge) — para Edge usa `auth.config.ts`.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',      type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email    as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const usuario = await prisma.usuario.findUnique({
          where:   { email },
          include: { rol: true },
        })
        if (!usuario || !usuario.activo) return null

        const ok = await bcrypt.compare(password, usuario.passwordHash)
        if (!ok) return null

        return {
          id:     String(usuario.id),
          name:   usuario.nombre,
          email:  usuario.email,
          rol:    usuario.rol.nombre,
        }
      },
    }),
  ],
})
