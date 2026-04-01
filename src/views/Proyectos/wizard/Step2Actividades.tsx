'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Card } from '@/shared/components/ui'
import { useWizardStore } from '@/modules/proyectos'
import type { IActividad } from '@/modules/proyectos'

const actSchema = z.object({
  nombre:      z.string().min(1, 'Requerido'),
  proceso:     z.string().optional().default(''),
  bloque:      z.string().optional().default(''),
  jornadas:    z.coerce.number().min(0).optional(),
  fechaInicio: z.string().optional().default(''),
  fechaFin:    z.string().optional().default(''),
})
type ActFormData = z.infer<typeof actSchema>

function ActividadForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: IActividad
  onSave: (d: ActFormData) => void
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ActFormData>({
    resolver: zodResolver(actSchema),
    defaultValues: initial
      ? { nombre: initial.nombre, proceso: initial.proceso ?? '', bloque: initial.bloque ?? '', jornadas: initial.jornadas ?? undefined, fechaInicio: initial.fechaInicio ?? '', fechaFin: initial.fechaFin ?? '' }
      : { nombre: '', proceso: '', bloque: '', fechaInicio: '', fechaFin: '' },
  })

  return (
    <form onSubmit={handleSubmit(onSave)}
      className="rounded-lg border p-4 space-y-3"
      style={{ borderColor: 'var(--color-petroleum)', backgroundColor: 'rgba(0,66,84,0.03)' }}
    >
      <div className="md:col-span-2">
        <Input
          label="Nombre de la actividad *"
          placeholder="ej: RF1: Enrutamiento y UI. Diseñar interfaz..."
          error={errors.nombre?.message}
          {...register('nombre')}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input label="Proceso"  placeholder="ej: Front-Bloque-1" {...register('proceso')} />
        <Input label="Bloque"   placeholder="ej: Base-Front"     {...register('bloque')} />
        <Input label="Jornadas" type="number" min={0} step={0.5}  {...register('jornadas')} />
        <div />
        <Input label="Fecha inicio" type="date" {...register('fechaInicio')} />
        <Input label="Fecha fin"    type="date" {...register('fechaFin')} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit"  variant="primary"   size="sm">{initial ? 'Guardar cambios' : 'Agregar actividad'}</Button>
      </div>
    </form>
  )
}

export function Step2Actividades() {
  const { actividades, addActividad, updateActividad, removeActividad, goToStep } = useWizardStore()
  const [adding,    setAdding]    = useState(false)
  const [editingIdx, setEditingIdx] = useState<number | null>(null)

  const handleAdd = (data: ActFormData) => {
    addActividad({ ...data, componentes: [], jornadas: data.jornadas ?? undefined })
    setAdding(false)
  }

  const handleUpdate = (idx: number, data: ActFormData) => {
    updateActividad(idx, { ...actividades[idx], ...data, jornadas: data.jornadas ?? undefined })
    setEditingIdx(null)
  }

  return (
    <div className="space-y-4">
      {/* Tabla de actividades */}
      {actividades.length > 0 && (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}>
                <th className="px-3 py-2 text-left font-medium w-8">#</th>
                <th className="px-3 py-2 text-left font-medium">Nombre actividad</th>
                <th className="px-3 py-2 text-left font-medium hidden md:table-cell w-32">Proceso</th>
                <th className="px-3 py-2 text-left font-medium hidden md:table-cell w-28">Bloque</th>
                <th className="px-3 py-2 text-center font-medium w-20 hidden sm:table-cell">Jornadas</th>
                <th className="px-3 py-2 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {actividades.map((act, idx) => (
                <>
                  <tr
                    key={idx}
                    className="hover:bg-[rgba(0,66,84,0.03)] transition-colors"
                  >
                    <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--color-text-soft)' }}>{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium line-clamp-2" style={{ color: 'var(--color-text)' }}>{act.nombre}</p>
                      <div className="flex gap-2 mt-0.5 md:hidden text-xs" style={{ color: 'var(--color-text-soft)' }}>
                        {act.proceso && <span>{act.proceso}</span>}
                        {act.bloque  && <span>· {act.bloque}</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>{act.proceso ?? '—'}</td>
                    <td className="px-3 py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>{act.bloque ?? '—'}</td>
                    <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--color-text)' }}>
                      {act.jornadas ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => { setEditingIdx(idx); setAdding(false) }}
                          className="text-xs px-1.5 py-0.5 rounded hover:bg-[rgba(0,66,84,0.08)] transition-colors"
                          style={{ color: 'var(--color-text-soft)' }}
                        >✎</button>
                        <button
                          onClick={() => removeActividad(idx)}
                          className="text-xs px-1.5 py-0.5 rounded hover:bg-[rgba(192,57,43,0.08)] transition-colors"
                          style={{ color: '#C0392B' }}
                        >✕</button>
                      </div>
                    </td>
                  </tr>
                  {editingIdx === idx && (
                    <tr key={`edit-${idx}`}>
                      <td colSpan={6} className="px-3 py-2">
                        <ActividadForm
                          initial={act}
                          onSave={data => handleUpdate(idx, data)}
                          onCancel={() => setEditingIdx(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {actividades.length === 0 && !adding && (
        <Card>
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-soft)' }}>
              Sin actividades. Agrega la primera.
            </p>
          </div>
        </Card>
      )}

      {/* Formulario inline de nueva actividad */}
      {adding && (
        <ActividadForm
          onSave={handleAdd}
          onCancel={() => setAdding(false)}
        />
      )}

      {!adding && (
        <Button variant="secondary" size="sm" onClick={() => { setAdding(true); setEditingIdx(null) }}>
          + Agregar actividad
        </Button>
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <Button variant="secondary" onClick={() => goToStep(1)}>← Anterior</Button>
        <Button
          variant="primary"
          disabled={actividades.length === 0}
          onClick={() => goToStep(3)}
        >
          Siguiente: Construcción →
        </Button>
      </div>
    </div>
  )
}
