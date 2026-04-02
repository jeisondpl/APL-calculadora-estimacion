import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole, getSessionUser } from '@/shared/lib/requireRole'
import type { IArgsUpdateProyecto, IActividad } from '@/modules/proyectos'

type RouteCtx = { params: Promise<{ id: string }> }

function toDate(s?: string | null) {
  if (!s) return null
  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

async function buildItemsAndTotals(actividades: IActividad[]) {
  const allIds = [...new Set(actividades.flatMap(a => a.componentes.map(c => c.componenteId)))]
  const comps  = await prisma.componente.findMany({
    where: { id: { in: allIds }, activo: true },
    include: { variables: { where: { activo: true } }, grupo: true, lenguaje: true, tecnologia: true },
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
      actBase += baseMin; actCopilot += copilotMin; actTme += tmeMin
      return { componenteId: ac.componenteId, cantidad: cant, reutilizar: ac.reutilizar ?? false, tiempoBaseMin: baseMin, tiempoCopilotMin: copilotMin, tiempoTmeMin: tmeMin }
    })
    proyTotalBase += actBase; proyTotalCopilot += actCopilot; proyTotalTme += actTme
    return { nombre: act.nombre, proceso: act.proceso ?? null, bloque: act.bloque ?? null, jornadas: act.isDefault ? (act.jornadas ?? null) : (act.componentes.length || null), fechaInicio: toDate(act.fechaInicio), fechaFin: toDate(act.fechaFin), orden: act.orden ?? idx, totalBaseMin: actBase, totalCopilotMin: actCopilot, totalTmeMin: actTme, componentes: { create: componentesData } }
  })

  return { actividadesData, proyTotalBase, proyTotalCopilot, proyTotalTme }
}

async function fetchProyecto(id: number) {
  return prisma.proyecto.findUniqueOrThrow({
    where: { id },
    include: {
      estimadores: { include: { usuario: { select: { id: true, nombre: true } } } },
      actividades: {
        orderBy: { orden: 'asc' },
        include: {
          componentes: {
            include: { componente: { include: { grupo: true, lenguaje: true, tecnologia: true } } },
          },
        },
      },
    },
  })
}

type DatosExtraShape = { tiemposEstimador?: { userId: number; nombre: string; horas: number }[]; dependencias?: string[] }
type CreadoPorInfo = { id: number | null; nombre: string | null; tiemposEstimador?: { userId: number; nombre: string; horas: number }[]; dependencias?: string[] }
function formatProyecto(p: Awaited<ReturnType<typeof fetchProyecto>>, creadoPorMap?: Map<number, CreadoPorInfo>) {
  return {
    id: p.id, requerimiento: p.requerimiento, nombreProyecto: p.nombreProyecto, objetivo: p.objetivo,
    fechaEstimacion: p.fechaEstimacion?.toISOString() ?? null, fechaEjecucion: p.fechaEjecucion?.toISOString() ?? null,
    estimadoPor: p.estimadoPor, supervisadoPor: p.supervisadoPor,
    totalBaseMin: p.totalBaseMin, totalCopilotMin: p.totalCopilotMin, totalTmeMin: p.totalTmeMin,
    actividadesCount: p.actividades.length,
    createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
    estimadores: p.estimadores.map(e => ({ id: e.usuario.id, nombre: e.usuario.nombre })),
    actividades: p.actividades.map(a => ({
      id: a.id, nombre: a.nombre, proceso: a.proceso, bloque: a.bloque,
      jornadas: a.jornadas ? Number(a.jornadas) : null,
      fechaInicio: a.fechaInicio?.toISOString() ?? null, fechaFin: a.fechaFin?.toISOString() ?? null,
      orden: a.orden, totalBaseMin: a.totalBaseMin, totalCopilotMin: a.totalCopilotMin, totalTmeMin: a.totalTmeMin,
      creadoPorId:      creadoPorMap ? (creadoPorMap.get(a.id)?.id              ?? null) : null,
      creadoPorNombre:  creadoPorMap ? (creadoPorMap.get(a.id)?.nombre          ?? null) : null,
      tiemposEstimador: creadoPorMap ? (creadoPorMap.get(a.id)?.tiemposEstimador ?? [])  : [],
      dependencias:     creadoPorMap ? (creadoPorMap.get(a.id)?.dependencias     ?? [])  : [],
      componentes: a.componentes.map(ac => ({
        id: ac.id, componenteId: ac.componenteId,
        nombreComponente: ac.componente.nombreComponente, grupoNombre: ac.componente.grupo.nombre,
        lenguajeNombre: ac.componente.lenguaje.nombre, tecnologiaNombre: ac.componente.tecnologia.nombre,
        proceso: a.proceso, cantidad: ac.cantidad, reutilizar: ac.reutilizar,
        tiempoBaseMin: ac.tiempoBaseMin, tiempoCopilotMin: ac.tiempoCopilotMin, tiempoTmeMin: ac.tiempoTmeMin,
      })),
    })),
  }
}

// ─── GET /api/proyectos/[id] ──────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })
    const p = await fetchProyecto(numId)

    const actIds = p.actividades.map(a => a.id)
    const [proyRaw, creadoPorRows] = await Promise.all([
      prisma.$queryRaw<{ estado: string; no_prefas: number | null; tiempo_sesion_horas: string | null }[]>(
        Prisma.sql`SELECT estado, no_prefas, tiempo_sesion_horas FROM proyectos WHERE id = ${numId}`
      ).then(r => r[0]),
      actIds.length > 0
        ? prisma.$queryRaw<{ id: number; creado_por_id: number | null; creado_por_nombre: string | null; datos_extra: unknown }[]>(
            Prisma.sql`SELECT a.id, a.creado_por_id, u.nombre AS creado_por_nombre, a.datos_extra FROM actividades a LEFT JOIN usuarios u ON u.id = a.creado_por_id WHERE a.id IN (${Prisma.join(actIds)})`
          )
        : Promise.resolve([] as { id: number; creado_por_id: number | null; creado_por_nombre: string | null; datos_extra: unknown }[]),
    ])
    const creadoPorMap = new Map(creadoPorRows.map(r => {
      const extra = r.datos_extra as DatosExtraShape | null
      return [
        Number(r.id),
        {
          id:               r.creado_por_id ? Number(r.creado_por_id) : null,
          nombre:           r.creado_por_nombre ?? null,
          tiemposEstimador: extra?.tiemposEstimador ?? [],
          dependencias:     extra?.dependencias     ?? [],
        },
      ]
    }))

    return NextResponse.json(successResponse({
      ...formatProyecto(p, creadoPorMap),
      estado:           proyRaw?.estado           ?? 'ABIERTO',
      noPrefas:         proyRaw?.no_prefas         ?? 0,
      tiempoSesionHoras: proyRaw?.tiempo_sesion_horas ? Number(proyRaw.tiempo_sesion_horas) : 0,
    }))
  } catch (e) {
    const notFound = e instanceof Error && e.message.includes('No record found')
    return NextResponse.json(errorResponse(notFound ? 'Proyecto no encontrado' : (e instanceof Error ? e.message : 'Error'), notFound ? 404 : 500), { status: notFound ? 404 : 500 })
  }
}

// ─── PUT /api/proyectos/[id] — guardado por propietario (sin pisar a otros) ───
export async function PUT(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })

    const body: IArgsUpdateProyecto = await req.json()
    if (!body.requerimiento?.trim())  return NextResponse.json(errorResponse('Requerimiento requerido', 400), { status: 400 })
    if (!body.nombreProyecto?.trim()) return NextResponse.json(errorResponse('Nombre requerido', 400), { status: 400 })

    const sessionUser   = await getSessionUser()
    const currentUserId = sessionUser?.userId ?? null

    const estimadorIds = body.estimadorIds ?? []
    let estimadoPorStr: string | null = body.estimadoPor ?? null
    if (estimadorIds.length > 0) {
      const usuarios = await prisma.usuario.findMany({ where: { id: { in: estimadorIds } }, select: { nombre: true } })
      estimadoPorStr = usuarios.map(u => u.nombre).join(', ') || null
    }

    // 1. Leer actividades actuales de DB (con creado_por_id y datos_extra)
    const existingActs = await prisma.$queryRaw<{
      id: number; nombre: string; creado_por_id: number | null; datos_extra: unknown
    }[]>(
      Prisma.sql`SELECT id, nombre, creado_por_id, datos_extra FROM actividades WHERE proyecto_id = ${numId}`
    )

    // 2. Separar payload: actividades del usuario actual (no default) vs defaults
    const myCustom   = (body.actividades ?? []).filter(a => !a.isDefault && a.creadoPorId === currentUserId)
    const payDefaults = (body.actividades ?? []).filter(a => a.isDefault)

    // 3. IDs de actividades propias a eliminar
    const deleteIds = existingActs
      .filter(a => currentUserId && a.creado_por_id === currentUserId)
      .map(a => a.id)

    // 4. Calcular datos de nuevas actividades propias
    const { actividadesData } = await buildItemsAndTotals(myCustom)

    // 5. Actualizar metadata del proyecto + estimadores
    await prisma.$transaction([
      prisma.proyectoEstimador.deleteMany({ where: { proyectoId: numId } }),
      prisma.proyecto.update({
        where: { id: numId },
        data: {
          requerimiento:   body.requerimiento.trim(),
          nombreProyecto:  body.nombreProyecto.trim(),
          objetivo:        body.objetivo       ?? null,
          fechaEstimacion: toDate(body.fechaEstimacion),
          fechaEjecucion:  toDate(body.fechaEjecucion),
          estimadoPor:     estimadoPorStr,
          supervisadoPor:  body.supervisadoPor ?? null,
          ...(estimadorIds.length > 0 && {
            estimadores: { create: estimadorIds.map(uid => ({ usuarioId: uid })) },
          }),
        },
      }),
    ])

    // 6. Eliminar solo las actividades del usuario actual
    if (deleteIds.length > 0) {
      await prisma.actividad.deleteMany({ where: { id: { in: deleteIds } } })
    }

    // 7. Crear nuevas actividades del usuario actual (con sus componentes)
    for (let i = 0; i < myCustom.length; i++) {
      const act     = myCustom[i]
      const actData = actividadesData[i]
      const created = await prisma.actividad.create({ data: { ...actData, proyectoId: numId } })
      const extraObj: Record<string, unknown> = {}
      if (act.dependencias?.length) extraObj.dependencias = act.dependencias
      const datosExtra = Object.keys(extraObj).length ? JSON.stringify(extraObj) : null
      await prisma.$executeRaw`
        UPDATE actividades SET creado_por_id = ${currentUserId}, datos_extra = ${datosExtra}::jsonb
        WHERE id = ${created.id}`
    }

    // 8. Actividades base: merge tiemposEstimador (solo actualizar entry del usuario actual)
    for (const act of payDefaults) {
      const dbAct = existingActs.find(a => a.nombre === act.nombre)
      if (!dbAct) continue
      const prevExtra   = dbAct.datos_extra as DatosExtraShape | null
      const prevTiempos = prevExtra?.tiemposEstimador ?? []
      const myEntry     = act.tiemposEstimador?.find(t => t.userId === currentUserId)
      const merged      = [
        ...prevTiempos.filter(t => t.userId !== currentUserId),
        ...(myEntry ? [myEntry] : []),
      ]
      const mergedExtra: DatosExtraShape = {
        tiemposEstimador: merged,
        dependencias:     prevExtra?.dependencias ?? [],
      }
      const jornadasVal = act.jornadas ?? null
      await prisma.$executeRaw`
        UPDATE actividades
        SET    datos_extra = ${JSON.stringify(mergedExtra)}::jsonb,
               jornadas    = ${jornadasVal}
        WHERE  id = ${dbAct.id}`
    }

    // 9. Guardar no_prefas / tiempo_sesion_horas
    const noPrefas          = body.noPrefas          ?? 0
    const tiempoSesionHoras = body.tiempoSesionHoras ?? 0
    await prisma.$executeRaw`UPDATE proyectos SET no_prefas = ${noPrefas}, tiempo_sesion_horas = ${tiempoSesionHoras} WHERE id = ${numId}`

    // 10. Recalcular totales desde TODAS las actividades del proyecto
    const totalsRaw = await prisma.$queryRaw<{ base: unknown; copilot: unknown; tme: unknown }[]>(
      Prisma.sql`SELECT COALESCE(SUM(total_base_min),0) AS base, COALESCE(SUM(total_copilot_min),0) AS copilot, COALESCE(SUM(total_tme_min),0) AS tme FROM actividades WHERE proyecto_id = ${numId}`
    )
    await prisma.proyecto.update({
      where: { id: numId },
      data: {
        totalBaseMin:    Number(totalsRaw[0]?.base    ?? 0),
        totalCopilotMin: Number(totalsRaw[0]?.copilot ?? 0),
        totalTmeMin:     Number(totalsRaw[0]?.tme     ?? 0),
      },
    })

    // 11. Devolver proyecto actualizado
    const full = await fetchProyecto(numId)
    const actIds = full.actividades.map(a => a.id)
    const creadoPorRows = actIds.length > 0
      ? await prisma.$queryRaw<{ id: number; creado_por_id: number | null; creado_por_nombre: string | null; datos_extra: unknown }[]>(
          Prisma.sql`SELECT a.id, a.creado_por_id, u.nombre AS creado_por_nombre, a.datos_extra FROM actividades a LEFT JOIN usuarios u ON u.id = a.creado_por_id WHERE a.id IN (${Prisma.join(actIds)})`
        )
      : []
    const creadoPorMap = new Map(creadoPorRows.map(r => {
      const extra = r.datos_extra as DatosExtraShape | null
      return [Number(r.id), {
        id:               r.creado_por_id ? Number(r.creado_por_id) : null,
        nombre:           r.creado_por_nombre ?? null,
        tiemposEstimador: extra?.tiemposEstimador ?? [],
        dependencias:     extra?.dependencias     ?? [],
      }]
    }))
    return NextResponse.json(successResponse(formatProyecto(full, creadoPorMap)))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}

// ─── DELETE /api/proyectos/[id] ───────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER')
  if (denied) return denied
  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })
    await prisma.proyecto.delete({ where: { id: numId } })
    return NextResponse.json(successResponse(null))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}
