import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'

// ─── GET /api/componentes ────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const grupoId      = searchParams.get('grupoId')
    const tipoId       = searchParams.get('tipoId')
    const lenguajeId   = searchParams.get('lenguajeId')
    const tecnologiaId = searchParams.get('tecnologiaId')
    const search       = searchParams.get('search')
    const page         = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit        = Math.min(500, parseInt(searchParams.get('limit') ?? '20'))

    const where = {
      activo: true,
      ...(grupoId      && { grupoId:      parseInt(grupoId) }),
      ...(tipoId       && { tipoId:       parseInt(tipoId) }),
      ...(lenguajeId   && { lenguajeId:   parseInt(lenguajeId) }),
      ...(tecnologiaId && { tecnologiaId: parseInt(tecnologiaId) }),
      ...(search       && {
        nombreComponente: { contains: search, mode: 'insensitive' as const },
      }),
    }

    const [rawItems, total] = await Promise.all([
      prisma.componente.findMany({
        where,
        include: {
          grupo:      true,
          tipo:       true,
          lenguaje:   true,
          tecnologia: true,
          variables:  { where: { activo: true } },
        },
        skip:    (page - 1) * limit,
        take:    limit,
        orderBy: { nombreComponente: 'asc' },
      }),
      prisma.componente.count({ where }),
    ])

    const items = rawItems.map(c => ({
      id:               c.id,
      idCsv:            c.idCsv,
      nombreComponente: c.nombreComponente,
      publicar:         c.publicar,
      grupoId:          c.grupoId,
      grupoNombre:      c.grupo.nombre,
      tipoId:           c.tipoId,
      tipoNombre:       c.tipo.nombre,
      lenguajeId:       c.lenguajeId,
      lenguajeNombre:   c.lenguaje.nombre,
      tecnologiaId:     c.tecnologiaId,
      tecnologiaNombre: c.tecnologia.nombre,
      totalBaseMin:     c.variables.reduce((s, v) => s + v.tiempoBaseMin, 0),
      totalCopilotMin:  c.variables.reduce((s, v) => s + v.tiempoCopilotMin, 0),
      totalTmeMin:      c.variables.reduce((s, v) => s + v.tiempoTmeMin, 0),
      variables:        c.variables.map(v => ({
        id:               v.id,
        nombreVariable:   v.nombreVariable,
        tiempoBaseMin:    v.tiempoBaseMin,
        pctCopilot:       v.pctCopilot,
        tiempoCopilotMin: v.tiempoCopilotMin,
        pctTme:           v.pctTme,
        tiempoTmeMin:     v.tiempoTmeMin,
      })),
    }))

    return NextResponse.json(
      successResponse({ items, total, page, limit }),
      { status: 200 }
    )
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error interno', 500),
      { status: 500 }
    )
  }
}

// ─── POST /api/componentes ────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      nombreComponente, grupoId, tipoId,
      lenguajeId, tecnologiaId, publicar = true, variables = [],
    } = body

    if (!nombreComponente || !grupoId || !tipoId || !lenguajeId || !tecnologiaId) {
      return NextResponse.json(errorResponse('Campos requeridos faltantes', 400), { status: 400 })
    }

    const componente = await prisma.componente.create({
      data: {
        idCsv: 0, // componentes creados manualmente usan id 0
        nombreComponente,
        publicar,
        grupoId,
        tipoId,
        lenguajeId,
        tecnologiaId,
        variables: {
          create: variables.map((v: {
            nombreVariable: string
            tiempoBaseMin: number
            pctCopilot: number
            pctTme: number
          }) => ({
            nombreVariable:   v.nombreVariable,
            tiempoBaseMin:    v.tiempoBaseMin,
            pctCopilot:       v.pctCopilot,
            tiempoCopilotMin: Math.round(v.tiempoBaseMin * (1 - v.pctCopilot / 100)),
            pctTme:           v.pctTme,
            tiempoTmeMin:     Math.round(v.tiempoBaseMin * (1 + v.pctTme / 100)),
          })),
        },
      },
      include: {
        grupo: true, tipo: true, lenguaje: true, tecnologia: true, variables: true,
      },
    })

    return NextResponse.json(successResponse(componente), { status: 201 })
  } catch (e) {
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error al crear', 500),
      { status: 500 }
    )
  }
}
