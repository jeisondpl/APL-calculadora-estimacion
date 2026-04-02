'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useProyectosController } from '@/modules/proyectos'
import { PageHeader, Card, Button, Badge, SummaryCard } from '@/shared/components/ui'
import { formatMinutes, downloadFile } from '@/shared/lib/utils'
import { GanttChart } from './GanttChart'
import type { IResponseProyecto, IResponseActividad } from '@/modules/proyectos'

// ─── Exportar a CSV ───────────────────────────────────────────────────────────

function proyectoToCsv(p: IResponseProyecto): string {
  const rows: string[][] = [
    ['Requerimiento', p.requerimiento],
    ['Proyecto', p.nombreProyecto],
    ['Objetivo', p.objetivo ?? ''],
    ['Estimado por', p.estimadoPor ?? ''],
    ['Supervisado por', p.supervisadoPor ?? ''],
    ['Fecha estimación', p.fechaEstimacion ? new Date(p.fechaEstimacion).toLocaleDateString('es-ES') : ''],
    ['HORAS ESTIMADAS (Base)', String(+(p.totalBaseMin / 60).toFixed(2))],
    [],
    ['#', 'Actividad', 'Proceso', 'Bloque', 'Jornadas', 'Id Elemento', 'Tecnología', 'Nombre Elemento', 'Cantidad', 'Reutilizar', 'Base/min', 'Copilot/min', 'TIGO/min'],
    ...p.actividades.flatMap((a) =>
      a.componentes.length === 0
        ? [[String(a.orden + 1), a.nombre, a.proceso ?? '', a.bloque ?? '', String(a.jornadas ?? ''), '', '', '', '', '', '', '', '']]
        : a.componentes.map((c) => [
            String(a.orden + 1),
            a.nombre,
            a.proceso ?? '',
            a.bloque ?? '',
            String(a.jornadas ?? ''),
            String(c.componenteId),
            c.tecnologiaNombre,
            c.nombreComponente,
            String(c.cantidad),
            c.reutilizar ? 'Sí' : 'No',
            String(c.tiempoBaseMin),
            String(c.tiempoCopilotMin),
            String(c.tiempoTmeMin),
          ]),
    ),
    [],
    ['', '', '', '', '', '', '', '', '', 'TOTAL BASE (min)', String(p.totalBaseMin)],
    ['', '', '', '', '', '', '', '', '', 'TOTAL COPILOT (min)', String(p.totalCopilotMin)],
    ['', '', '', '', '', '', '', '', '', 'TOTAL TIGO (min)', String(p.totalTmeMin)],
  ]
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n')
}

// ─── Panel de actividad ───────────────────────────────────────────────────────

function ActividadDetalle({ act }: { act: IResponseActividad }) {
  const totalBase = act.totalBaseMin
  const totalH = +(totalBase / 60).toFixed(2)
  const totalJ = +(totalH / 8).toFixed(2)

  return (
    <div className='rounded-lg border overflow-hidden' style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className='px-4 py-3 flex items-center gap-4 flex-wrap' style={{ backgroundColor: 'var(--color-petroleum)' }}>
        {/* Número + nombre */}
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold text-white'>
            {act.orden + 1}. {act.nombre}
          </p>
          {act.bloque && (
            <p className='text-xs mt-0.5' style={{ color: 'rgba(255,255,255,0.7)' }}>
              {act.bloque}
            </p>
          )}
        </div>
        {/* Jornadas */}
        <div className='shrink-0 text-center'>
          <p className='text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>
            Jornadas
          </p>
          <p className='text-sm font-semibold text-white'>{act.jornadas ?? '—'}</p>
        </div>
        {/* Fecha inicio */}
        <div className='shrink-0 text-center hidden sm:block'>
          <p className='text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>
            Fecha inicio
          </p>
          <p className='text-sm text-white'>{act.fechaInicio ? new Date(act.fechaInicio).toLocaleDateString('es-ES') : '—'}</p>
        </div>
        {/* Fecha fin */}
        <div className='shrink-0 text-center hidden sm:block'>
          <p className='text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>
            Fecha fin
          </p>
          <p className='text-sm text-white'>{act.fechaFin ? new Date(act.fechaFin).toLocaleDateString('es-ES') : '—'}</p>
        </div>
        {/* Tiempo base */}
        {totalBase > 0 && (
          <div className='shrink-0 text-right'>
            <p className='text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>
              Base
            </p>
            <p className='text-sm font-semibold text-white'>{formatMinutes(totalBase)}</p>
            <p className='text-xs' style={{ color: 'rgba(255,255,255,0.6)' }}>
              {totalH}h · {totalJ}j
            </p>
          </div>
        )}
      </div>

      {act.componentes.length === 0 ? (
        <p className='px-4 py-3 text-xs' style={{ color: 'var(--color-text-soft)' }}>
          Sin componentes asociados.
        </p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-xs'>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)' }}>
                {['Id', 'Componente', 'Tecnología', 'Cantidad', 'Reutilizar', 'Base', 'Copilot', 'TIGO'].map((h) => (
                  <th key={h} className='px-3 py-2 text-left font-medium' style={{ color: 'var(--color-text-soft)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y' style={{ borderColor: 'var(--color-border)' }}>
              {act.componentes.map((c) => (
                <tr key={c.id} className='hover:bg-[rgba(0,66,84,0.03)]'>
                  <td className='px-3 py-2 font-mono' style={{ color: 'var(--color-text-soft)' }}>
                    {c.componenteId}
                  </td>
                  <td className='px-3 py-2'>
                    <p className='font-medium' style={{ color: 'var(--color-text)' }}>
                      {c.nombreComponente}
                    </p>
                    <Badge variant='neutral'>{c.grupoNombre}</Badge>
                  </td>
                  <td className='px-3 py-2' style={{ color: 'var(--color-text-soft)' }}>
                    {c.tecnologiaNombre}
                  </td>
                  <td className='px-3 py-2 text-center font-medium' style={{ color: 'var(--color-text)' }}>
                    {c.cantidad}
                  </td>
                  <td className='px-3 py-2 text-center'>{c.reutilizar ? '✓' : '—'}</td>
                  <td className='px-3 py-2 font-medium' style={{ color: 'var(--color-text)' }}>
                    {formatMinutes(c.tiempoBaseMin)}
                  </td>
                  <td className='px-3 py-2' style={{ color: 'var(--color-accent-purple)' }}>
                    {formatMinutes(c.tiempoCopilotMin)}
                  </td>
                  <td className='px-3 py-2' style={{ color: 'var(--color-accent-orange)' }}>
                    {formatMinutes(c.tiempoTmeMin)}
                  </td>
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

  useEffect(() => {
    _getById(id)
  }, [_getById, id])

  if (loading && !proyecto) {
    return (
      <div className='flex justify-center py-20'>
        <span className='w-6 h-6 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin' />
      </div>
    )
  }

  if (error || !proyecto) {
    return (
      <div className='p-6'>
        <p className='text-sm' style={{ color: '#C0392B' }}>
          {error ?? 'Proyecto no encontrado'}
        </p>
      </div>
    )
  }

  const horasBase = +(proyecto.totalBaseMin / 60).toFixed(2)

  return (
    <div className='p-6 lg:p-8'>
      <PageHeader
        title={proyecto.nombreProyecto}
        subtitle={proyecto.requerimiento}
        action={
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => downloadFile(proyectoToCsv(proyecto), `${proyecto.requerimiento}_${proyecto.nombreProyecto.replace(/\s+/g, '_')}.csv`)}
            >
              ↓ Exportar CSV
            </Button>
            <Link href={`/proyectos/${id}/planificar`}>
              <Button size='sm' variant='secondary'>
                📅 Planificar
              </Button>
            </Link>
            <Link href={`/proyectos/${id}/editar`}>
              <Button size='sm' variant='secondary'>
                ✎ Editar
              </Button>
            </Link>
            <Link href='/proyectos'>
              <Button size='sm' variant='secondary'>
                ← Volver
              </Button>
            </Link>
          </div>
        }
      />

      {/* Datos generales */}
      <Card className='mb-6'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          {[
            { label: 'Objetivo', value: proyecto.objetivo },
            { label: 'Estimado por', value: proyecto.estimadoPor },
            { label: 'Supervisado por', value: proyecto.supervisadoPor },
            { label: 'Fecha estimación', value: proyecto.fechaEstimacion ? new Date(proyecto.fechaEstimacion).toLocaleDateString('es-ES') : null },
          ]
            .filter((f) => f.value)
            .map((f) => (
              <div key={f.label}>
                <p className='text-xs mb-0.5' style={{ color: 'var(--color-text-soft)' }}>
                  {f.label}
                </p>
                <p className='font-medium' style={{ color: 'var(--color-text)' }}>
                  {f.value}
                </p>
              </div>
            ))}
        </div>
      </Card>

      {/* KPIs */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        <SummaryCard label='Horas estimadas' value={`${horasBase}h`} sublabel='Tiempo base total' />
        <SummaryCard label='Tiempo base' value={formatMinutes(proyecto.totalBaseMin)} sublabel='Sin IA' />
        <SummaryCard
          label='Con Copilot'
          value={formatMinutes(proyecto.totalCopilotMin)}
          sublabel={`Ahorro ${formatMinutes(proyecto.totalBaseMin - proyecto.totalCopilotMin)}`}
          accent='purple'
        />
        <SummaryCard label='TIGO' value={formatMinutes(proyecto.totalTmeMin)} sublabel={`${proyecto.actividades.length} actividades`} accent='orange' />
      </div>

      {/* Actividades base (sin componentes) */}
      {(() => {
        const base = proyecto.actividades.filter((a) => a.componentes.length === 0)
        if (base.length === 0) return null
        return (
          <div className='mb-6'>
            <p className='text-xs font-semibold uppercase tracking-wider mb-2' style={{ color: 'var(--color-text-soft)' }}>
              Actividades base — {base.length} ítems
            </p>
            <div className='rounded-lg border overflow-hidden' style={{ borderColor: 'var(--color-border)' }}>
              <table className='w-full text-sm'>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}>
                    <th className='px-3 py-2.5 text-left font-medium w-8'>#</th>
                    <th className='px-3 py-2.5 text-left font-medium'>Actividad</th>
                    <th className='px-3 py-2.5 text-left font-medium w-36 hidden md:table-cell'>Bloque</th>
                    <th className='px-3 py-2.5 text-center font-medium w-20'>Jornadas</th>
                    <th className='px-3 py-2.5 text-left font-medium w-28 hidden sm:table-cell'>Fecha inicio</th>
                    <th className='px-3 py-2.5 text-left font-medium w-28 hidden sm:table-cell'>Fecha fin</th>
                  </tr>
                </thead>
                <tbody className='divide-y' style={{ borderColor: 'var(--color-border)' }}>
                  {base.map((act, idx) => (
                    <tr key={act.id} className='hover:bg-[rgba(0,66,84,0.03)] transition-colors'>
                      <td className='px-3 py-2.5 text-xs' style={{ color: 'var(--color-text-soft)' }}>
                        {idx + 1}
                      </td>
                      <td className='px-3 py-2.5 font-medium' style={{ color: 'var(--color-text)' }}>
                        {act.nombre}
                      </td>
                      <td className='px-3 py-2.5 hidden md:table-cell text-xs' style={{ color: 'var(--color-text-soft)' }}>
                        {act.bloque || '—'}
                      </td>
                      <td className='px-3 py-2.5 text-center text-sm font-semibold' style={{ color: 'var(--color-petroleum)' }}>
                        {act.jornadas ?? '—'}
                      </td>
                      <td className='px-3 py-2.5 hidden sm:table-cell text-xs' style={{ color: 'var(--color-text-soft)' }}>
                        {act.fechaInicio ? new Date(act.fechaInicio).toLocaleDateString('es-ES') : '—'}
                      </td>
                      <td className='px-3 py-2.5 hidden sm:table-cell text-xs' style={{ color: 'var(--color-text-soft)' }}>
                        {act.fechaFin ? new Date(act.fechaFin).toLocaleDateString('es-ES') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* Actividades con componentes */}
      {(() => {
        const conComp = proyecto.actividades.filter((a) => a.componentes.length > 0)
        if (conComp.length === 0) return null
        return (
          <div className='space-y-4'>
            <p className='text-xs font-semibold uppercase tracking-wider' style={{ color: 'var(--color-text-soft)' }}>
              Construcción — {conComp.length} actividades
            </p>
            {conComp.map((act) => (
              <ActividadDetalle key={act.id} act={act} />
            ))}
          </div>
        )
      })()}

      <div className='space-y-4 my-6'>
        <p className='text-xs font-semibold uppercase tracking-wider' style={{ color: 'var(--color-text-soft)' }}>
          Diagrama de Gantt
        </p>
      </div>
      {/* Gantt */}
      <GanttChart
        filas={proyecto.actividades.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          bloque: a.bloque,
          jornadas: a.jornadas,
          fechaInicio: a.fechaInicio ? a.fechaInicio.slice(0, 10) : '',
          fechaFin: a.fechaFin ? a.fechaFin.slice(0, 10) : '',
        }))}
      />
    </div>
  )
}
