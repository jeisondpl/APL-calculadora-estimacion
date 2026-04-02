import { auth } from '@/auth'
import { NextResponse } from 'next/server'

type Rol = 'SUPERUSUARIO' | 'PRODUCT_OWNER' | 'DESARROLLADOR' | 'QA'

export async function requireRole(...roles: Rol[]) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const userRol = (session.user as unknown as { rol: string }).rol
  if (!roles.includes(userRol as Rol)) {
    return NextResponse.json({ error: 'Sin permisos suficientes' }, { status: 403 })
  }
  return null // autorizado
}

export async function getSessionUser() {
  const session = await auth()
  if (!session) return null
  const user = session.user as unknown as { rol?: string; userId?: number }
  return { rol: user.rol ?? '', userId: user.userId ?? 0 }
}
