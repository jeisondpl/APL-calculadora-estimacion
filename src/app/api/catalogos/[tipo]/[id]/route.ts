import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'

type TipoCatalogo = 'lenguajes' | 'tecnologias' | 'grupos' | 'tipos'

const UPDATERS: Record<TipoCatalogo, (id: number, nombre: string) => Promise<{ id: number; nombre: string }>> = {
  lenguajes:   (id, n) => prisma.lenguaje.update({ where: { id }, data: { nombre: n } }),
  tecnologias: (id, n) => prisma.tecnologia.update({ where: { id }, data: { nombre: n } }),
  grupos:      (id, n) => prisma.grupo.update({ where: { id }, data: { nombre: n } }),
  tipos:       (id, n) => prisma.tipoComponente.update({ where: { id }, data: { nombre: n } }),
}

const DELETERS: Record<TipoCatalogo, (id: number) => Promise<unknown>> = {
  lenguajes:   id => prisma.lenguaje.delete({ where: { id } }),
  tecnologias: id => prisma.tecnologia.delete({ where: { id } }),
  grupos:      id => prisma.grupo.delete({ where: { id } }),
  tipos:       id => prisma.tipoComponente.delete({ where: { id } }),
}

const VALID: TipoCatalogo[] = ['lenguajes', 'tecnologias', 'grupos', 'tipos']

function resolveType(tipo: string): TipoCatalogo | null {
  return VALID.includes(tipo as TipoCatalogo) ? (tipo as TipoCatalogo) : null
}

type RouteCtx = { params: Promise<{ tipo: string; id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  try {
    const { tipo, id } = await params
    const t = resolveType(tipo)
    if (!t) return NextResponse.json(errorResponse(`Catálogo '${tipo}' no válido`, 400), { status: 400 })

    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })

    const { nombre } = await req.json()
    if (!nombre?.trim()) {
      return NextResponse.json(errorResponse('El nombre es requerido', 400), { status: 400 })
    }

    const item = await UPDATERS[t](numId, nombre.trim())
    return NextResponse.json(successResponse(item))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    const isDup = msg.includes('Unique constraint')
    return NextResponse.json(
      errorResponse(isDup ? 'Ya existe un elemento con ese nombre' : msg, isDup ? 409 : 500),
      { status: isDup ? 409 : 500 }
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  try {
    const { tipo, id } = await params
    const t = resolveType(tipo)
    if (!t) return NextResponse.json(errorResponse(`Catálogo '${tipo}' no válido`, 400), { status: 400 })

    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })

    await DELETERS[t](numId)
    return NextResponse.json(successResponse(null))
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    const isFk = msg.includes('Foreign key constraint') || msg.includes('violates foreign key')
    return NextResponse.json(
      errorResponse(
        isFk ? 'No se puede eliminar: hay componentes que usan este elemento' : msg,
        isFk ? 409 : 500
      ),
      { status: isFk ? 409 : 500 }
    )
  }
}
