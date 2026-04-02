import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'

type RouteCtx = { params: Promise<{ id: string }> }

function toDate(s?: string | null) {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

// ─── PATCH /api/proyectos/[id]/planificar ─────────────────────────────────────
// Body: { actividades: Array<{ id: number; fechaInicio?: string; fechaFin?: string }> }

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })

    const body: { actividades: { id: number; fechaInicio?: string; fechaFin?: string }[] } =
      await req.json()

    if (!Array.isArray(body.actividades)) {
      return NextResponse.json(errorResponse('actividades requeridas', 400), { status: 400 })
    }

    await prisma.$transaction(
      body.actividades.map(a =>
        prisma.actividad.update({
          where: { id: a.id, proyectoId: numId },
          data: {
            fechaInicio: toDate(a.fechaInicio),
            fechaFin:    toDate(a.fechaFin),
          },
        })
      )
    )

    return NextResponse.json(successResponse(null))
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error', 500),
      { status: 500 }
    )
  }
}
