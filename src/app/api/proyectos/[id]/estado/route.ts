import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole } from '@/shared/lib/requireRole'

type RouteCtx = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER')
  if (denied) return denied

  const { id } = await params
  const body: {
    estado:           string
    desarrolladorIds?: number[]
    asignaciones?:    { actividadId: number; usuarioId: number | null }[]
  } = await req.json()
  const { estado, desarrolladorIds, asignaciones } = body

  if (estado !== 'ABIERTO' && estado !== 'CERRADO') {
    return NextResponse.json(errorResponse('Estado inválido', 400), { status: 400 })
  }

  try {
    const numId = parseInt(id)

    // Validar planificación completa antes de cerrar
    if (estado === 'CERRADO') {
      // Toda actividad debe tener fecha_inicio Y fecha_fin para poder cerrar
      const sinPlanificar = await prisma.$queryRaw<{ id: number; nombre: string }[]>(
        Prisma.sql`
          SELECT id, nombre FROM actividades
          WHERE proyecto_id = ${numId}
            AND (fecha_inicio IS NULL OR fecha_fin IS NULL)
        `
      )
      if (sinPlanificar.length > 0) {
        return NextResponse.json(
          errorResponse(`Planificación incompleta: ${sinPlanificar.length} actividad(es) sin fechas asignadas`, 422),
          { status: 422 }
        )
      }
    }

    await prisma.$executeRaw`UPDATE proyectos SET estado = ${estado}, updated_at = now() WHERE id = ${numId}`

    // Si se cierran y vienen desarrolladores, agregarlos como estimadores (visibilidad)
    if (estado === 'CERRADO' && Array.isArray(desarrolladorIds) && desarrolladorIds.length > 0) {
      for (const uid of desarrolladorIds) {
        await prisma.proyectoEstimador.upsert({
          where:  { proyectoId_usuarioId: { proyectoId: numId, usuarioId: uid } },
          update: {},
          create: { proyectoId: numId, usuarioId: uid },
        })
      }
    }

    // Guardar asignaciones de actividades → desarrollador
    if (Array.isArray(asignaciones) && asignaciones.length > 0) {
      for (const asig of asignaciones) {
        const actId = asig.actividadId
        if (asig.usuarioId) {
          await prisma.$executeRaw`UPDATE actividades SET asignado_a_id = ${asig.usuarioId}, updated_at = now() WHERE id = ${actId} AND proyecto_id = ${numId}`
        } else {
          await prisma.$executeRaw`UPDATE actividades SET asignado_a_id = NULL, updated_at = now() WHERE id = ${actId} AND proyecto_id = ${numId}`
        }
      }
    }

    return NextResponse.json(successResponse({ id: numId, estado }))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}
