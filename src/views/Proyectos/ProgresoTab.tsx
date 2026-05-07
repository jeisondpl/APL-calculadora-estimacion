'use client'

import React, { useMemo } from 'react'
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { IResponseProyecto } from '@/modules/proyectos'
import { ChatBox } from './ChatBox'

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

// ─── Tooltip desarrolladores ─────────────────────────────────────────────────

type DevTooltipPayload = { name: string; value: number; fill: string }

function DevTooltip({ active, payload, label }: { active?: boolean; payload?: DevTooltipPayload[]; label?: string }) {
  if (!active || !payload?.length) return null
  const avance = Math.round(
    (payload.find(p => p.name === 'Completadas')?.value ?? 0) +
    (payload.find(p => p.name === 'En curso')?.value ?? 0) / 2
  )
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-md min-w-[140px]"
      style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
    >
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map(p => p.value > 0 && (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
          <span style={{ color: 'var(--color-text-soft)' }}>{p.name}:</span>
          <span className="font-medium ml-auto">{p.value}%</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <span style={{ color: 'var(--color-text-soft)' }}>Avance:</span>
        <span className="font-bold ml-1" style={{ color: 'var(--color-petroleum)' }}>{avance}%</span>
      </div>
    </div>
  )
}

// ─── Gráfica por desarrollador ────────────────────────────────────────────────

type DevStat = {
  nombre: string
  completadas: number
  enCurso: number
  planificadas: number
  pendientes: number
  avance: number
  total: number
}

function GraficaDesarrolladores({ data }: { data: DevStat[] }) {
  if (data.length === 0) return null

  const chartHeight = Math.max(140, data.length * 54)

  return (
    <div
      className="rounded-lg border p-5"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text)' }}>
        Avance por desarrollador
      </p>
      <p className="text-xs mb-4" style={{ color: 'var(--color-text-soft)' }}>
        Distribución de actividades por estado y persona asignada
      </p>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 10, fill: 'var(--color-text-soft)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nombre"
            width={112}
            tick={{ fontSize: 11, fill: 'var(--color-text)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<DevTooltip />} cursor={{ fill: 'rgba(0,66,84,0.04)' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 12, color: 'var(--color-text-soft)' }}
          />
          <Bar dataKey="completadas" name="Completadas" stackId="s" fill="#10B981" isAnimationActive />
          <Bar dataKey="enCurso"     name="En curso"    stackId="s" fill="#D97706" isAnimationActive />
          <Bar dataKey="planificadas" name="Planificadas" stackId="s" fill="#2563EB" isAnimationActive />
          <Bar dataKey="pendientes"  name="Pendientes"  stackId="s" fill="#D1D5DB" isAnimationActive radius={[0, 3, 3, 0]}>
            <LabelList
              dataKey="avance"
              position="right"
              formatter={(v) => (typeof v === 'number' && v > 0) ? `${v}%` : ''}
              style={{ fontSize: 10, fill: 'var(--color-text-soft)', fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Donut individual por desarrollador ──────────────────────────────────────

const STATUS_CONFIG = [
  { key: 'completadas',  label: 'Completadas',  color: '#10B981' },
  { key: 'enCurso',      label: 'En curso',     color: '#D97706' },
  { key: 'planificadas', label: 'Planificadas', color: '#2563EB' },
  { key: 'pendientes',   label: 'Pendientes',   color: '#D1D5DB' },
] as const

function GraficaCircularDev({ dev }: { dev: DevStat }) {
  const pieData = STATUS_CONFIG
    .map(s => ({ name: s.label, value: dev[s.key], fill: s.color }))
    .filter(d => d.value > 0)

  const hasData = pieData.length > 0

  return (
    <div
      className="rounded-lg border p-4 flex flex-col items-center"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      {/* Nombre */}
      <p
        className="text-xs font-semibold text-center leading-tight mb-0.5 line-clamp-2 w-full"
        style={{ color: 'var(--color-text)' }}
        title={dev.nombre}
      >
        {dev.nombre}
      </p>
      <p className="text-[10px] mb-3" style={{ color: 'var(--color-text-soft)' }}>
        {dev.total} {dev.total === 1 ? 'actividad' : 'actividades'}
      </p>

      {/* Donut */}
      <div className="relative w-28 h-28">
        {hasData && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius="54%"
                outerRadius="82%"
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
                isAnimationActive
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xl font-bold leading-none" style={{ color: 'var(--color-petroleum)' }}>
            {dev.avance}%
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-soft)' }}>avance</p>
        </div>
      </div>

      {/* Leyenda */}
      <div className="w-full mt-3 space-y-1.5">
        {STATUS_CONFIG.filter(s => dev[s.key] > 0).map(s => (
          <div key={s.key} className="flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
            <span style={{ color: 'var(--color-text-soft)' }}>{s.label}:</span>
            <span className="font-semibold ml-auto" style={{ color: 'var(--color-text)' }}>{dev[s.key]}%</span>
          </div>
        ))}
        <div
          className="pt-1.5 mt-0.5 border-t flex items-center text-[11px]"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span style={{ color: 'var(--color-text-soft)' }}>Avance:</span>
          <span className="font-bold ml-auto" style={{ color: 'var(--color-petroleum)' }}>{dev.avance}%</span>
        </div>
      </div>
    </div>
  )
}

function GraficasCircularesDesarrolladores({ data }: { data: DevStat[] }) {
  if (data.length === 0) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map(dev => (
        <GraficaCircularDev key={dev.nombre} dev={dev} />
      ))}
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
            <th className="px-3 py-2.5 text-left font-medium hidden lg:table-cell" style={{ color: 'var(--color-text-soft)' }}>Asignado a</th>
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
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  {act.asignadoANombre ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'rgba(0,66,84,0.08)', color: 'var(--color-petroleum)' }}
                    >
                      <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                      </svg>
                      {act.asignadoANombre}
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>—</span>
                  )}
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

  const devStats = useMemo<DevStat[]>(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const map = new Map<string, { completadas: number; enCurso: number; planificadas: number; pendientes: number }>()

    for (const a of actividades) {
      const dev = a.asignadoANombre ?? 'Sin asignar'
      if (!map.has(dev)) map.set(dev, { completadas: 0, enCurso: 0, planificadas: 0, pendientes: 0 })
      const entry = map.get(dev)!

      if (!a.fechaInicio || !a.fechaFin) {
        entry.pendientes++
        continue
      }
      const inicio = new Date(a.fechaInicio)
      const fin    = new Date(a.fechaFin)
      if      (hoy > fin)         entry.completadas++
      else if (hoy >= inicio)     entry.enCurso++
      else                        entry.planificadas++
    }

    return Array.from(map.entries()).map(([nombre, v]) => {
      const tot = v.completadas + v.enCurso + v.planificadas + v.pendientes
      const pct = (n: number) => tot > 0 ? Math.round((n / tot) * 100) : 0
      return {
        nombre,
        completadas:  pct(v.completadas),
        enCurso:      pct(v.enCurso),
        planificadas: pct(v.planificadas),
        pendientes:   pct(v.pendientes),
        avance:       pct(v.completadas) + Math.round(pct(v.enCurso) / 2),
        total: tot,
      }
    }).sort((a, b) => b.avance - a.avance)
  }, [actividades])

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

      {/* Gráfica barras por desarrollador */}
      {devStats.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-soft)' }}>
            Avance por desarrollador
          </p>
          <GraficaDesarrolladores data={devStats} />
        </div>
      )}

      {/* Donuts por desarrollador */}
      {devStats.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-soft)' }}>
            Detalle por desarrollador
          </p>
          <GraficasCircularesDesarrolladores data={devStats} />
        </div>
      )}

      {/* Tabla detalle */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-soft)' }}>
          Detalle por actividad
        </p>
        <TablaActividades proyecto={proyecto} />
      </div>

      {/* Chatbox asistente operacional */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-soft)' }}>
          Asistente de control operacional
        </p>
        <ChatBox proyectoId={proyecto.id} />
      </div>
    </div>
  )
}
