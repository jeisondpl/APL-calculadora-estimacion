'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProyectosController } from '@/modules/proyectos'
import { apiClient } from '@/shared/lib/axios'
import { PageHeader, Button, Card } from '@/shared/components/ui'

interface ActFecha {
  id:          number
  nombre:      string
  bloque:      string | null
  jornadas:    number | null
  fechaInicio: string
  fechaFin:    string
}

// ─── Colores por bloque ───────────────────────────────────────────────────────

function bloqueColor(bloque: string | null): string {
  if (!bloque) return 'var(--color-petroleum)'
  if (bloque.toLowerCase().includes('front'))   return '#2563EB'   // azul
  if (bloque.toLowerCase().includes('magento')) return '#D97706'   // naranja
  return 'var(--color-petroleum)'                                   // back → teal
}

// ─── Gantt ────────────────────────────────────────────────────────────────────

function GanttChart({ filas }: { filas: ActFecha[] }) {
  const tareas = filas.filter(f => f.fechaInicio && f.fechaFin && f.fechaFin >= f.fechaInicio)

  const { minDate, maxDate, totalDays, months } = useMemo(() => {
    if (tareas.length === 0) return { minDate: null, maxDate: null, totalDays: 0, months: [] }

    const starts = tareas.map(f => new Date(f.fechaInicio).getTime())
    const ends   = tareas.map(f => new Date(f.fechaFin).getTime())
    const min = new Date(Math.min(...starts))
    const max = new Date(Math.max(...ends))

    // Extender un poco los extremos para respirar
    min.setDate(min.getDate() - 1)
    max.setDate(max.getDate() + 1)

    const total = Math.ceil((max.getTime() - min.getTime()) / 86_400_000) + 1

    // Construir marcas de meses
    const meses: { label: string; left: number; width: number }[] = []
    const cur = new Date(min.getFullYear(), min.getMonth(), 1)
    while (cur <= max) {
      const mesStart  = Math.max(0, Math.ceil((cur.getTime() - min.getTime()) / 86_400_000))
      const nextMes   = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
      const mesEnd    = Math.min(total, Math.ceil((nextMes.getTime() - min.getTime()) / 86_400_000))
      meses.push({
        label: cur.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        left:  (mesStart / total) * 100,
        width: ((mesEnd - mesStart) / total) * 100,
      })
      cur.setMonth(cur.getMonth() + 1)
    }

    return { minDate: min, maxDate: max, totalDays: total, months: meses }
  }, [tareas])

  if (tareas.length === 0) {
    return (
      <div
        className="rounded-lg border px-4 py-8 text-center text-xs"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-soft)' }}
      >
        Asigna fechas de inicio y fin a las actividades para ver el diagrama de Gantt
      </div>
    )
  }

  const dayPct = (dateStr: string) => {
    const d = new Date(dateStr).getTime()
    return ((d - minDate!.getTime()) / 86_400_000 / totalDays) * 100
  }
  const widthPct = (start: string, end: string) => {
    const s = new Date(start).getTime()
    const e = new Date(end).getTime()
    return Math.max(0.5, ((e - s) / 86_400_000 + 1) / totalDays * 100)
  }

  const ROW_H = 36

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="px-4 py-2.5" style={{ backgroundColor: 'var(--color-petroleum)' }}>
        <p className="text-xs font-semibold text-white">Diagrama de Gantt</p>
      </div>

      <div className="flex">
        {/* Etiquetas de actividades (columna izquierda) */}
        <div className="shrink-0 w-48 border-r" style={{ borderColor: 'var(--color-border)' }}>
          {/* Cabecera meses (vacía) */}
          <div
            className="h-7 border-b flex items-center px-3"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,66,84,0.04)' }}
          >
            <span className="text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>Actividad</span>
          </div>
          {filas.map((f, idx) => (
            <div
              key={f.id}
              className="flex items-center px-3 border-b"
              style={{
                height: ROW_H,
                borderColor: 'var(--color-border)',
                backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,66,84,0.02)',
              }}
            >
              <span
                className="text-xs truncate"
                title={f.nombre}
                style={{ color: 'var(--color-text)' }}
              >
                {idx + 1}. {f.nombre}
              </span>
            </div>
          ))}
        </div>

        {/* Área de barras (columna derecha, scrollable) */}
        <div className="flex-1 overflow-x-auto">
          {/* Cabecera de meses */}
          <div
            className="relative h-7 border-b"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,66,84,0.04)', minWidth: 600 }}
          >
            {months.map(m => (
              <div
                key={m.label}
                className="absolute top-0 bottom-0 flex items-center justify-center text-xs border-r"
                style={{
                  left: `${m.left}%`,
                  width: `${m.width}%`,
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-soft)',
                  fontWeight: 500,
                  overflow: 'hidden',
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Filas de barras */}
          <div style={{ minWidth: 600 }}>
            {filas.map((f, idx) => (
              <div
                key={f.id}
                className="relative border-b"
                style={{
                  height: ROW_H,
                  borderColor: 'var(--color-border)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,66,84,0.02)',
                }}
              >
                {/* Líneas verticales de guía (por mes) */}
                {months.map(m => (
                  <div
                    key={m.label}
                    className="absolute top-0 bottom-0 border-r"
                    style={{ left: `${m.left}%`, borderColor: 'rgba(0,66,84,0.08)' }}
                  />
                ))}

                {/* Barra */}
                {f.fechaInicio && f.fechaFin && f.fechaFin >= f.fechaInicio && (
                  <div
                    className="absolute top-1/2 rounded-md flex items-center px-2 overflow-hidden"
                    style={{
                      left:            `${dayPct(f.fechaInicio)}%`,
                      width:           `${widthPct(f.fechaInicio, f.fechaFin)}%`,
                      height:          22,
                      transform:       'translateY(-50%)',
                      backgroundColor: bloqueColor(f.bloque),
                      opacity:         0.9,
                      minWidth:        4,
                      transition:      'left 0.2s ease, width 0.2s ease',
                    }}
                    title={`${f.nombre}: ${f.fechaInicio} → ${f.fechaFin}${f.jornadas != null ? ` (${f.jornadas}j)` : ''}`}
                  >
                    <span className="text-white text-xs truncate font-medium" style={{ fontSize: 10 }}>
                      {f.jornadas != null ? `${f.jornadas}j` : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div
        className="px-4 py-2 flex gap-4 flex-wrap border-t"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,66,84,0.02)' }}
      >
        {[
          { label: 'Front Bloque I',    color: '#2563EB' },
          { label: 'Back Bloque III',   color: 'var(--color-petroleum)' },
          { label: 'Magento Bloque II', color: '#D97706' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: l.color }} />
            <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function PlanificarView({ id }: { id: number }) {
  const { proyecto, loading, error, _getById } = useProyectosController()
  const router = useRouter()

  const [filas, setFilas]     = useState<ActFecha[]>([])
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  useEffect(() => { _getById(id) }, [_getById, id])

  useEffect(() => {
    if (!proyecto) return
    setFilas(
      proyecto.actividades.map(a => ({
        id:          a.id,
        nombre:      a.nombre,
        bloque:      a.bloque,
        jornadas:    a.jornadas,
        fechaInicio: a.fechaInicio ? a.fechaInicio.slice(0, 10) : '',
        fechaFin:    a.fechaFin    ? a.fechaFin.slice(0, 10)    : '',
      }))
    )
  }, [proyecto])

  const set = (idx: number, field: 'fechaInicio' | 'fechaFin', value: string) =>
    setFilas(f => f.map((r, i) => i === idx ? { ...r, [field]: value } : r))

  const handleSave = async () => {
    setSaving(true)
    setSaveErr(null)
    try {
      await apiClient.patch(`/proyectos/${id}/planificar`, {
        actividades: filas.map(f => ({
          id:          f.id,
          fechaInicio: f.fechaInicio || null,
          fechaFin:    f.fechaFin    || null,
        })),
      })
      setSaved(true)
      setTimeout(() => router.push(`/proyectos/${id}`), 800)
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading && !proyecto) {
    return (
      <div className="flex justify-center py-20">
        <span className="w-6 h-6 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !proyecto) {
    return <p className="p-6 text-sm" style={{ color: '#C0392B' }}>{error ?? 'Proyecto no encontrado'}</p>
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <PageHeader
        title="Planificación"
        subtitle={`${proyecto.requerimiento} — ${proyecto.nombreProyecto}`}
        action={
          <Link href={`/proyectos/${id}`}>
            <Button size="sm" variant="secondary">← Volver</Button>
          </Link>
        }
      />

      {/* Tabla de fechas */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}>
                <th className="px-3 py-2.5 text-left font-medium w-8">#</th>
                <th className="px-3 py-2.5 text-left font-medium">Actividad</th>
                <th className="px-3 py-2.5 text-left font-medium w-36 hidden md:table-cell">Bloque</th>
                <th className="px-3 py-2.5 text-center font-medium w-20 hidden sm:table-cell">Jornadas</th>
                <th className="px-3 py-2.5 text-left font-medium w-40">Fecha inicio</th>
                <th className="px-3 py-2.5 text-left font-medium w-40">Fecha fin</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {filas.map((fila, idx) => (
                <tr key={fila.id} className="hover:bg-[rgba(0,66,84,0.03)] transition-colors">
                  <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--color-text-soft)' }}>{idx + 1}</td>
                  <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text)' }}>{fila.nombre}</td>
                  <td className="px-3 py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>
                    {fila.bloque || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--color-text)' }}>
                    {fila.jornadas ?? '—'}
                  </td>
                  <td className="px-3 py-2 pr-2">
                    <input
                      type="date"
                      value={fila.fechaInicio}
                      onChange={e => set(idx, 'fechaInicio', e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border outline-none"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                    />
                  </td>
                  <td className="px-3 py-2 pr-3">
                    <input
                      type="date"
                      value={fila.fechaFin}
                      onChange={e => set(idx, 'fechaFin', e.target.value)}
                      min={fila.fechaInicio || undefined}
                      className="w-full px-2 py-1 text-xs rounded border outline-none"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {saveErr && <p className="text-xs" style={{ color: '#C0392B' }}>{saveErr}</p>}
          {saved   && <p className="text-xs" style={{ color: 'var(--color-success)' }}>✓ Guardado correctamente</p>}
          {!saveErr && !saved && <span />}
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Guardar planificación
          </Button>
        </div>
      </Card>

      {/* Gantt en tiempo real */}
      <GanttChart filas={filas} />
    </div>
  )
}
