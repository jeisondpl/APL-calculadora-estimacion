/**
 * ETL: bd.csv → PostgreSQL (vía Prisma)
 *
 * Ejecutar: pnpm db:seed
 *
 * Transformaciones aplicadas:
 * - Tiempos "20 min" → 20 (entero)
 * - Porcentajes "30%" → 30 (entero 0-100)
 * - "#REF!" → 0
 * - "String_Boot" → "Spring Boot" (typo del CSV)
 * - Caracteres basura al inicio (ej: "¿Base-provider") → limpiados
 * - Encoding latin1 para tildes correctas
 * - IDs repetidos con distintos nombres → claves compuestas (nombre+lenguaje+tecnología)
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// ─── Correcciones de datos conocidos ────────────────────────────────────────

const TECH_CORRECTIONS: Record<string, string> = {
  'String_Boot':  'Spring Boot',
  'Spring_Boot':  'Spring Boot',
  'React_Native': 'React Native',
}

// ─── Helpers de limpieza ────────────────────────────────────────────────────

/** "20 min" | "07 min" | "#REF!" | "120" → entero */
function parsearMinutos(val: string): number {
  if (!val || val.trim() === '' || val.includes('#REF!')) return 0
  const match = val.replace(/\s/g, '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0
}

/** "30%" | "0%" | "12%" → entero 0-100 */
function parsearPct(val: string): number {
  if (!val || val.trim() === '') return 0
  const n = parseInt(val.replace(/[^0-9]/g, ''), 10)
  return isNaN(n) ? 0 : Math.min(100, Math.max(0, n))
}

/** Limpia texto: quita chars extraños al inicio, normaliza espacios, aplica correcciones */
function limpiarTexto(val: string): string {
  return (val ?? '')
    .trim()
    .replace(/^[^a-zA-Z0-9]/g, '')  // char basura al inicio (ej: ¿)
    .replace(/\uFFFD/g, '')          // replacement char de encoding roto
    .trim()
}

function normalizarTecnologia(val: string): string {
  const limpio = limpiarTexto(val)
  return TECH_CORRECTIONS[limpio] ?? limpio
}

// ─── Tipos internos ─────────────────────────────────────────────────────────

interface FilaCSV {
  idCsv:           number
  nombre:          string
  grupo:           string
  tipo:            string
  nombreVariable:  string
  lenguaje:        string
  tecnologia:      string
  tiempoBaseMin:   number
  publicar:        boolean
  pctCopilot:      number
  tiempoCopilotMin: number
  pctTme:          number
  tiempoTmeMin:    number
  rawOriginal:     string
}

// ─── Parser del CSV ─────────────────────────────────────────────────────────

function parsearCSV(rutaArchivo: string): FilaCSV[] {
  // El CSV tiene encoding latin1 (CP1252) — tildes y caracteres especiales
  const contenido = fs.readFileSync(rutaArchivo, { encoding: 'latin1' })

  // El header ocupa 2 líneas (la columna "TME sobre el valor de la base" tiene salto)
  // Saltamos las 2 primeras líneas
  const lineas = contenido.split('\n').slice(2)

  const filas: FilaCSV[] = []

  for (const linea of lineas) {
    const limpia = linea.trim()
    if (!limpia) continue

    const cols = limpia.split(';')
    if (cols.length < 13) continue

    const [
      id, nombre, grupo, tipo, nombreVar,
      lenguaje, tecnologia,
      tiempoBase, publicar,
      pctCopilot, copilot,
      pctTme, tme,
    ] = cols

    const idNum = parseInt((id ?? '').trim(), 10)
    if (isNaN(idNum)) continue

    filas.push({
      idCsv:            idNum,
      nombre:           limpiarTexto(nombre),
      grupo:            limpiarTexto(grupo),
      tipo:             limpiarTexto(tipo),
      nombreVariable:   limpiarTexto(nombreVar),
      lenguaje:         limpiarTexto(lenguaje),
      tecnologia:       normalizarTecnologia(tecnologia),
      tiempoBaseMin:    parsearMinutos(tiempoBase),
      publicar:         (publicar ?? '').trim() === '1',
      pctCopilot:       parsearPct(pctCopilot),
      tiempoCopilotMin: parsearMinutos(copilot),
      pctTme:           parsearPct(pctTme),
      tiempoTmeMin:     parsearMinutos(tme),
      rawOriginal:      limpia,
    })
  }

  return filas
}

// ─── ETL principal ──────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Iniciando ETL desde bd.csv...')

  const csvPath = path.join(process.cwd(), 'bd.csv')
  const filas = parsearCSV(csvPath)
  console.log(`   Filas parseadas: ${filas.length}`)

  // 1. Upsert catálogos
  const grupos      = [...new Set(filas.map(f => f.grupo).filter(Boolean))]
  const tipos       = [...new Set(filas.map(f => f.tipo).filter(Boolean))]
  const lenguajes   = [...new Set(filas.map(f => f.lenguaje).filter(Boolean))]
  const tecnologias = [...new Set(filas.map(f => f.tecnologia).filter(Boolean))]

  console.log(`   Grupos: ${grupos.length} | Tipos: ${tipos.length} | Lenguajes: ${lenguajes.length} | Tecnologías: ${tecnologias.length}`)

  for (const nombre of grupos) {
    await prisma.grupo.upsert({ where: { nombre }, update: {}, create: { nombre } })
  }
  for (const nombre of tipos) {
    await prisma.tipoComponente.upsert({ where: { nombre }, update: {}, create: { nombre } })
  }
  for (const nombre of lenguajes) {
    await prisma.lenguaje.upsert({ where: { nombre }, update: {}, create: { nombre } })
  }
  for (const nombre of tecnologias) {
    await prisma.tecnologia.upsert({ where: { nombre }, update: {}, create: { nombre } })
  }
  console.log('   ✓ Catálogos insertados')

  // 2. Cargar catálogos en memoria para lookups O(1)
  const gruposDB      = await prisma.grupo.findMany()
  const tiposDB       = await prisma.tipoComponente.findMany()
  const lenguajesDB   = await prisma.lenguaje.findMany()
  const tecnologiasDB = await prisma.tecnologia.findMany()

  const grupoMap      = new Map(gruposDB.map(g => [g.nombre, g.id]))
  const tipoMap       = new Map(tiposDB.map(t => [t.nombre, t.id]))
  const lenguajeMap   = new Map(lenguajesDB.map(l => [l.nombre, l.id]))
  const tecnologiaMap = new Map(tecnologiasDB.map(t => [t.nombre, t.id]))

  // 3. Agrupar filas por clave que coincide con el unique constraint del schema:
  //    (idCsv, nombre, lenguaje, tecnologia) — sin grupo/tipo porque el CSV
  //    tiene el mismo componente con distintos grupos (ej: "Input text" id=1
  //    aparece en "Base-Front" y en "Base"). El primer grupo/tipo encontrado gana.
  const mapaComponentes = new Map<string, FilaCSV[]>()

  for (const fila of filas) {
    const clave = [
      String(fila.idCsv),
      fila.nombre,
      fila.lenguaje,
      fila.tecnologia,
    ].join('||')

    if (!mapaComponentes.has(clave)) mapaComponentes.set(clave, [])
    mapaComponentes.get(clave)!.push(fila)
  }

  console.log(`   Componentes únicos: ${mapaComponentes.size}`)

  // 4. Upsert componentes y crear sus variables
  //    Upsert evita duplicados si el seed se ejecuta más de una vez.
  let errores = 0
  let insertados = 0

  for (const [, variablesList] of mapaComponentes) {
    const primera = variablesList[0]

    const grupoId      = grupoMap.get(primera.grupo)
    const tipoId       = tipoMap.get(primera.tipo)
    const lenguajeId   = lenguajeMap.get(primera.lenguaje)
    const tecnologiaId = tecnologiaMap.get(primera.tecnologia)

    if (!grupoId || !tipoId || !lenguajeId || !tecnologiaId) {
      console.error(`   ✗ Lookup fallido para: ${primera.nombre} (grupo=${primera.grupo}, tipo=${primera.tipo})`)
      errores++
      continue
    }

    try {
      // Upsert del componente: crea o recupera el existente
      const componente = await prisma.componente.upsert({
        where: {
          uq_componente_clave: {
            idCsv:            primera.idCsv,
            nombreComponente: primera.nombre,
            lenguajeId,
            tecnologiaId,
          },
        },
        update: {},
        create: {
          idCsv:            primera.idCsv,
          nombreComponente: primera.nombre,
          publicar:         primera.publicar,
          grupoId,
          tipoId,
          lenguajeId,
          tecnologiaId,
        },
      })

      // Insertar variables (skipDuplicates por si el seed se repite)
      await prisma.variableComponente.createMany({
        data: variablesList.map(v => ({
          componenteId:     componente.id,
          nombreVariable:   v.nombreVariable,
          tiempoBaseMin:    v.tiempoBaseMin,
          pctCopilot:       v.pctCopilot,
          tiempoCopilotMin: v.tiempoCopilotMin,
          pctTme:           v.pctTme,
          tiempoTmeMin:     v.tiempoTmeMin,
          rawOriginal:      v.rawOriginal,
        })),
        skipDuplicates: true,
      })

      insertados++
    } catch (err) {
      console.error(`   ✗ Error insertando "${primera.nombre}":`, err)
      errores++
    }
  }

  console.log(`\n✅ ETL completado: ${insertados} componentes insertados, ${errores} errores`)
  await prisma.$disconnect()
}

seed().catch(async (e) => {
  console.error('Error fatal en ETL:', e)
  await prisma.$disconnect()
  process.exit(1)
})
