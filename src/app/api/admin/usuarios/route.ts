import { NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { requireRole } from '@/shared/lib/requireRole'
import bcrypt from 'bcryptjs'

export async function GET() {
  const denied = await requireRole('SUPERUSUARIO')
  if (denied) return denied

  const usuarios = await prisma.usuario.findMany({
    orderBy: { nombre: 'asc' },
    select: {
      id:        true,
      nombre:    true,
      email:     true,
      activo:    true,
      createdAt: true,
      rol:       { select: { id: true, nombre: true } },
    },
  })
  return NextResponse.json(usuarios)
}

export async function POST(req: Request) {
  const denied = await requireRole('SUPERUSUARIO')
  if (denied) return denied

  const { nombre, email, password, rolId } = await req.json()
  if (!nombre || !email || !password || !rolId) {
    return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
  }

  const existing = await prisma.usuario.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 12)
  const usuario = await prisma.usuario.create({
    data: { nombre, email, passwordHash, rolId: Number(rolId) },
    include: { rol: true },
  })
  return NextResponse.json(usuario, { status: 201 })
}
