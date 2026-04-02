'use client'

import { Fragment, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
// CSS from @dnd-kit/utilities not needed: tr elements don't support transform in table layout
import { Button, Input, Card } from '@/shared/components/ui'
import { useWizardStore } from '@/modules/proyectos'
import type { IActividad } from '@/modules/proyectos'

// ─── Constantes ───────────────────────────────────────────────────────────────

const BLOQUES = [
  { value: '',                  label: '— Sin bloque —'    },
  { value: 'Front Bloque I',    label: 'Front Bloque I'    },
  { value: 'Back Bloque III',   label: 'Back Bloque III'   },
  { value: 'Magento Bloque II', label: 'Magento Bloque II' },
] as const

// ─── Formulario inline ────────────────────────────────────────────────────────

const actSchema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  bloque: z.string().optional().default(''),
})
type ActFormData = z.infer<typeof actSchema>

function ActividadForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: IActividad
  onSave:   (d: ActFormData) => void
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ActFormData>({
    resolver: zodResolver(actSchema),
    defaultValues: initial
      ? { nombre: initial.nombre, bloque: initial.bloque ?? '' }
      : { nombre: '', bloque: '' },
  })

  return (
    <form
      onSubmit={handleSubmit(onSave)}
      className="rounded-lg border p-4 space-y-3"
      style={{ borderColor: 'var(--color-petroleum)', backgroundColor: 'rgba(0,66,84,0.03)' }}
    >
      <Input
        label="Nombre de la actividad *"
        placeholder="ej: RF1: Enrutamiento y UI. Diseñar interfaz..."
        error={errors.nombre?.message}
        {...register('nombre')}
      />
      <div className="w-64">
        <label className="text-xs font-medium block mb-1" style={{ color: 'var(--color-text-soft)' }}>
          Bloque
        </label>
        <select
          {...register('bloque')}
          className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', backgroundColor: 'var(--color-surface)' }}
        >
          {BLOQUES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit"  variant="primary"   size="sm">
          {initial ? 'Guardar cambios' : 'Agregar actividad'}
        </Button>
      </div>
    </form>
  )
}

// ─── Celda "Creado por" ────────────────────────────────────────────────────────

function CreadoPorBadge({ act, currentUserId }: { act: IActividad; currentUserId: number | null }) {
  if (act.isDefault) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
        style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
        Sistema
      </span>
    )
  }
  if (!act.creadoPorNombre) return <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>—</span>
  const isMe = act.creadoPorId === currentUserId
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        backgroundColor: isMe ? 'rgba(0,66,84,0.1)' : 'rgba(107,114,128,0.1)',
        color:           isMe ? 'var(--color-petroleum)' : 'var(--color-text-soft)',
      }}>
      {isMe ? 'Tú' : act.creadoPorNombre}
    </span>
  )
}

// ─── Fila sortable ────────────────────────────────────────────────────────────

function SortableRow({
  globalIdx,
  act,
  rowNum,
  canManage,
  canDrag,
  isEditing,
  isDragDisabled,
  currentUserId,
  onEdit,
  onRemove,
  editForm,
}: {
  globalIdx:      number
  act:            IActividad
  rowNum:         number
  canManage:      boolean
  canDrag:        boolean
  isEditing:      boolean
  isDragDisabled: boolean
  currentUserId:  number | null
  onEdit:         () => void
  onRemove:       () => void
  editForm:       React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id:       globalIdx,
    disabled: isDragDisabled || !canDrag,
  })

  // CSS transform does NOT work on <tr> in table layout.
  // Solution: hide the source row when dragging; DragOverlay handles the visual.
  return (
    <Fragment>
      <tr
        ref={setNodeRef}
        {...attributes}
        className="hover:bg-[rgba(0,66,84,0.03)] transition-colors"
        style={{ opacity: isDragging ? 0 : 1, outline: 'none' }}
      >
        {/* Handle / número */}
        <td className="px-3 py-2.5 w-10">
          <div className="flex items-center gap-1.5">
            {canDrag && !isDragDisabled ? (
              <span
                {...listeners}
                className="select-none leading-none flex items-center justify-center w-5 h-5 rounded"
                style={{
                  color:       'var(--color-petroleum)',
                  cursor:      'grab',
                  opacity:     isDragging ? 0 : 0.7,
                  touchAction: 'none',
                  userSelect:  'none',
                  fontSize:    '18px',
                }}
                title="Arrastrar para reordenar"
              >⠿</span>
            ) : (
              <span className="inline-block w-5" />
            )}
            <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{rowNum}</span>
          </div>
        </td>

        {/* Nombre */}
        <td className="px-3 py-2.5">
          <p className="font-medium line-clamp-2" style={{ color: 'var(--color-text)' }}>{act.nombre}</p>
          {act.bloque && (
            <span className="text-xs md:hidden" style={{ color: 'var(--color-text-soft)' }}>{act.bloque}</span>
          )}
        </td>

        {/* Bloque */}
        <td className="px-3 py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>
          {act.bloque || '—'}
        </td>

        {/* Jornadas */}
        <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--color-text)' }}>
          {act.isDefault
            ? (act.jornadas ?? '—')
            : (act.componentes.length > 0 ? act.componentes.length : '—')}
        </td>

        {/* Creado por */}
        <td className="px-3 py-2.5 hidden lg:table-cell">
          <CreadoPorBadge act={act} currentUserId={currentUserId} />
        </td>

        {/* Acciones */}
        <td className="px-3 py-2.5">
          <div className="flex gap-1 justify-end items-center">
            {canManage ? (
              <>
                <button
                  onClick={onEdit}
                  className="text-xs px-1.5 py-0.5 rounded hover:bg-[rgba(0,66,84,0.08)] transition-colors"
                  style={{ color: 'var(--color-text-soft)' }}
                >✎</button>
                <button
                  onClick={onRemove}
                  className="text-xs px-1.5 py-0.5 rounded hover:bg-[rgba(192,57,43,0.08)] transition-colors"
                  style={{ color: '#C0392B' }}
                >✕</button>
              </>
            ) : !act.isDefault && (
              <span title="Creada por otro estimador" className="text-xs px-1.5 py-0.5"
                style={{ color: 'var(--color-text-soft)', opacity: 0.5 }}>🔒</span>
            )}
          </div>
        </td>
      </tr>

      {isEditing && (
        <tr>
          <td colSpan={6} className="px-3 py-2">{editForm}</td>
        </tr>
      )}
    </Fragment>
  )
}

// ─── Vista previa en el overlay del drag ──────────────────────────────────────

function DragPreviewRow({ act, rowNum }: { act: IActividad; rowNum: number }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg shadow-xl text-sm"
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '2px solid var(--color-petroleum)',
        minWidth:        320,
        cursor:          'grabbing',
      }}
    >
      <span className="text-lg leading-none select-none" style={{ color: 'var(--color-petroleum)' }}>⠿</span>
      <span className="text-xs w-5 shrink-0" style={{ color: 'var(--color-text-soft)' }}>{rowNum}</span>
      <span className="font-medium truncate flex-1" style={{ color: 'var(--color-petroleum)' }}>{act.nombre}</span>
      {act.bloque && (
        <span className="text-xs shrink-0 hidden md:inline" style={{ color: 'var(--color-text-soft)' }}>{act.bloque}</span>
      )}
    </div>
  )
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

export function Step2Actividades() {
  const { actividades, addActividad, updateActividad, removeActividad, reorderActividad, goToStep } = useWizardStore()
  const [adding,      setAdding]      = useState(false)
  const [editingIdx,  setEditingIdx]  = useState<number | null>(null)
  const [activeId,    setActiveId]    = useState<number | null>(null)

  const { data: session } = useSession()
  const currentUserId   = (session?.user as unknown as { userId?: number })?.userId ?? null
  const currentUserName = session?.user?.name ?? null

  // edit + delete: only the creator (or legacy activities without owner)
  const canManage = (act: IActividad) =>
    !act.isDefault && (!act.creadoPorId || act.creadoPorId === currentUserId)

  // drag to reorder: any non-default activity
  const canDrag = (act: IActividad) => !act.isDefault

  // Sensors — require 8px movement to start drag (prevents accidental drags on click)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  // IDs for SortableContext = global indices of custom (non-default) actividades
  const sortableIds = actividades
    .map((a, idx) => ({ a, idx }))
    .filter(({ a }) => !a.isDefault)
    .map(({ idx }) => idx)

  const activeAct = activeId !== null ? actividades[activeId] : null

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as number)
    setEditingIdx(null) // close any open edit form
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    if (!over || active.id === over.id) return
    reorderActividad(active.id as number, over.id as number)
  }

  const handleAdd = (data: ActFormData) => {
    addActividad({
      nombre: data.nombre,
      bloque: data.bloque || undefined,
      proceso: undefined,
      jornadas: undefined,
      creadoPorId: currentUserId,
      creadoPorNombre: currentUserName,
      componentes: [],
    })
    setAdding(false)
  }

  const handleUpdate = (idx: number, data: ActFormData) => {
    updateActividad(idx, { ...actividades[idx], nombre: data.nombre, bloque: data.bloque || undefined })
    setEditingIdx(null)
  }

  return (
    <div className="space-y-4">
      {actividades.length > 0 && (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}>
                  <th className="px-3 py-2 text-left font-medium w-10">#</th>
                  <th className="px-3 py-2 text-left font-medium">Nombre actividad</th>
                  <th className="px-3 py-2 text-left font-medium hidden md:table-cell w-40">Bloque</th>
                  <th className="px-3 py-2 text-center font-medium w-24 hidden sm:table-cell">Jornadas</th>
                  <th className="px-3 py-2 text-left font-medium hidden lg:table-cell w-36">Creado por</th>
                  <th className="px-3 py-2 w-20"></th>
                </tr>
              </thead>

              {/* Actividades base — no son sortables */}
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {actividades
                  .map((act, idx) => ({ act, idx }))
                  .filter(({ act }) => act.isDefault)
                  .map(({ act, idx }, row) => (
                    <Fragment key={idx}>
                      <tr className="hover:bg-[rgba(0,66,84,0.02)] transition-colors">
                        <td className="px-3 py-2.5 w-10">
                          <div className="flex items-center gap-1.5">
                            <span className="w-4" />
                            <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{row + 1}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text)' }}>{act.nombre}</td>
                        <td className="px-3 py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>{act.bloque || '—'}</td>
                        <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--color-text)' }}>{act.jornadas ?? '—'}</td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          <CreadoPorBadge act={act} currentUserId={currentUserId} />
                        </td>
                        <td />
                      </tr>
                    </Fragment>
                  ))}
              </tbody>

              {/* Actividades custom — sortables */}
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {actividades
                    .map((act, idx) => ({ act, idx }))
                    .filter(({ act }) => !act.isDefault)
                    .map(({ act, idx }, customRow) => {
                      const rowNum = actividades.filter(a => a.isDefault).length + customRow + 1
                      return (
                        <SortableRow
                          key={idx}
                          globalIdx={idx}
                          act={act}
                          rowNum={rowNum}
                          canManage={canManage(act)}
                          canDrag={canDrag(act)}
                          isEditing={editingIdx === idx}
                          isDragDisabled={editingIdx !== null || adding}
                          currentUserId={currentUserId}
                          onEdit={() => { setEditingIdx(idx); setAdding(false) }}
                          onRemove={() => removeActividad(idx)}
                          editForm={
                            <ActividadForm
                              initial={act}
                              onSave={data => handleUpdate(idx, data)}
                              onCancel={() => setEditingIdx(null)}
                            />
                          }
                        />
                      )
                    })}
                </tbody>
              </SortableContext>
            </table>

            {/* Overlay — muestra el elemento siendo arrastrado */}
            <DragOverlay>
              {activeAct && activeId !== null && (
                <DragPreviewRow
                  act={activeAct}
                  rowNum={
                    actividades.filter(a => a.isDefault).length +
                    actividades.slice(0, activeId + 1).filter(a => !a.isDefault).length
                  }
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {actividades.length === 0 && !adding && (
        <Card>
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-soft)' }}>Sin actividades. Agrega la primera.</p>
          </div>
        </Card>
      )}

      {adding && (
        <ActividadForm onSave={handleAdd} onCancel={() => setAdding(false)} />
      )}

      {!adding && (
        <Button variant="secondary" size="sm" onClick={() => { setAdding(true); setEditingIdx(null) }}>
          + Agregar actividad
        </Button>
      )}

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
