'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useProyectosController } from '@/modules/proyectos'
import { PageHeader, Card, Button, Badge, SummaryCard } from '@/shared/components/ui'
import { formatMinutes, downloadFile } from '@/shared/lib/utils'
import type { IResponseProyecto, IResponseActividad } from '@/modules/proyectos'

// ─── Exportar a CSV ───────────────────────────────────────────────────────────

function proyectoToCsv(p: IResponseProyecto): string {
  const rows: string[][] = [
    ['Requerimiento',  p.requerimiento],
    ['Proyecto',       p.nombreProyecto],
    ['Objetivo',       p.objetivo ?? ''],
    ['Estimado por',   p.estimadoPor ?? ''],
    ['Supervisado por', p.supervisadoPor ?? ''],
    ['Fecha estimación', p.fechaEstimacion ? new Date(p.fechaEstimacion).toLocaleDateString('es-ES') : ''],
    ['HORAS ESTIMADAS (Base)', String(+(p.totalBaseMin / 60).toFixed(2))],
    [],
    ['#', 'Actividad', 'Proceso', 'Bloque', 'Jornadas', 'Id Elemento', 'Tecnología',
     'Nombre Elemento', 'Cantidad', 'Reutilizar', 'Base/min', 'Copilot/min', 'TME/min'],
    ...p.actividades.flatMap(a =>
      a.componentes.length === 0
        ? [[String(a.orden + 1), a.nombre, a.proceso ?? '', a.bloque ?? '', String(a.jornadas ?? ''), '', '', '', '', '', '', '', '']]
        : a.componentes.map(c => [
            String(a.orden + 1), a.nombre, a.proceso ?? '', a.bloque ?? '', String(a.jornadas ?? ''),
            String(c.componenteId), c.tecnologiaNombre, c.nombreComponente,
            String(c.cantidad), c.reutilizar ? 'Sí' : 'No',
            String(c.tiempoBaseMin), String(c.tiempoCopilotMin), String(c.tiempoTmeMin),
          ])
    ),
    [],
    ['', '', '', '', '', '', '', '', '', 'TOTAL BASE (min)', String(p.totalBaseMin)],
    ['', '', '', '', '', '', '', '', '', 'TOTAL COPILOT (min)', String(p.totalCopilotMin)],
    ['', '', '', '', '', '', '', '', '', 'TOTAL TME (min)', String(p.totalTmeMin)],
  ]
  return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n')
}

// ─── Panel de actividad ───────────────────────────────────────────────────────

function ActividadDetalle({ act }: { act: IResponseActividad }) {
  const totalBase = act.totalBaseMin
  const totalH    = +(totalBase / 60).toFixed(2)
  const totalJ    = +(totalH / 8).toFixed(2)

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-start justify-between gap-4"
        style={{ backgroundColor: 'var(--color-petroleum)' }}>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{act.orden + 1}. {act.nombre}</p>
          <div className="flex gap-3 mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {act.proceso  && <span>{act.proceso}</span>}
            {act.bloque   && <span>· {act.bloque}</span>}
            {act.jornadas && <span>· {act.jornadas} jornadas</span>}
            {act.fechaInicio && (
              <span>· {new Date(act.fechaInicio).toLocaleDateString('es-ES')}
                {act.fechaFin ? ` → ${new Date(act.fechaFin).toLocaleDateString('es-ES')}` : ''}
              </span>
            )}
          </div>
        </div>
        {totalBase > 0 && (
          <div className="shrink-0 text-right text-xs text-white">
            <p className="font-semibold">{formatMinutes(totalBase)}</p>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>{totalH}h · {totalJ}j</p>
          </div>
        )}
      </div>

      {act.componentes.length === 0 ? (
        <p className="px-4 py-3 text-xs" style={{ color: 'var(--color-text-soft)' }}>Sin componentes asociados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)' }}>
                {['Id', 'Componente', 'Tecnología', 'Cantidad', 'Reutilizar', 'Base', 'Copilot', 'TME'].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-soft)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {act.componentes.map(c => (
                <tr key={c.id} className="hover:bg-[rgba(0,66,84,0.03)]">
                  <td className="px-3 py-2 font-mono" style={{ color: 'var(--color-text-soft)' }}>{c.componenteId}</td>
                  <td className="px-3 py-2">
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>{c.nombreComponente}</p>
                    <Badge variant="neutral">{c.grupoNombre}</Badge>
                  </td>
                  <td className="px-3 py-2" style={{ color: 'var(--color-text-soft)' }}>{c.tecnologiaNombre}</td>
                  <td className="px-3 py-2 text-center font-medium" style={{ color: 'var(--color-text)' }}>{c.cantidad}</td>
                  <td className="px-3 py-2 text-center">{c.reutilizar ? '✓' : '—'}</td>
                  <td className="px-3 py-2 font-medium" style={{ color: 'var(--color-text)' }}>{formatMinutes(c.tiempoBaseMin)}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--color-accent-purple)' }}>{formatMinutes(c.tiempoCopilotMin)}</td>
                  <td className="px-3 py-2" style={{ color: 'var(--color-accent-orange)' }}>{formatMinutes(c.tiempoTmeMin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function ProyectoDetalleView({ id }: { id: number }) {
  const { proyecto, loading, error, _getById } = useProyectosController()

  useEffect(() => { _getById(id) }, [_getById, id])

  if (loading && !proyecto) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-6 h-6 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: '#C0392B' }}>{error ?? 'Proyecto no encontrado'}</p>
      </div>
    )
  }

  const horasBase = +(proyecto.totalBaseMin / 60).toFixed(2)

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title={proyecto.nombreProyecto}
        subtitle={proyecto.requerimiento}
        action={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => downloadFile(proyectoToCsv(proyecto), `${proyecto.requerimiento}_${proyecto.nombreProyecto.replace(/\s+/g, '_')}.csv`)}
            >
              ↓ Exportar CSV
            </Button>
            <Link href={`/proyectos/${id}/editar`}>
              <Button size="sm" variant="secondary">✎ Editar</Button>
            </Link>
            <Link href="/proyectos">
              <Button size="sm" variant="secondary">← Volver</Button>
            </Link>
          </div>
        }
      />

      {/* Datos generales */}
      <Card className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Objetivo',       value: proyecto.objetivo },
            { label: 'Estimado por',   value: proyecto.estimadoPor },
            { label: 'Supervisado por', value: proyecto.supervisadoPor },
            { label: 'Fecha estimación', value: proyecto.fechaEstimacion ? new Date(proyecto.fechaEstimacion).toLocaleDateString('es-ES') : null },
          ].filter(f => f.value).map(f => (
            <div key={f.label}>
              <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-soft)' }}>{f.label}</p>
              <p className="font-medium" style={{ color: 'var(--color-text)' }}>{f.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Horas estimadas" value={`${horasBase}h`} sublabel="Tiempo base total" />
        <SummaryCard label="Tiempo base"     value={formatMinutes(proyecto.totalBaseMin)}    sublabel="Sin IA" />
        <SummaryCard label="Con Copilot"     value={formatMinutes(proyecto.totalCopilotMin)} sublabel={`Ahorro ${formatMinutes(proyecto.totalBaseMin - proyecto.totalCopilotMin)}`} accent="purple" />
        <SummaryCard label="TME"             value={formatMinutes(proyecto.totalTmeMin)}     sublabel={`${proyecto.actividades.length} actividades`} accent="orange" />
      </div>

      {/* Actividades */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-soft)' }}>
          Construcción — {proyecto.actividades.length} actividades
        </p>
        {proyecto.actividades.map(act => (
          <ActividadDetalle key={act.id} act={act} />
        ))}
      </div>
    </div>
  )
}
