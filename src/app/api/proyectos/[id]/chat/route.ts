import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/shared/lib/prisma'
import { errorResponse } from '@/shared/lib/HttpResponse'
import { requireRole } from '@/shared/lib/requireRole'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, Annotation, START, END } from '@langchain/langgraph'
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from '@langchain/core/messages'

type RouteCtx = { params: Promise<{ id: string }> }

// ─── Tipos internos ───────────────────────────────────────────────────────────

type MsgInput = { role: 'user' | 'assistant'; content: string }

// ─── Contexto del proyecto desde DB ──────────────────────────────────────────

async function getProyectoContext(proyectoId: number): Promise<string> {
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
        p.requerimiento,
        p.nombre_proyecto,
        p.objetivo,
        p.estado,
        p.fecha_estimacion,
        p.fecha_ejecucion,
        p.estimado_por,
        p.supervisado_por,
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

  if (!rows.length) return 'No se encontraron datos del proyecto.'

  const p = rows[0]
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  let completadas = 0, enCurso = 0, planificadas = 0
  const actLines: string[] = []

  for (const r of rows) {
    let estado = 'PENDIENTE'
    if (r.fecha_inicio && r.fecha_fin) {
      const fi = new Date(r.fecha_inicio)
      const ff = new Date(r.fecha_fin)
      if (hoy > ff)          { estado = 'COMPLETADA'; completadas++ }
      else if (hoy >= fi)    { estado = 'EN CURSO';   enCurso++ }
      else                   { estado = 'PLANIFICADA'; planificadas++ }
    }

    const fi = r.fecha_inicio ? new Date(r.fecha_inicio).toLocaleDateString('es-ES') : 'Sin fecha'
    const ff = r.fecha_fin    ? new Date(r.fecha_fin).toLocaleDateString('es-ES')    : 'Sin fecha'
    const asig = r.asignado_nombre ?? 'Sin asignar'
    const blq  = r.bloque ?? '—'
    const jor  = r.jornadas != null ? `${r.jornadas} jornadas` : 'Sin jornadas'

    actLines.push(
      `  - [${estado}] ${r.act_nombre} | Bloque: ${blq} | ${jor} | ${fi} → ${ff} | Responsable: ${asig}`
    )
  }

  const total  = rows.length
  const pctGen = total > 0 ? Math.round(((completadas + enCurso * 0.5) / total) * 100) : 0
  const pctComp = total > 0 ? Math.round((completadas / total) * 100) : 0
  const pctCurso = total > 0 ? Math.round((enCurso / total) * 100) : 0
  const pctPlan  = total > 0 ? Math.round((planificadas / total) * 100) : 0

  // Próxima actividad en curso o planificada
  const proximaAct = rows.find(r => {
    if (!r.fecha_inicio || !r.fecha_fin) return false
    const fi = new Date(r.fecha_inicio)
    const ff = new Date(r.fecha_fin)
    return hoy >= fi && hoy <= ff
  }) ?? rows.find(r => r.fecha_inicio && new Date(r.fecha_inicio) > hoy) ?? null

  const fechaEntrega = p.fecha_ejecucion
    ? new Date(p.fecha_ejecucion).toLocaleDateString('es-ES')
    : 'No definida'
  const fechaEstimacion = p.fecha_estimacion
    ? new Date(p.fecha_estimacion).toLocaleDateString('es-ES')
    : 'No definida'

  return `
=== DATOS DEL PROYECTO ===
Requerimiento : ${p.requerimiento ?? 'N/D'}
Nombre        : ${p.nombre_proyecto ?? 'N/D'}
Objetivo      : ${p.objetivo ?? 'N/D'}
Estado        : ${p.estado}
Estimado por  : ${p.estimado_por ?? 'N/D'}
Supervisado por: ${p.supervisado_por ?? 'N/D'}
Fecha estimación: ${fechaEstimacion}
Fecha entrega   : ${fechaEntrega}

=== RESUMEN DE AVANCE ===
Total actividades : ${total}
Completadas       : ${completadas} (${pctComp}%)
En curso          : ${enCurso} (${pctCurso}%)
Planificadas      : ${planificadas} (${pctPlan}%)
Avance general    : ${pctGen}%
${proximaAct ? `Próxima actividad : ${proximaAct.act_nombre} (${proximaAct.asignado_nombre ?? 'Sin asignar'})` : ''}

=== ACTIVIDADES ===
${actLines.join('\n')}
`.trim()
}

// ─── Prompt del sistema ───────────────────────────────────────────────────────

function buildSystemPrompt0(ctx: string): string {
  return `Eres un analista de control operacional experto en gestión de proyectos tecnológicos para Tigo Business.
Tu función es ayudar al equipo de desarrollo a generar reportes de avance para Jira y responder preguntas sobre el proyecto.

REGLAS IMPORTANTES:
- Usa ÚNICAMENTE los datos reales del proyecto que se te proporcionan. No inventes fechas, porcentajes ni nombres.
- Si no tienes información suficiente para responder, dilo claramente.
- Cuando generes una nota Jira, usa el formato exacto indicado.
- Responde siempre en español.
- Sé conciso y profesional.

DATOS ACTUALES DEL PROYECTO:
${ctx}

FORMATO DE NOTA JIRA (úsalo cuando el usuario pida generar la nota o el reporte):
**SITUACIÓN ACTUAL:** [Describe el estado actual del proyecto en 1-2 oraciones]

**PORCENTAJE DE AVANCE GENERAL:** [XX%]

**Porcentaje de Desarrollo:** [XX%]

**Porcentaje de Documentación:** [XX%]

**Porcentaje de Pruebas:** [XX%]

**SIGUIENTE PASO:** [Describe la próxima acción concreta]

**FECHA SIGUIENTE PASO:** [DD/MM/YYYY]

**PROBLEMAS DETECTADO:** [Lista de problemas o "Sin problemas detectados"]

**AREA/PERSONA DESBLOQUEO:** [Área o persona responsable, o "N/A"]

**EN CRONOGRAMA:** [Sí / No / En riesgo]

**FECHA INICIO CONSTRUCCIÓN/PRUEBAS:** [DD/MM/YYYY]

**FECHA ENTREGA TIGO:** [DD/MM/YYYY o "No definida"]`
}

function buildSystemPrompt(ctx: string): string {
  return `
Eres un analista de control operacional de proyectos tecnológicos.

Reglas:
- Usa solo los datos entregados.
- No inventes fechas, nombres ni porcentajes.
- Si falta información, dilo.
- Responde en español.
- Sé breve y profesional.
- Si el usuario pide nota Jira, usa exactamente este formato:

**SITUACIÓN ACTUAL:** ...

**PORCENTAJE DE AVANCE GENERAL:** ...

**Porcentaje de Desarrollo:** ...

**Porcentaje de Documentación:** ...

**Porcentaje de Pruebas:** ...

**SIGUIENTE PASO:** ...

**FECHA SIGUIENTE PASO:** ...

**PROBLEMAS DETECTADO:** ...

**AREA/PERSONA DESBLOQUEO:** ...

**EN CRONOGRAMA:** ...

**FECHA INICIO CONSTRUCCIÓN/PRUEBAS:** ...

**FECHA ENTREGA TIGO:** ...


Contexto:
${ctx}
`.trim()
}

// ─── Grafo LangGraph mínimo ───────────────────────────────────────────────────

const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
})

function buildGraph(llm: ChatOpenAI) {
  return new StateGraph(GraphState)
    .addNode('chat', async (state) => {
      const response = await llm.invoke(state.messages)
      return { messages: [response] }
    })
    .addEdge(START, 'chat')
    .addEdge('chat', END)
    .compile()
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

    // Obtener contexto real del proyecto
    const ctx = await getProyectoContext(numId)
    const systemPrompt = buildSystemPrompt(ctx)

    // Construir mensajes para LangGraph
    const messages: BaseMessage[] = [
      new SystemMessage(systemPrompt),
      ...body.messages.map(m =>
        m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    ]

    // Instanciar LLM apuntando al servidor local (LM Studio)
    const llm = new ChatOpenAI({
      modelName: 'qwen2.5-7b-instruct-uncensored',
      openAIApiKey: 'lm-studio',          // cualquier string; LM Studio no valida
      configuration: {
        baseURL: 'http://172.29.112.1:1234/v1',
      },
      temperature: 0.3,
      maxTokens: 1024,
    })

    const app = buildGraph(llm)
    const result = await app.invoke({ messages })

    const last = result.messages[result.messages.length - 1]
    const content = typeof last.content === 'string' ? last.content : JSON.stringify(last.content)

    return NextResponse.json({ content })
  } catch (e) {
    console.error('[chat]', e)
    return NextResponse.json(
      errorResponse(e instanceof Error ? e.message : 'Error al conectar con el LLM', 500),
      { status: 500 }
    )
  }
}
