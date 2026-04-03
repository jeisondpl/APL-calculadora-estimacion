import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole } from '@/shared/lib/requireRole'
import OpenAI from 'openai'
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources'
import { embed, cosineSimilarity } from '@/shared/lib/embeddings'

type RouteCtx = { params: Promise<{ id: string }> }
type MsgInput = { role: 'user' | 'assistant'; content: string }

// ─── Cliente LLM (OpenAI-compatible, LM Studio) ───────────────────────────────

const llm = new OpenAI({
  apiKey:  'lm-studio',
  baseURL: 'http://172.29.112.1:1234/v1',
})

const MODEL = 'qwen2.5-7b-instruct-uncensored'

// ─── Tools de negocio ─────────────────────────────────────────────────────────

const TOOLS: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'obtener_resumen_proyecto',
      description: 'Devuelve los datos generales del proyecto: nombre, requerimiento, objetivo, estado, responsables y fechas clave.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'obtener_estado_avance',
      description: 'Devuelve el resumen de avance: total de actividades, cuántas están completadas, en curso, planificadas y pendientes, con sus porcentajes.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listar_actividades_proyecto',
      description: 'Lista todas las actividades del proyecto con su estado (COMPLETADA, EN CURSO, PLANIFICADA, PENDIENTE), fechas, jornadas y responsable asignado.',
      parameters: {
        type: 'object',
        properties: {
          solo_estado: {
            type: 'string',
            enum: ['COMPLETADA', 'EN CURSO', 'PLANIFICADA', 'PENDIENTE'],
            description: 'Filtrar por un estado específico. Omitir para traer todas.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'obtener_proxima_actividad',
      description: 'Devuelve la próxima actividad en curso o la primera planificada, con su responsable y fecha de fin esperada.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'listar_bloqueos_proyecto',
      description: 'Lista las actividades sin responsable asignado o sin fechas planificadas que pueden representar bloqueos o riesgos.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'obtener_contexto_nota_jira',
      description: 'Devuelve todos los campos ya calculados para generar la nota de avance de Jira. Usar esta tool SIEMPRE que el usuario pida una nota Jira, reporte de avance, nota diaria o estado del proyecto.',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'consultar_estimacion',
      description: 'Busca en el documento de estimación (MAU) adjunto al proyecto para recuperar el contexto relevante sobre una actividad, frente o tema específico. Usar cuando el usuario pregunte sobre el alcance estimado, qué decía la estimación, alineación entre ejecución y estimación, o para enriquecer la nota Jira con contexto del documento.',
      parameters: {
        type: 'object',
        properties: {
          consulta: {
            type: 'string',
            description: 'Texto de búsqueda semántica sobre el documento. Puede ser el nombre de una actividad, bloque, frente funcional o una pregunta.',
          },
        },
        required: ['consulta'],
      },
    },
  },
]

// ─── Implementación de tools ──────────────────────────────────────────────────

// Busca los top-3 chunks del MAU más relevantes para la actividad/consulta dada.
// Retorna null si no hay documento o embeddings.
async function buscarContextoEstimacion(proyectoId: number, consulta: string): Promise<string | null> {
  if (!consulta.trim()) return null
  try {
    const docRows = await prisma.$queryRaw<{ id: number }[]>(
      Prisma.sql`SELECT id FROM documentos_estimacion WHERE proyecto_id = ${proyectoId} AND estado = 'LISTO' ORDER BY created_at DESC LIMIT 1`
    )
    if (!docRows.length) return null

    const chunks = await prisma.$queryRaw<{ seccion: string | null; contenido: string; embedding: number[] | null }[]>(
      Prisma.sql`SELECT seccion, contenido, embedding FROM documento_chunks WHERE proyecto_id = ${proyectoId} AND embedding IS NOT NULL`
    )
    if (!chunks.length) return null

    const queryVec = await embed(consulta)
    const top = chunks
      .map(c => ({ seccion: c.seccion, contenido: c.contenido, score: cosineSimilarity(queryVec, c.embedding!) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter(c => c.score > 0.3) // solo relevantes

    if (!top.length) return null
    return top.map(c => `[${c.seccion ?? 'Estimación'}] ${c.contenido}`).join('\n\n')
  } catch {
    return null // si falla el embedding o la consulta, no interrumpe la nota
  }
}

async function runTool(name: string, args: Record<string, unknown>, proyectoId: number): Promise<string> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const rows = await prisma.$queryRaw<{
    requerimiento: string | null
    nombre_proyecto: string | null
    objetivo: string | null
    estado: string
    fecha_estimacion: Date | null
    fecha_ejecucion: Date | null
    estimado_por: string | null
    supervisado_por: string | null
    act_id: number
    act_nombre: string
    bloque: string | null
    jornadas: number | null
    fecha_inicio: Date | null
    fecha_fin: Date | null
    asignado_nombre: string | null
  }[]>(
    Prisma.sql`
      SELECT
        p.requerimiento, p.nombre_proyecto, p.objetivo, p.estado,
        p.fecha_estimacion, p.fecha_ejecucion, p.estimado_por, p.supervisado_por,
        a.id        AS act_id,
        a.nombre    AS act_nombre,
        a.bloque,
        CAST(a.jornadas AS FLOAT) AS jornadas,
        a.fecha_inicio,
        a.fecha_fin,
        ua.nombre   AS asignado_nombre
      FROM proyectos p
      JOIN actividades a ON a.proyecto_id = p.id
      LEFT JOIN usuarios ua ON ua.id = a.asignado_a_id
      WHERE p.id = ${proyectoId}
      ORDER BY a.orden ASC
    `
  )

  if (!rows.length) return JSON.stringify({ error: 'Proyecto no encontrado' })

  const p = rows[0]

  function actEstado(r: typeof rows[0]) {
    if (!r.fecha_inicio || !r.fecha_fin) return 'PENDIENTE'
    const fi = new Date(r.fecha_inicio)
    const ff = new Date(r.fecha_fin)
    if (hoy > ff)  return 'COMPLETADA'
    if (hoy >= fi) return 'EN CURSO'
    return 'PLANIFICADA'
  }

  const fmt = (d: Date | null) => d ? new Date(d).toLocaleDateString('es-ES') : 'No informado'

  if (name === 'obtener_resumen_proyecto') {
    return JSON.stringify({
      requerimiento:      p.requerimiento   ?? 'N/D',
      nombre_proyecto:    p.nombre_proyecto ?? 'N/D',
      objetivo:           p.objetivo        ?? 'N/D',
      estado:             p.estado,
      estimado_por:       p.estimado_por    ?? 'N/D',
      supervisado_por:    p.supervisado_por ?? 'N/D',
      fecha_estimacion:   fmt(p.fecha_estimacion),
      fecha_entrega_tigo: fmt(p.fecha_ejecucion),
      total_actividades:  rows.length,
    })
  }

  if (name === 'obtener_estado_avance') {
    let completadas = 0, enCurso = 0, planificadas = 0, pendientes = 0
    for (const r of rows) {
      const e = actEstado(r)
      if      (e === 'COMPLETADA')  completadas++
      else if (e === 'EN CURSO')    enCurso++
      else if (e === 'PLANIFICADA') planificadas++
      else                          pendientes++
    }
    const total = rows.length
    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0
    return JSON.stringify({
      total,
      completadas,  pct_completadas:  pct(completadas),
      en_curso:     enCurso,    pct_en_curso:     pct(enCurso),
      planificadas, pct_planificadas: pct(planificadas),
      pendientes,   pct_pendientes:   pct(pendientes),
      avance_general: pct(completadas) + Math.round(pct(enCurso) / 2),
    })
  }

  if (name === 'listar_actividades_proyecto') {
    const filtro = (args.solo_estado as string | undefined)?.toUpperCase()
    const lista = rows
      .map(r => ({
        nombre:      r.act_nombre,
        bloque:      r.bloque ?? '—',
        jornadas:    r.jornadas ?? 'Sin jornadas',
        estado:      actEstado(r),
        fecha_inicio: fmt(r.fecha_inicio),
        fecha_fin:    fmt(r.fecha_fin),
        responsable:  r.asignado_nombre ?? 'Sin asignar',
      }))
      .filter(r => !filtro || r.estado === filtro)
    return JSON.stringify({ actividades: lista, total: lista.length })
  }

  if (name === 'obtener_proxima_actividad') {
    const proxima = rows.find(r => actEstado(r) === 'EN CURSO')
                 ?? rows.find(r => actEstado(r) === 'PLANIFICADA')
    if (!proxima) return JSON.stringify({ proxima: null, mensaje: 'No hay actividades en curso ni planificadas.' })
    return JSON.stringify({
      proxima: {
        nombre:      proxima.act_nombre,
        bloque:      proxima.bloque ?? '—',
        estado:      actEstado(proxima),
        fecha_inicio: fmt(proxima.fecha_inicio),
        fecha_fin:    fmt(proxima.fecha_fin),
        responsable:  proxima.asignado_nombre ?? 'Sin asignar',
      },
    })
  }

  if (name === 'listar_bloqueos_proyecto') {
    const bloqueos = rows
      .filter(r => !r.asignado_nombre || !r.fecha_inicio || !r.fecha_fin)
      .map(r => ({
        nombre:      r.act_nombre,
        bloque:      r.bloque ?? '—',
        sin_fecha:   !r.fecha_inicio || !r.fecha_fin,
        sin_asignar: !r.asignado_nombre,
      }))
    return JSON.stringify({ bloqueos, total: bloqueos.length })
  }

  if (name === 'obtener_contexto_nota_jira') {
    // ── Contadores de estado ─────────────────────────────────────────────
    let completadas = 0, enCurso = 0, planificadas = 0, pendientes = 0
    for (const r of rows) {
      const e = actEstado(r)
      if      (e === 'COMPLETADA')  completadas++
      else if (e === 'EN CURSO')    enCurso++
      else if (e === 'PLANIFICADA') planificadas++
      else                          pendientes++
    }
    const total = rows.length
    const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0
    const avanceGeneral = pct(completadas) + Math.round(pct(enCurso) / 2)

    // ── Bloques para desglosar desarrollo / documentación / pruebas ──────
    // Convención: si el bloque contiene "doc" → documentación, "prueba|qa|test" → pruebas, resto → desarrollo
    const esDev  = (b: string | null) => !b || !/doc|prueba|qa|test/i.test(b)
    const esDoc  = (b: string | null) => !!b && /doc/i.test(b)
    const esPrb  = (b: string | null) => !!b && /prueba|qa|test/i.test(b)

    const pctBloque = (fn: (b: string | null) => boolean) => {
      const sub = rows.filter(r => fn(r.bloque))
      if (!sub.length) return 0
      const comp = sub.filter(r => actEstado(r) === 'COMPLETADA').length
      const cur  = sub.filter(r => actEstado(r) === 'EN CURSO').length
      return Math.round(((comp + cur * 0.5) / sub.length) * 100)
    }

    // ── Siguiente paso (actividad en curso o planificada) ─────────────────
    const proxima = rows.find(r => actEstado(r) === 'EN CURSO')
                 ?? rows.find(r => actEstado(r) === 'PLANIFICADA')

    // ── Bloqueos ──────────────────────────────────────────────────────────
    const bloqueos = rows.filter(r => !r.asignado_nombre || !r.fecha_inicio || !r.fecha_fin)

    // ── Cronograma: en riesgo si hay pendientes o bloqueos ────────────────
    let enCronograma: 'SI' | 'NO' | 'EN RIESGO'
    if (bloqueos.length > 0 || pendientes > 0) enCronograma = 'EN RIESGO'
    else if (enCurso > 0 || planificadas > 0)  enCronograma = 'SI'
    else                                        enCronograma = 'SI'  // todo completado

    // ── Fechas de construcción y pruebas (primera actividad de cada bloque)
    const primeraConstr = rows.find(r => esDev(r.bloque))
    const primeraPrueba = rows.find(r => esPrb(r.bloque))

    const actEnCurso   = rows.filter(r => actEstado(r) === 'EN CURSO')
    const primeraCurso = actEnCurso[0] ?? null
    const primPlan     = rows.find(r => actEstado(r) === 'PLANIFICADA') ?? null

    let situacion: string
    if (primeraCurso) {
      const bloquesActivos = [...new Set(actEnCurso.map(r => r.bloque).filter(Boolean))]
      const frenteStr = bloquesActivos.length > 1
        ? bloquesActivos.join(' y ')
        : (primeraCurso.bloque ?? null)
      const frente = frenteStr ? `, con actividades activas en el frente de ${frenteStr}` : ''
      const resp   = primeraCurso.asignado_nombre ? `, a cargo de ${primeraCurso.asignado_nombre}` : ''
      situacion = `El proyecto se encuentra en ejecución${frente}. Actualmente se avanza en la actividad "${primeraCurso.act_nombre}"${resp}. A la fecha se han completado ${completadas} de ${total} actividades.`
    } else if (primPlan) {
      const frente = primPlan.bloque ? ` en el frente de ${primPlan.bloque}` : ''
      situacion = `El proyecto se encuentra en ejecución, sin actividades actualmente en curso. La siguiente actividad programada es "${primPlan.act_nombre}"${frente}. A la fecha se han completado ${completadas} de ${total} actividades.`
    } else if (completadas === total) {
      situacion = `El proyecto ha finalizado. Las ${total} actividades han sido completadas.`
    } else {
      situacion = `El proyecto cuenta con ${completadas} de ${total} actividades completadas. No hay actividades en curso ni planificadas en este momento.`
    }

    return JSON.stringify({
      situacion_actual_base:    situacion,
      avance_general:           avanceGeneral,
      porcentaje_desarrollo:    pctBloque(esDev),
      porcentaje_documentacion: pctBloque(esDoc),
      porcentaje_pruebas:       pctBloque(esPrb),
      siguiente_paso:           proxima?.act_nombre ?? 'No informado',
      fecha_siguiente_paso:     proxima ? fmt(proxima.fecha_fin) : 'No informado',
      problemas_detectados:     bloqueos.length > 0
        ? bloqueos.map(b => `${b.act_nombre}${!b.asignado_nombre ? ' (sin asignar)' : ''}${!b.fecha_inicio || !b.fecha_fin ? ' (sin fechas)' : ''}`).join('; ')
        : 'Sin novedades',
      area_persona_desbloqueo:  bloqueos.length > 0
        ? (p.supervisado_por ?? 'No informado')
        : 'N/A',
      en_cronograma:            enCronograma,
      fecha_inicio_construccion: fmt(primeraConstr?.fecha_inicio ?? null),
      fecha_inicio_pruebas:      fmt(primeraPrueba?.fecha_inicio ?? null),
      fecha_entrega_tigo:        fmt(p.fecha_ejecucion),
      contexto_estimacion:       await buscarContextoEstimacion(
        proyectoId,
        primeraCurso?.act_nombre ?? primPlan?.act_nombre ?? ''
      ),
    })
  }

  if (name === 'consultar_estimacion') {
    const consulta = (args.consulta as string | undefined) ?? ''
    if (!consulta.trim()) return JSON.stringify({ error: 'Consulta vacía' })

    // Verificar si existe documento para este proyecto
    const docRows = await prisma.$queryRaw<{ id: number }[]>(
      Prisma.sql`SELECT id FROM documentos_estimacion WHERE proyecto_id = ${proyectoId} AND estado = 'LISTO' ORDER BY created_at DESC LIMIT 1`
    )
    if (!docRows.length) return JSON.stringify({ sin_documento: true, mensaje: 'No hay documento de estimación adjunto a este proyecto.' })
    const docNombreRows = await prisma.$queryRaw<{ nombre: string }[]>(
      Prisma.sql`SELECT nombre FROM documentos_estimacion WHERE id = ${docRows[0].id}`
    )
    const docNombre = docNombreRows[0]?.nombre ?? 'documento'

    // Traer todos los chunks del proyecto con sus embeddings
    const chunks = await prisma.$queryRaw<{ id: number; seccion: string | null; contenido: string; embedding: number[] | null }[]>(
      Prisma.sql`SELECT id, seccion, contenido, embedding FROM documento_chunks WHERE proyecto_id = ${proyectoId} AND embedding IS NOT NULL`
    )
    if (!chunks.length) return JSON.stringify({ sin_chunks: true, mensaje: 'El documento no tiene chunks indexados.' })

    // Generar embedding de la consulta y calcular similitud
    const queryVec = await embed(consulta)
    const scored = chunks
      .map(c => ({ seccion: c.seccion, contenido: c.contenido, score: cosineSimilarity(queryVec, c.embedding!) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)

    return JSON.stringify({
      documento: docNombre,
      resultados: scored.map(r => ({
        seccion:   r.seccion ?? 'Sin sección',
        contenido: r.contenido,
        relevancia: Math.round(r.score * 100),
      })),
    })
  }

  return JSON.stringify({ error: `Tool desconocida: ${name}` })
}

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Eres analista de control operacional para Tigo Business.

Responde siempre en español.
Usa solo los datos que obtengas de las herramientas disponibles.
No inventes fechas, porcentajes, responsables ni estados.
Si falta un dato usa exactamente: "No informado".
Si no hay bloqueos usa "Sin novedades".
Si no hay responsable de desbloqueo usa "N/A".
Sé conciso y profesional.

REGLA PRIORITARIA PARA NOTA JIRA: Cuando el usuario pida nota Jira, reporte de avance, nota diaria o estado del proyecto:
1. Llama PRIMERO a "obtener_contexto_nota_jira". Esta tool ya incluye el campo "contexto_estimacion" con fragmentos del MAU si existe.
2. Usa "contexto_estimacion" para enriquecer "SITUACIÓN ACTUAL" y "SIGUIENTE PASO" con el alcance real descrito en el documento. Si está vacío, redacta solo con los datos operativos.
3. Con los datos combinados, construye la nota en este formato exacto sin texto adicional:

REGLA PARA PREGUNTAS DE ALCANCE/ESTIMACIÓN: Si el usuario pregunta qué decía la estimación, qué falta por hacer según el documento, si hay brechas o qué se esperaba en un frente, usa "consultar_estimacion" con el término relevante.

**SITUACIÓN ACTUAL:** [1 o 2 frases sobre qué se está haciendo]

**PORCENTAJE DE AVANCE GENERAL:** [porcentaje]%

**Porcentaje de Desarrollo:** [porcentaje]%

**Porcentaje de Documentación:** [porcentaje]%

**Porcentaje de Pruebas:** [porcentaje]%

**SIGUIENTE PASO:** [actividad inmediata]

**FECHA SIGUIENTE PASO:** [dd/mm/aaaa o "No informado"]

**PROBLEMAS DETECTADOS:** [bloqueo o "Sin novedades"]

**AREA/PERSONA DESBLOQUEO:** [responsable o "N/A"]

**EN CRONOGRAMA:** [SI/NO/EN RIESGO]

**FECHA INICIO CONSTRUCCIÓN:** [dd/mm/aaaa o "No informado"]

**FECHA INICIO PRUEBAS:** [dd/mm/aaaa o "No informado"]

**FECHA ENTREGA TIGO:** [dd/mm/aaaa o "No informado"]`

// ─── Detección de intención de nota Jira ─────────────────────────────────────

function esIntenciónNotaJira(messages: MsgInput[]): boolean {
  const ultimo = messages[messages.length - 1]
  if (ultimo?.role !== 'user') return false
  const t = ultimo.content.toLowerCase()

  return (
    // "nota jira" con o sin palabras entre medias
    /nota.{0,30}jira/.test(t) ||
    /jira.{0,30}nota/.test(t) ||
    // "genera / generar + nota"
    /gen[ae]r[a-z]*.{0,30}nota/.test(t) ||
    // "nota + avance / diaria / estado"
    /nota.{0,40}(avance|diaria|estado|reporte)/.test(t) ||
    // "reporte de avance"
    /reporte.{0,20}avance/.test(t) ||
    // "avance del proyecto"
    /avance.{0,20}proyecto/.test(t) ||
    // coincidencia de dos palabras clave en el mismo mensaje
    (t.includes('nota') && t.includes('jira')) ||
    (t.includes('nota') && t.includes('avance')) ||
    (t.includes('nota') && t.includes('formato')) ||
    (t.includes('genera') && t.includes('nota')) ||
    /estado.{0,20}proyecto/.test(t)
  )
}

// ─── Render determinístico de nota Jira ──────────────────────────────────────

type NotaCtx = {
  situacion_actual_base: string
  avance_general: number
  porcentaje_desarrollo: number
  porcentaje_documentacion: number
  porcentaje_pruebas: number
  siguiente_paso: string
  fecha_siguiente_paso: string
  problemas_detectados: string
  area_persona_desbloqueo: string
  en_cronograma: string
  fecha_inicio_construccion: string
  fecha_inicio_pruebas: string
  fecha_entrega_tigo: string
  contexto_estimacion?: string | null
}

function renderNotaJira(d: NotaCtx): string {
  return [
    `**SITUACIÓN ACTUAL:** ${d.situacion_actual_base}`,
    '',
    `**PORCENTAJE DE AVANCE GENERAL:** ${d.avance_general}%`,
    '',
    `**Porcentaje de Desarrollo:** ${d.porcentaje_desarrollo}%`,
    `**Porcentaje de Documentación:** ${d.porcentaje_documentacion}%`,
    `**Porcentaje de Pruebas:** ${d.porcentaje_pruebas}%`,
    '',
    `**SIGUIENTE PASO:** ${d.siguiente_paso}`,
    '',
    `**FECHA SIGUIENTE PASO:** ${d.fecha_siguiente_paso}`,
    '',
    `**PROBLEMAS DETECTADOS:** ${d.problemas_detectados}`,
    '',
    `**AREA/PERSONA DESBLOQUEO:** ${d.area_persona_desbloqueo}`,
    '',
    `**EN CRONOGRAMA:** ${d.en_cronograma}`,
    '',
    `**FECHA INICIO CONSTRUCCIÓN:** ${d.fecha_inicio_construccion}`,
    '',
    `**FECHA INICIO PRUEBAS:** ${d.fecha_inicio_pruebas}`,
    '',
    `**FECHA ENTREGA TIGO:** ${d.fecha_entrega_tigo}`,
  ].join('\n')
}

// Usa el LLM solo para enriquecer situacion_actual_base y siguiente_paso.
// Si falla o excede tiempo, devuelve los valores calculados sin cambios.
async function enriquecerNarrativa(ctx: NotaCtx): Promise<NotaCtx> {
  try {
    const estimPrompt = ctx.contexto_estimacion
      ? `\n\nContexto del documento de estimación (MAU):\n${ctx.contexto_estimacion}`
      : ''

    const res = await llm.chat.completions.create({
      model:       MODEL,
      temperature: 0.3,
      max_tokens:  300,
      messages: [
        {
          role: 'system',
          content: `Eres analista de control operacional. Responde SOLO con un JSON válido con dos campos: "situacion" y "siguiente_paso". Sin texto adicional, sin markdown, sin explicaciones.`,
        },
        {
          role: 'user',
          content: `Mejora la redacción de estos dos campos para una nota de avance Jira. Usa solo los datos proporcionados, no inventes información.${estimPrompt}

Datos actuales:
- situacion_actual_base: "${ctx.situacion_actual_base}"
- siguiente_paso: "${ctx.siguiente_paso}"
- avance_general: ${ctx.avance_general}%
- problemas: "${ctx.problemas_detectados}"

Devuelve ÚNICAMENTE este JSON (sin markdown):
{"situacion": "...", "siguiente_paso": "..."}`,
        },
      ],
    })

    const raw = res.choices[0].message.content?.trim() ?? ''
    // Extraer JSON aunque el modelo envuelva con markdown
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return ctx
    const parsed = JSON.parse(match[0]) as { situacion?: string; siguiente_paso?: string }
    return {
      ...ctx,
      situacion_actual_base: parsed.situacion?.trim()     || ctx.situacion_actual_base,
      siguiente_paso:        parsed.siguiente_paso?.trim() || ctx.siguiente_paso,
    }
  } catch {
    return ctx // fallback: devuelve los valores calculados sin tocar
  }
}

// ─── Loop de tool calling (preguntas generales) ───────────────────────────────

async function runAgentLoop(messages: ChatCompletionMessageParam[], proyectoId: number): Promise<string> {
  const MAX_TOOL_ROUNDS = 3
  let toolRounds = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const forceAnswer = toolRounds >= MAX_TOOL_ROUNDS

    const response = await llm.chat.completions.create({
      model:       MODEL,
      messages,
      tools:       forceAnswer ? undefined : TOOLS,
      tool_choice: forceAnswer ? undefined : 'auto',
      temperature: 0.2,
      max_tokens:  1500,
    })

    const msg = response.choices[0].message

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return msg.content ?? ''
    }

    toolRounds++
    messages.push(msg as ChatCompletionMessageParam)

    for (const tc of msg.tool_calls) {
      if (tc.type !== 'function') continue
      let args: Record<string, unknown> = {}
      try { args = JSON.parse(tc.function.arguments || '{}') } catch { /* args vacíos */ }

      const result = await runTool(tc.function.name, args, proyectoId)
      messages.push({ role: 'tool', tool_call_id: tc.id, content: result })
    }
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: RouteCtx) {
  const denied = await requireRole('SUPERUSUARIO', 'PRODUCT_OWNER', 'DESARROLLADOR', 'QA')
  if (denied) return denied

  try {
    const { id } = await params
    const numId = parseInt(id)
    if (isNaN(numId)) {
      return NextResponse.json(errorResponse('ID inválido', 400), { status: 400 })
    }

    const body: { messages: MsgInput[] } = await req.json()
    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(errorResponse('messages requerido', 400), { status: 400 })
    }

    // ── Camino determinístico: nota Jira ──────────────────────────────────
    if (esIntenciónNotaJira(body.messages)) {
      const rawJson = await runTool('obtener_contexto_nota_jira', {}, numId)
      let ctx = JSON.parse(rawJson) as NotaCtx
      ctx = await enriquecerNarrativa(ctx)
      return NextResponse.json({ content: renderNotaJira(ctx) })
    }

    // ── Camino general: agent loop con tools ──────────────────────────────
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...body.messages.map(m => ({ role: m.role, content: m.content } as ChatCompletionMessageParam)),
    ]

    const content = await runAgentLoop(messages, numId)
    return NextResponse.json({ content })
  } catch (e) {
    console.error('[chat]', e)
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error al conectar con el LLM', 500),
      { status: 500 }
    )
  }
}
