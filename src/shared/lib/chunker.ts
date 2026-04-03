export interface Chunk {
  seccion: string | null
  contenido: string
  orden: number
}

const CHUNK_SIZE    = 600  // chars por chunk
const CHUNK_OVERLAP = 100  // solapamiento entre chunks

/**
 * Divide el texto en chunks semánticos detectando encabezados como secciones.
 * Estrategia:
 *  1. Parte por párrafos dobles.
 *  2. Detecta encabezados (línea ≤ 80 chars en mayúsculas o con numeración).
 *  3. Agrupa párrafos en chunks de ~CHUNK_SIZE chars con solapamiento.
 */
export function chunkText(text: string): Chunk[] {
  // Normalizar saltos de línea
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

  // Dividir en bloques por línea en blanco
  const blocks = normalized.split(/\n{2,}/).map(b => b.trim()).filter(Boolean)

  const chunks: Chunk[] = []
  let currentSection: string | null = null
  let buffer = ''
  let orden  = 0

  const flush = () => {
    if (!buffer.trim()) return
    chunks.push({ seccion: currentSection, contenido: buffer.trim(), orden: orden++ })
    buffer = ''
  }

  for (const block of blocks) {
    const isHeading = isLikelyHeading(block)

    if (isHeading) {
      flush()
      currentSection = block.slice(0, 200)
      continue
    }

    if (buffer.length + block.length > CHUNK_SIZE) {
      flush()
      // Solapamiento: tomar las últimas CHUNK_OVERLAP chars del bloque anterior
      const overlap = buffer.slice(-CHUNK_OVERLAP)
      buffer = overlap ? overlap + '\n' + block : block
    } else {
      buffer = buffer ? buffer + '\n\n' + block : block
    }
  }

  flush()
  return chunks
}

function isLikelyHeading(line: string): boolean {
  const trimmed = line.trim()
  if (trimmed.length > 120) return false           // muy largo para ser título
  if (/^[A-ZÁÉÍÓÚÑ\d][\dA-ZÁÉÍÓÚÑ\s\-\.]{2,}$/.test(trimmed)) return true  // TODO EN MAYÚSCULAS
  if (/^\d+[\.\)]\s/.test(trimmed)) return true    // 1. Título o 1) Título
  if (/^#{1,4}\s/.test(trimmed)) return true       // Markdown ## Título
  return false
}
