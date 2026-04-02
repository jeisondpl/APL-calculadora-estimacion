'use client'

import { useSession } from 'next-auth/react'

type Rol = 'SUPERUSUARIO' | 'PRODUCT_OWNER' | 'DESARROLLADOR' | 'QA'

interface RolGuardProps {
  roles: Rol[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RolGuard({ roles, children, fallback = null }: RolGuardProps) {
  const { data: session } = useSession()
  const userRol = (session?.user as unknown as { rol?: string })?.rol
  if (!userRol || !roles.includes(userRol as Rol)) return <>{fallback}</>
  return <>{children}</>
}
