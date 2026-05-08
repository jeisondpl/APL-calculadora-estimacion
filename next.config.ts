import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Mantiene Prisma y bcryptjs fuera del bundle del server,
  // los carga desde node_modules en runtime (resuelve issues de Prisma + Vercel).
  serverExternalPackages: ['@prisma/client', 'bcryptjs', 'pdf-parse'],
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
