import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole } from '@/shared/lib/requireRole'

type RouteCtx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER')
  if (denied) return denied

  const { id } = await params
  const { estado } = await req.json()

  if (estado !== 'ABIERTO' && estado !== 'CERRADO') {
    return NextResponse.json(errorResponse('Estado inválido', 400), { status: 400 })
  }

  try {
    const numId = parseInt(id)
    // Usamos SQL directo para evitar dependencia del cliente Prisma generado
    await prisma.$executeRaw`UPDATE proyectos SET estado = ${estado}, updated_at = now() WHERE id = ${numId}`
    return NextResponse.json(successResponse({ id: numId, estado }))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}
