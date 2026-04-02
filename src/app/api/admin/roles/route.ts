import { NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { requireRole } from '@/shared/lib/requireRole'

export async function GET() {
  const denied = await requireRole('SUPERUSUARIO')
  if (denied) return denied

  const roles = await prisma.rol.findMany({ orderBy: { nombre: 'asc' } })
  return NextResponse.json(roles)
}
