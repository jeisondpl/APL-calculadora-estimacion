import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/shared/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages:   { signIn: '/login' },

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

  callbacks: {
    jwt({ token, user }) {
      if (user) token.rol = (user as unknown as { rol: string }).rol
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as unknown as { rol: string }).rol = token.rol as string
      return session
    },
  },
})
