import { NextResponse } from 'next/server'
import { prisma } from '@/shared/lib/prisma'
import { requireRole } from '@/shared/lib/requireRole'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole('SUPERUSUARIO')
  if (denied) return denied

  const { id } = await params
  const { nombre, email, password, rolId, activo } = await req.json()

  const data: Record<string, unknown> = {}
  if (nombre    !== undefined) data.nombre = nombre
  if (email     !== undefined) data.email  = email
  if (rolId     !== undefined) data.rolId  = Number(rolId)
  if (activo    !== undefined) data.activo = activo
  if (password)                data.passwordHash = await bcrypt.hash(password, 12)

  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data,
    include: { rol: true },
  })
  return NextResponse.json(usuario)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireRole('SUPERUSUARIO')
  if (denied) return denied

  const { id } = await params
  await prisma.usuario.delete({ where: { id: Number(id) } })
  return NextResponse.json({ ok: true })
}
