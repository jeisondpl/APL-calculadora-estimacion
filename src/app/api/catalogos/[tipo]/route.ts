import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'

type TipoCatalogo = 'lenguajes' | 'tecnologias' | 'grupos' | 'tipos'

const VALID: TipoCatalogo[] = ['lenguajes', 'tecnologias', 'grupos', 'tipos']

const FINDERS: Record<TipoCatalogo, () => Promise<{ id: number; nombre: string }[]>> = {
  lenguajes:   () => prisma.lenguaje.findMany({ orderBy: { nombre: 'asc' } }),
  tecnologias: () => prisma.tecnologia.findMany({ orderBy: { nombre: 'asc' } }),
  grupos:      () => prisma.grupo.findMany({ orderBy: { nombre: 'asc' } }),
  tipos:       () => prisma.tipoComponente.findMany({ orderBy: { nombre: 'asc' } }),
}

const CREATORS: Record<TipoCatalogo, (nombre: string) => Promise<{ id: number; nombre: string }>> = {
  lenguajes:   n => prisma.lenguaje.create({ data: { nombre: n } }),
  tecnologias: n => prisma.tecnologia.create({ data: { nombre: n } }),
  grupos:      n => prisma.grupo.create({ data: { nombre: n } }),
  tipos:       n => prisma.tipoComponente.create({ data: { nombre: n } }),
}

function resolveType(tipo: string): TipoCatalogo | null {
  return VALID.includes(tipo as TipoCatalogo) ? (tipo as TipoCatalogo) : null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  try {
    const { tipo } = await params
    const t = resolveType(tipo)
    if (!t) return NextResponse.json(errorResponse(`Catálogo '${tipo}' no válido`, 400), { status: 400 })
    const data = await FINDERS[t]()
    return NextResponse.json(successResponse(data))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string }> }
) {
  try {
    const { tipo } = await params
    const t = resolveType(tipo)
    if (!t) return NextResponse.json(errorResponse(`Catálogo '${tipo}' no válido`, 400), { status: 400 })

    const { nombre } = await req.json()
    if (!nombre?.trim()) {
      return NextResponse.json(errorResponse('El nombre es requerido', 400), { status: 400 })
    }

    const item = await CREATORS[t](nombre.trim())
    return NextResponse.json(successResponse(item), { status: 201 })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    const isDup = msg.includes('Unique constraint')
    return NextResponse.json(
      errorResponse(isDup ? 'Ya existe un elemento con ese nombre' : msg, isDup ? 409 : 500),
      { status: isDup ? 409 : 500 }
    )
  }
}
