import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'

type Params = { params: Promise<{ id: string }> }

// ─── GET /api/componentes/[id] ───────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const componente = await prisma.componente.findUnique({
      where: { id: parseInt(id) },
      include: { grupo: true, tipo: true, lenguaje: true, tecnologia: true, variables: true },
    })
    if (!componente) {
      return NextResponse.json(errorResponse('Componente no encontrado', 404), { status: 404 })
    }
    return NextResponse.json(successResponse(componente))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}

// ─── PATCH /api/componentes/[id] ─────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()
    const { variables, ...componenteData } = body

    const updated = await prisma.componente.update({
      where: { id: parseInt(id) },
      data: componenteData,
      include: { grupo: true, tipo: true, lenguaje: true, tecnologia: true, variables: true },
    })
    return NextResponse.json(successResponse(updated))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}

// ─── DELETE /api/componentes/[id] — soft delete ──────────────────────────────
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const deleted = await prisma.componente.update({
      where: { id: parseInt(id) },
      data: { activo: false },
      include: { grupo: true, tipo: true, lenguaje: true, tecnologia: true, variables: true },
    })
    return NextResponse.json(successResponse(deleted))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}
