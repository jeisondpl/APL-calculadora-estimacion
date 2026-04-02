import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'

export async function GET(req: NextRequest) {
  const roles = req.nextUrl.searchParams.get('roles')?.split(',') ?? []
  const usuarios = await prisma.usuario.findMany({
    where: { activo: true, ...(roles.length > 0 && { rol: { nombre: { in: roles } } }) },
    select: { id: true, nombre: true, rol: { select: { nombre: true } } },
    orderBy: { nombre: 'asc' },
  })
  return NextResponse.json(usuarios)
}
