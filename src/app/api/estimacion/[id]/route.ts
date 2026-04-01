import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'

type RouteCtx = { params: Promise<{ id: string }> }

async function resolveId(params: RouteCtx['params']) {
  const { id } = await params
  const n = parseInt(id)
  return isNaN(n) ? null : n
}

export async function GET(
  _request: NextRequest,
  { params }: RouteCtx
) {
  try {
    const numId = await resolveId(params)
    if (!numId) {
      return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })
    }

    const estimacion = await prisma.estimacion.findUnique({
      where: { id: numId! },
      include: {
        items: {
          include: { componente: { include: { lenguaje: true, tecnologia: true } } },
        },
      },
    })

    if (!estimacion) {
      return NextResponse.json(errorResponse('Estimación no encontrada', 404), { status: 404 })
    }

    const response = {
      id:              estimacion.id,
      nombre:          estimacion.nombre,
      descripcion:     estimacion.descripcion,
      totalBaseMin:    estimacion.totalBaseMin,
      totalCopilotMin: estimacion.totalCopilotMin,
      totalTmeMin:     estimacion.totalTmeMin,
      createdAt:       estimacion.createdAt.toISOString(),
      items: estimacion.items.map(item => ({
        componenteId:     item.componenteId,
        nombreComponente: item.componente.nombreComponente,
        lenguajeNombre:   item.componente.lenguaje.nombre,
        tecnologiaNombre: item.componente.tecnologia.nombre,
        cantidad:         item.cantidad,
        tiempoBaseMin:    item.tiempoBaseMin,
        tiempoCopilotMin: item.tiempoCopilotMin,
        tiempoTmeMin:     item.tiempoTmeMin,
      })),
    }

    return NextResponse.json(successResponse(response))
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error', 500),
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteCtx
) {
  try {
    const numId = await resolveId(params)
    if (!numId) {
      return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })
    }
    await prisma.estimacion.delete({ where: { id: numId } })
    return NextResponse.json(successResponse(null))
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error', 500),
      { status: 500 }
    )
  }
}
