import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole, getSessionUser } from '@/shared/lib/requireRole'
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

    const sessionUser = await getSessionUser()
    const currentUserId = sessionUser?.userId ?? 0
    const currentRol    = sessionUser?.rol     ?? ''

    const isDevOrQA = currentRol === 'DESARROLLADOR' || currentRol === 'QA'
    const whereClause = isDevOrQA
      ? { estimadores: { some: { usuarioId: currentUserId } } }
      : {}

    const [items, total] = await Promise.all([
      prisma.proyecto.findMany({
        where:   whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          actividades: { select: { id: true } },
          estimadores: { include: { usuario: { select: { id: true, nombre: true } } } },
        },
      }),
      prisma.proyecto.count({ where: whereClause }),
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
        estimadores:     p.estimadores.map(e => ({ id: e.usuario.id, nombre: e.usuario.nombre })),
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

    const estimadorIds = body.estimadorIds ?? []

    // Fetch estimador names to build estimadoPor display string
    let estimadoPorStr: string | null = body.estimadoPor ?? null
    if (estimadorIds.length > 0) {
      const usuarios = await prisma.usuario.findMany({
        where: { id: { in: estimadorIds } },
        select: { nombre: true },
      })
      estimadoPorStr = usuarios.map(u => u.nombre).join(', ') || null
    }

    const proyecto = await prisma.proyecto.create({
      data: {
        requerimiento:   body.requerimiento.trim(),
        nombreProyecto:  body.nombreProyecto.trim(),
        objetivo:        body.objetivo        ?? null,
        fechaEstimacion: toDate(body.fechaEstimacion),
        fechaEjecucion:  toDate(body.fechaEjecucion),
        estimadoPor:     estimadoPorStr,
        supervisadoPor:  body.supervisadoPor  ?? null,
        totalBaseMin:    proyTotalBase,
        totalCopilotMin: proyTotalCopilot,
        totalTmeMin:     proyTotalTme,
        actividades: { create: actividadesData },
        ...(estimadorIds.length > 0 && {
          estimadores: {
            create: estimadorIds.map(uid => ({ usuarioId: uid })),
          },
        }),
      },
    })

    // Set creado_por_id, datos_extra on newly created activities (Prisma client doesn't know these fields)
    for (let i = 0; i < (body.actividades ?? []).length; i++) {
      const act       = body.actividades![i]
      const orden     = actividadesData[i].orden
      const creadoPorId = act.creadoPorId ?? null
      const extraObj: Record<string, unknown> = {}
      if (act.tiemposEstimador?.length) extraObj.tiemposEstimador = act.tiemposEstimador
      if (act.dependencias?.length)     extraObj.dependencias     = act.dependencias
      const datosExtra = Object.keys(extraObj).length ? JSON.stringify(extraObj) : null
      if (creadoPorId || datosExtra) {
        await prisma.$executeRaw`
          UPDATE actividades
          SET    creado_por_id = ${creadoPorId},
                 datos_extra   = ${datosExtra}::jsonb
          WHERE  proyecto_id   = ${proyecto.id}
          AND    orden          = ${orden}`
      }
    }
    // Save no_prefas / tiempo_sesion_horas
    const noPrefas          = body.noPrefas          ?? 0
    const tiempoSesionHoras = body.tiempoSesionHoras ?? 0
    await prisma.$executeRaw`UPDATE proyectos SET no_prefas = ${noPrefas}, tiempo_sesion_horas = ${tiempoSesionHoras} WHERE id = ${proyecto.id}`

    const full = await fetchProyecto(proyecto.id)
    return NextResponse.json(successResponse(formatProyecto(full)), { status: 201 })
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}
