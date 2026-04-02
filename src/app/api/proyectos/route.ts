import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole } from '@/shared/lib/requireRole'
import type { IArgsCreateProyecto, IActividad } from '@/modules/proyectos'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toDate(s?: string | null) {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

async function buildItemsAndTotals(actividades: IActividad[]) {
  // Collect all componenteIds to fetch in one query
  const allIds = [...new Set(actividades.flatMap(a => a.componentes.map(c => c.componenteId)))]
  const comps = await prisma.componente.findMany({
    where: { id: { in: allIds }, activo: true },
    include: {
      variables: { where: { activo: true } },
      grupo: true,
      lenguaje: true,
      tecnologia: true,
    },
  })
  const compMap = new Map(comps.map(c => [c.id, c]))

  let proyTotalBase = 0, proyTotalCopilot = 0, proyTotalTme = 0

  const actividadesData = actividades.map((act, idx) => {
    let actBase = 0, actCopilot = 0, actTme = 0

    const componentesData = act.componentes.map(ac => {
      const comp = compMap.get(ac.componenteId)
      const cant = Math.max(1, ac.cantidad)
      const baseMin    = comp ? comp.variables.reduce((s, v) => s + v.tiempoBaseMin,    0) * cant : 0
      const copilotMin = comp ? comp.variables.reduce((s, v) => s + v.tiempoCopilotMin, 0) * cant : 0
      const tmeMin     = comp ? comp.variables.reduce((s, v) => s + v.tiempoTmeMin,     0) * cant : 0
      actBase    += baseMin
      actCopilot += copilotMin
      actTme     += tmeMin
      return {
        componenteId:    ac.componenteId,
        cantidad:        cant,
        reutilizar:      ac.reutilizar ?? false,
        tiempoBaseMin:   baseMin,
        tiempoCopilotMin: copilotMin,
        tiempoTmeMin:    tmeMin,
      }
    })

    proyTotalBase    += actBase
    proyTotalCopilot += actCopilot
    proyTotalTme     += actTme

    return {
      nombre:      act.nombre,
      proceso:     act.proceso ?? null,
      bloque:      act.bloque  ?? null,
      jornadas:    act.isDefault ? (act.jornadas ?? null) : (act.componentes.length || null),
      fechaInicio: toDate(act.fechaInicio),
      fechaFin:    toDate(act.fechaFin),
      orden:       act.orden ?? idx,
      totalBaseMin:    actBase,
      totalCopilotMin: actCopilot,
      totalTmeMin:     actTme,
      componentes: { create: componentesData },
    }
  })

  return { actividadesData, proyTotalBase, proyTotalCopilot, proyTotalTme }
}

function formatProyecto(p: Awaited<ReturnType<typeof fetchProyecto>>) {
  return {
    id:              p.id,
    requerimiento:   p.requerimiento,
    nombreProyecto:  p.nombreProyecto,
    objetivo:        p.objetivo,
    fechaEstimacion: p.fechaEstimacion?.toISOString() ?? null,
    fechaEjecucion:  p.fechaEjecucion?.toISOString()  ?? null,
    estimadoPor:     p.estimadoPor,
    supervisadoPor:  p.supervisadoPor,
    totalBaseMin:    p.totalBaseMin,
    totalCopilotMin: p.totalCopilotMin,
    totalTmeMin:     p.totalTmeMin,
    actividadesCount: p.actividades.length,
    createdAt:       p.createdAt.toISOString(),
    updatedAt:       p.updatedAt.toISOString(),
    actividades: p.actividades.map(a => ({
      id:          a.id,
      nombre:      a.nombre,
      proceso:     a.proceso,
      bloque:      a.bloque,
      jornadas:    a.jornadas ? Number(a.jornadas) : null,
      fechaInicio: a.fechaInicio?.toISOString() ?? null,
      fechaFin:    a.fechaFin?.toISOString()    ?? null,
      orden:       a.orden,
      totalBaseMin:    a.totalBaseMin,
      totalCopilotMin: a.totalCopilotMin,
      totalTmeMin:     a.totalTmeMin,
      componentes: a.componentes.map(ac => ({
        id:               ac.id,
        componenteId:     ac.componenteId,
        nombreComponente: ac.componente.nombreComponente,
        grupoNombre:      ac.componente.grupo.nombre,
        lenguajeNombre:   ac.componente.lenguaje.nombre,
        tecnologiaNombre: ac.componente.tecnologia.nombre,
        proceso:          a.proceso,
        cantidad:         ac.cantidad,
        reutilizar:       ac.reutilizar,
        tiempoBaseMin:    ac.tiempoBaseMin,
        tiempoCopilotMin: ac.tiempoCopilotMin,
        tiempoTmeMin:     ac.tiempoTmeMin,
      })),
    })),
  }
}

async function fetchProyecto(id: number) {
  return prisma.proyecto.findUniqueOrThrow({
    where: { id },
    include: {
      actividades: {
        orderBy: { orden: 'asc' },
        include: {
          componentes: {
            include: {
              componente: {
                include: { grupo: true, lenguaje: true, tecnologia: true },
              },
            },
          },
        },
      },
    },
  })
}

// ─── GET /api/proyectos ───────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '10'))

    const [items, total] = await Promise.all([
      prisma.proyecto.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { actividades: { select: { id: true } } },
      }),
      prisma.proyecto.count(),
    ])

    // Traer estado via raw para no depender del cliente Prisma generado
    const ids = items.length > 0 ? items.map(p => p.id) : [0]
    const estadoRows = await prisma.$queryRaw<{ id: number; estado: string }[]>(
      Prisma.sql`SELECT id, estado FROM proyectos WHERE id IN (${Prisma.join(ids)})`
    )
    const estadoMap = new Map(estadoRows.map(r => [Number(r.id), r.estado]))

    const response = {
      items: items.map(p => ({
        id:              p.id,
        requerimiento:   p.requerimiento,
        nombreProyecto:  p.nombreProyecto,
        objetivo:        p.objetivo,
        fechaEstimacion: p.fechaEstimacion?.toISOString() ?? null,
        estimadoPor:     p.estimadoPor,
        supervisadoPor:  p.supervisadoPor,
        totalBaseMin:    p.totalBaseMin,
        totalCopilotMin: p.totalCopilotMin,
        totalTmeMin:     p.totalTmeMin,
        actividadesCount: p.actividades.length,
        estado:          estadoMap.get(p.id) ?? 'ABIERTO',
        createdAt:       p.createdAt.toISOString(),
      })),
      total, page, limit,
    }

    return NextResponse.json(successResponse(response))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}

// ─── POST /api/proyectos ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER')
  if (denied) return denied
  try {
    const body: IArgsCreateProyecto = await req.json()

    if (!body.requerimiento?.trim())  return NextResponse.json(errorResponse('Requerimiento requerido', 400), { status: 400 })
    if (!body.nombreProyecto?.trim()) return NextResponse.json(errorResponse('Nombre del proyecto requerido', 400), { status: 400 })

    const { actividadesData, proyTotalBase, proyTotalCopilot, proyTotalTme } =
      await buildItemsAndTotals(body.actividades ?? [])

    const proyecto = await prisma.proyecto.create({
      data: {
        requerimiento:   body.requerimiento.trim(),
        nombreProyecto:  body.nombreProyecto.trim(),
        objetivo:        body.objetivo        ?? null,
        fechaEstimacion: toDate(body.fechaEstimacion),
        fechaEjecucion:  toDate(body.fechaEjecucion),
        estimadoPor:     body.estimadoPor     ?? null,
        supervisadoPor:  body.supervisadoPor  ?? null,
        totalBaseMin:    proyTotalBase,
        totalCopilotMin: proyTotalCopilot,
        totalTmeMin:     proyTotalTme,
        actividades: { create: actividadesData },
      },
    })

    const full = await fetchProyecto(proyecto.id)
    return NextResponse.json(successResponse(formatProyecto(full)), { status: 201 })
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}
