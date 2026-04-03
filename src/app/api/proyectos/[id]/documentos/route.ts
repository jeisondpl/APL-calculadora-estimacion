import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { successResponse, errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole } from '@/shared/lib/requireRole'
import { embed } from '@/shared/lib/embeddings'
import { chunkText } from '@/shared/lib/chunker'

type RouteCtx = { params: Promise<{ id: string }> }

// ─── Extractores de texto ─────────────────────────────────────────────────────

async function extractText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  const buf = Buffer.from(await file.arrayBuffer())

  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
    const data = await pdfParse(buf)
    return data.text
  }

  if (ext === 'docx') {
    const mammoth = await import('mammoth')
    const result  = await mammoth.extractRawText({ buffer: buf })
    return result.value
  }

  return buf.toString('utf-8')
}

// ─── POST — subir e ingestar documento ───────────────────────────────────────

export async function POST(req: NextRequest, { params }: RouteCtx) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER')
  if (denied) return denied

  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json(errorResponse('Archivo requerido', 400), { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext)) {
      return NextResponse.json(errorResponse('Solo se aceptan PDF, DOCX o TXT', 400), { status: 400 })
    }

    // 1. Extraer texto
    const texto = await extractText(file)
    if (!texto.trim()) return NextResponse.json(errorResponse('No se pudo extraer texto del archivo', 422), { status: 422 })

    // 2. Eliminar documento anterior del proyecto (chunks se borran en cascada)
    await prisma.$executeRaw`
      DELETE FROM documentos_estimacion WHERE proyecto_id = ${numId}
    `

    // 3. Crear registro del nuevo documento
    const docRows = await prisma.$queryRaw<{ id: number }[]>(
      Prisma.sql`
        INSERT INTO documentos_estimacion (proyecto_id, nombre, tipo, contenido_raw, total_chunks, estado, created_at, updated_at)
        VALUES (${numId}, ${file.name}, ${ext}, ${texto}, 0, 'PROCESANDO', now(), now())
        RETURNING id
      `
    )
    const docId = docRows[0].id

    // 4. Segmentar en chunks
    const chunks = chunkText(texto)

    // 5. Generar embeddings y persistir
    let stored = 0
    for (const chunk of chunks) {
      const vector = await embed(chunk.contenido)
      await prisma.$executeRaw`
        INSERT INTO documento_chunks (documento_id, proyecto_id, seccion, contenido, orden, embedding, created_at)
        VALUES (
          ${docId},
          ${numId},
          ${chunk.seccion ?? null},
          ${chunk.contenido},
          ${chunk.orden},
          ${vector}::float8[],
          now()
        )
      `
      stored++
    }

    // 6. Marcar como LISTO
    await prisma.$executeRaw`
      UPDATE documentos_estimacion SET estado = 'LISTO', total_chunks = ${stored}, updated_at = now()
      WHERE id = ${docId}
    `

    return NextResponse.json(successResponse({ id: docId, nombre: file.name, totalChunks: stored }))
  } catch (e) {
    console.error('[ingesta]', e)
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error en ingesta', 500), { status: 500 })
  }
}

// ─── GET — listar documentos del proyecto ────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER', 'DESARROLLADOR', 'QA')
  if (denied) return denied

  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })

    const docs = await prisma.$queryRaw<{
      id: number; nombre: string; tipo: string; total_chunks: number; estado: string; created_at: Date
    }[]>(
      Prisma.sql`
        SELECT id, nombre, tipo, total_chunks, estado, created_at
        FROM documentos_estimacion
        WHERE proyecto_id = ${numId}
        ORDER BY created_at DESC
      `
    )

    const mapped = docs.map(d => ({
      id:          Number(d.id),
      nombre:      d.nombre,
      tipo:        d.tipo,
      totalChunks: Number(d.total_chunks),
      estado:      d.estado,
      createdAt:   d.created_at,
    }))

    return NextResponse.json(successResponse(mapped))
  } catch (e) {
    return NextResponse.json(errorResponse(e instanceof Error ? e.message : 'Error', 500), { status: 500 })
  }
}
