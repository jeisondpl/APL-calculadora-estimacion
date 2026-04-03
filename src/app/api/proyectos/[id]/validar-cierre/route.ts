import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole } from '@/shared/lib/requireRole'

type RouteCtx = { params: Promise<{ id: string }> }

/**
 * GET /api/proyectos/[id]/validar-cierre
 * Devuelve las actividades con jornadas > 0 que no tienen fecha inicio y/o fin.
 * Si el array está vacío la planificación está completa y el proyecto puede cerrarse.
 */
export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER')
  if (denied) return denied

  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) {
      return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })
    }

    // Toda actividad del proyecto debe tener fecha_inicio Y fecha_fin
    const sinPlanificar = await prisma.$queryRaw<
      { id: number; nombre: string; bloque: string | null; jornadas: number | null; fecha_inicio: string | null; fecha_fin: string | null }[]
    >(
      Prisma.sql`
        SELECT
          id,
          nombre,
          bloque,
          CAST(jornadas AS FLOAT) AS jornadas,
          fecha_inicio::text,
          fecha_fin::text
        FROM actividades
        WHERE proyecto_id = ${numId}
          AND (fecha_inicio IS NULL OR fecha_fin IS NULL)
        ORDER BY orden ASC
      `
    )

    return NextResponse.json(
      successResponse({
        puedesCerrar: sinPlanificar.length === 0,
        sinPlanificar: sinPlanificar.map(r => ({
          id:          Number(r.id),
          nombre:      r.nombre,
          bloque:      r.bloque,
          jornadas:    r.jornadas != null ? Number(r.jornadas) : null,
          fechaInicio: r.fecha_inicio ?? null,
          fechaFin:    r.fecha_fin    ?? null,
        })),
      })
    )
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error', 500),
      { status: 500 }
    )
  }
}
