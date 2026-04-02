'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useProyectosController } from '@/modules/proyectos'
import { apiClient } from '@/shared/lib/axios'
import { PageHeader, Button, Card } from '@/shared/components/ui'
import { GanttChart } from './GanttChart'
import type { GanttFila } from './GanttChart'

type ActFecha = GanttFila

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
