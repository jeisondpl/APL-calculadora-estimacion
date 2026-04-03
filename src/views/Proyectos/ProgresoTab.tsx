'use client'

import { useMemo } from 'react'
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { IResponseProyecto } from '@/modules/proyectos'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{label}</span>
      <span className="text-xs font-semibold ml-auto" style={{ color: 'var(--color-text)' }}>{value}</span>
    </div>
  )
}

// ─── Tooltip personalizado ────────────────────────────────────────────────────

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-md"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
    >
      <p className="font-semibold">{payload[0].name}</p>
      <p>{payload[0].value}%</p>
    </div>
  )
}

// ─── Tabla de actividades ─────────────────────────────────────────────────────

function TablaActividades({ proyecto }: { proyecto: IResponseProyecto }) {
  const actividades = proyecto.actividades

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      <table className="w-full text-xs">
        <thead>
          <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)' }}>
            <th className="px-3 py-2.5 text-left font-medium w-8" style={{ color: 'var(--color-text-soft)' }}>#</th>
            <th className="px-3 py-2.5 text-left font-medium" style={{ color: 'var(--color-text-soft)' }}>Actividad</th>
            <th className="px-3 py-2.5 text-center font-medium w-20 hidden sm:table-cell" style={{ color: 'var(--color-text-soft)' }}>Jornadas</th>
            <th className="px-3 py-2.5 text-left font-medium w-28 hidden md:table-cell" style={{ color: 'var(--color-text-soft)' }}>Fecha inicio</th>
            <th className="px-3 py-2.5 text-left font-medium w-28 hidden md:table-cell" style={{ color: 'var(--color-text-soft)' }}>Fecha fin</th>
            <th className="px-3 py-2.5 text-center font-medium w-28" style={{ color: 'var(--color-text-soft)' }}>Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {actividades.map((act, idx) => {
            const tieneJornadas = act.jornadas != null && act.jornadas > 0
            const planificada   = !!(act.fechaInicio && act.fechaFin)
            const hoy           = new Date()
            hoy.setHours(0, 0, 0, 0)

            let estado: 'pendiente' | 'planificada' | 'en-curso' | 'completada' = 'pendiente'
            if (planificada) {
              const inicio = new Date(act.fechaInicio!)
              const fin    = new Date(act.fechaFin!)
              if (hoy > fin)         estado = 'completada'
              else if (hoy >= inicio) estado = 'en-curso'
              else                   estado = 'planificada'
            }

            const estadoConfig = {
              pendiente:   { label: 'Pendiente',   bg: 'rgba(156,163,175,0.15)', color: '#6B7280' },
              planificada: { label: 'Planificada', bg: 'rgba(59,130,246,0.12)', color: '#2563EB' },
              'en-curso':  { label: 'En curso',    bg: 'rgba(245,158,11,0.12)', color: '#D97706' },
              completada:  { label: 'Completada',  bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
            }[estado]

            return (
              <tr key={act.id} className="hover:bg-[rgba(0,66,84,0.03)] transition-colors">
                <td className="px-3 py-2.5" style={{ color: 'var(--color-text-soft)' }}>{idx + 1}</td>
                <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text)' }}>{act.nombre}</td>
                <td className="px-3 py-2.5 text-center hidden sm:table-cell">
                  {tieneJornadas ? (
                    <span className="font-semibold" style={{ color: 'var(--color-petroleum)' }}>{act.jornadas}</span>
                  ) : (
                    <span
                      className="px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#D97706' }}
                    >
                      ⚠
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell" style={{ color: 'var(--color-text-soft)' }}>
                  {act.fechaInicio ? new Date(act.fechaInicio).toLocaleDateString('es-ES') : '—'}
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell" style={{ color: 'var(--color-text-soft)' }}>
                  {act.fechaFin ? new Date(act.fechaFin).toLocaleDateString('es-ES') : '—'}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: estadoConfig.bg, color: estadoConfig.color }}
                  >
                    {estadoConfig.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function ProgresoTab({ proyecto }: { proyecto: IResponseProyecto }) {
  const actividades = proyecto.actividades
  const total       = actividades.length

  const stats = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    let pendientes  = 0
    let planificadas = 0
    let enCurso     = 0
    let completadas = 0

    for (const a of actividades) {
      if (!a.fechaInicio || !a.fechaFin) {
        pendientes++
        continue
      }
      const inicio = new Date(a.fechaInicio)
      const fin    = new Date(a.fechaFin)
      if      (hoy > fin)         completadas++
      else if (hoy >= inicio)     enCurso++
      else                        planificadas++
    }

    const pctCompletadas = total > 0 ? Math.round((completadas / total) * 100) : 0
    const pctEnCurso     = total > 0 ? Math.round((enCurso     / total) * 100) : 0
    const pctPlanificadas = total > 0 ? Math.round((planificadas / total) * 100) : 0

    return { pendientes, planificadas, enCurso, completadas, pctCompletadas, pctEnCurso, pctPlanificadas }
  }, [actividades, total])

  const avanceTotal = stats.pctCompletadas + Math.round(stats.pctEnCurso / 2)

  const chartData = [
    { name: 'Completadas', value: stats.pctCompletadas, fill: '#10B981' },
    { name: 'En curso',    value: stats.pctEnCurso,     fill: '#D97706' },
    { name: 'Planificadas', value: stats.pctPlanificadas, fill: '#2563EB' },
  ]

  return (
    <div className="space-y-6">
      {/* Gráfico + resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radial chart */}
        <div
          className="rounded-lg border p-6 flex flex-col items-center"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
            Avance del proyecto
          </p>
          <p className="text-xs mb-4" style={{ color: 'var(--color-text-soft)' }}>
            {total} actividades en total
          </p>

          <div className="relative w-52 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="100%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
                barSize={14}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(0,66,84,0.06)' }} />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>

            {/* Centro: porcentaje */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold" style={{ color: 'var(--color-petroleum)' }}>
                {avanceTotal}%
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>avance</p>
            </div>
          </div>

          {/* Leyenda */}
          <div className="w-full mt-4 space-y-2">
            <StatBadge label="Completadas"  value={stats.completadas}  color="#10B981" />
            <StatBadge label="En curso"     value={stats.enCurso}      color="#D97706" />
            <StatBadge label="Planificadas" value={stats.planificadas} color="#2563EB" />
            <StatBadge label="Pendientes"   value={stats.pendientes}   color="#9CA3AF" />
          </div>
        </div>

        {/* KPIs rápidos */}
        <div className="space-y-3">
          {[
            {
              label:    'Completadas',
              count:    stats.completadas,
              pct:      stats.pctCompletadas,
              color:    '#10B981',
              bgColor:  'rgba(16,185,129,0.08)',
            },
            {
              label:    'En curso',
              count:    stats.enCurso,
              pct:      stats.pctEnCurso,
              color:    '#D97706',
              bgColor:  'rgba(245,158,11,0.08)',
            },
            {
              label:    'Planificadas',
              count:    stats.planificadas,
              pct:      stats.pctPlanificadas,
              color:    '#2563EB',
              bgColor:  'rgba(59,130,246,0.08)',
            },
            {
              label:    'Pendientes',
              count:    stats.pendientes,
              pct:      total > 0 ? Math.round((stats.pendientes / total) * 100) : 0,
              color:    '#6B7280',
              bgColor:  'rgba(156,163,175,0.08)',
            },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-lg border px-4 py-3 flex items-center gap-4"
              style={{ borderColor: 'var(--color-border)', backgroundColor: item.bgColor }}
            >
              <div className="w-2 h-10 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{item.label}</p>
                <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.pct}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold" style={{ color: item.color }}>{item.count}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{item.pct}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla detalle */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-soft)' }}>
          Detalle por actividad
        </p>
        <TablaActividades proyecto={proyecto} />
      </div>
    </div>
  )
}
