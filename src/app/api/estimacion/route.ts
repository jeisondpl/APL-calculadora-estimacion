import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'

// ─── POST /api/estimacion — calcular y persistir ─────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { nombre, descripcion, items } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        errorResponse('Se requiere al menos un componente', 400),
        { status: 400 }
      )
    }

    const componenteIds: number[] = items.map((i: { componenteId: number }) => i.componenteId)

    const componentes = await prisma.componente.findMany({
      where: { id: { in: componenteIds }, activo: true },
      include: { variables: { where: { activo: true } } },
    })

    if (componentes.length !== componenteIds.length) {
      return NextResponse.json(
        errorResponse('Uno o más componentes no encontrados', 404),
        { status: 404 }
      )
    }

    // Calcular totales por ítem
    const estimacionItems = items.map((item: { componenteId: number; cantidad: number }) => {
      const comp = componentes.find(c => c.id === item.componenteId)!
      const cantidad = Math.max(1, item.cantidad)
      return {
        componenteId:     comp.id,
        cantidad,
        tiempoBaseMin:    comp.variables.reduce((s, v) => s + v.tiempoBaseMin,    0) * cantidad,
        tiempoCopilotMin: comp.variables.reduce((s, v) => s + v.tiempoCopilotMin, 0) * cantidad,
        tiempoTmeMin:     comp.variables.reduce((s, v) => s + v.tiempoTmeMin,     0) * cantidad,
      }
    })

    const totalBaseMin    = estimacionItems.reduce((s, i) => s + i.tiempoBaseMin,    0)
    const totalCopilotMin = estimacionItems.reduce((s, i) => s + i.tiempoCopilotMin, 0)
    const totalTmeMin     = estimacionItems.reduce((s, i) => s + i.tiempoTmeMin,     0)

    const estimacion = await prisma.estimacion.create({
      data: {
        nombre:         nombre ?? null,
        descripcion:    descripcion ?? null,
        totalBaseMin,
        totalCopilotMin,
        totalTmeMin,
        items: { create: estimacionItems },
      },
      include: {
        items: {
          include: { componente: { include: { lenguaje: true, tecnologia: true } } },
        },
      },
    })

    // Mapear a IResponseEstimacion con campos planos
    const response = {
      id:              estimacion.id,
      nombre:          estimacion.nombre,
      descripcion:     estimacion.descripcion,
      totalBaseMin:    estimacion.totalBaseMin,
      totalCopilotMin: estimacion.totalCopilotMin,
      totalTmeMin:     estimacion.totalTmeMin,
      createdAt:       estimacion.createdAt.toISOString(),
      items: estimacion.items.map(item => ({
        componenteId:      item.componenteId,
        nombreComponente:  item.componente.nombreComponente,
        lenguajeNombre:    item.componente.lenguaje.nombre,
        tecnologiaNombre:  item.componente.tecnologia.nombre,
        cantidad:          item.cantidad,
        tiempoBaseMin:     item.tiempoBaseMin,
        tiempoCopilotMin:  item.tiempoCopilotMin,
        tiempoTmeMin:      item.tiempoTmeMin,
      })),
    }

    return NextResponse.json(successResponse(response), { status: 201 })
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error al calcular', 500),
      { status: 500 }
    )
  }
}

// ─── GET /api/estimacion — listar estimaciones guardadas ─────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))

    const [items, total] = await Promise.all([
      prisma.estimacion.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.estimacion.count(),
    ])

    return NextResponse.json(successResponse({ items, total, page, limit }))
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error', 500),
      { status: 500 }
    )
  }
}
