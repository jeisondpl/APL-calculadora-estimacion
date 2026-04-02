'use client'

import { useMemo } from 'react'

export interface GanttFila {
  id:          number
  nombre:      string
  bloque:      string | null
  jornadas:    number | null
  fechaInicio: string   // 'YYYY-MM-DD' o ''
  fechaFin:    string   // 'YYYY-MM-DD' o ''
}

function bloqueColor(bloque: string | null): string {
  if (!bloque) return 'var(--color-petroleum)'
  if (bloque.toLowerCase().includes('front'))   return '#2563EB'
  if (bloque.toLowerCase().includes('magento')) return '#D97706'
  return 'var(--color-petroleum)'
}

export function GanttChart({ filas }: { filas: GanttFila[] }) {
  const tareas = filas.filter(f => f.fechaInicio && f.fechaFin && f.fechaFin >= f.fechaInicio)

  const { minDate, totalDays, months } = useMemo(() => {
    if (tareas.length === 0) return { minDate: null, totalDays: 0, months: [] }

    const starts = tareas.map(f => new Date(f.fechaInicio).getTime())
    const ends   = tareas.map(f => new Date(f.fechaFin).getTime())
    const min    = new Date(Math.min(...starts))
    const max    = new Date(Math.max(...ends))

    min.setDate(min.getDate() - 1)
    max.setDate(max.getDate() + 1)

    const total = Math.ceil((max.getTime() - min.getTime()) / 86_400_000) + 1

    const meses: { label: string; left: number; width: number }[] = []
    const cur = new Date(min.getFullYear(), min.getMonth(), 1)
    while (cur <= max) {
      const mesStart = Math.max(0, Math.ceil((cur.getTime() - min.getTime()) / 86_400_000))
      const nextMes  = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
      const mesEnd   = Math.min(total, Math.ceil((nextMes.getTime() - min.getTime()) / 86_400_000))
      meses.push({
        label: cur.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        left:  (mesStart / total) * 100,
        width: ((mesEnd - mesStart) / total) * 100,
      })
      cur.setMonth(cur.getMonth() + 1)
    }

    return { minDate: min, totalDays: total, months: meses }
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

  const dayPct = (dateStr: string) =>
    ((new Date(dateStr).getTime() - minDate!.getTime()) / 86_400_000 / totalDays) * 100

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
        {/* Etiquetas izquierda */}
        <div className="shrink-0 w-52 border-r" style={{ borderColor: 'var(--color-border)' }}>
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

        {/* Área de barras */}
        <div className="flex-1 overflow-x-auto">
          {/* Cabecera meses */}
          <div
            className="relative h-7 border-b"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,66,84,0.04)', minWidth: 600 }}
          >
            {months.map(m => (
              <div
                key={m.label}
                className="absolute top-0 bottom-0 flex items-center justify-center text-xs border-r"
                style={{
                  left: `${m.left}%`, width: `${m.width}%`,
                  borderColor: 'var(--color-border)', color: 'var(--color-text-soft)',
                  fontWeight: 500, overflow: 'hidden',
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Filas */}
          <div style={{ minWidth: 600 }}>
            {filas.map((f, idx) => (
              <div
                key={f.id}
                className="relative border-b"
                style={{
                  height: ROW_H, borderColor: 'var(--color-border)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,66,84,0.02)',
                }}
              >
                {months.map(m => (
                  <div
                    key={m.label}
                    className="absolute top-0 bottom-0 border-r"
                    style={{ left: `${m.left}%`, borderColor: 'rgba(0,66,84,0.08)' }}
                  />
                ))}
                {f.fechaInicio && f.fechaFin && f.fechaFin >= f.fechaInicio && (
                  <div
                    className="absolute top-1/2 rounded-md flex items-center px-2 overflow-hidden"
                    style={{
                      left:            `${dayPct(f.fechaInicio)}%`,
                      width:           `${widthPct(f.fechaInicio, f.fechaFin)}%`,
                      height:          22,
                      transform:       'translateY(-50%)',
                      backgroundColor: bloqueColor(f.bloque),
                      opacity:         0.88,
                      minWidth:        4,
                      transition:      'left 0.2s ease, width 0.2s ease',
                    }}
                    title={`${f.nombre}: ${f.fechaInicio} → ${f.fechaFin}${f.jornadas != null ? ` · ${f.jornadas}j` : ''}`}
                  >
                    <span className="text-white truncate font-medium" style={{ fontSize: 10 }}>
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
