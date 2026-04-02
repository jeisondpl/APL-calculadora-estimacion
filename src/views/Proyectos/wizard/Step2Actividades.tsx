'use client'

import { Fragment, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
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

// ─── Badge creado por ─────────────────────────────────────────────────────────

function CreadoPorBadge({ act, currentUserId }: { act: IActividad; currentUserId: number | null }) {
  if (act.isDefault)
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Sistema</span>
  if (!act.creadoPorNombre)
    return <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>—</span>
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

// ─── Modal selector de dependencias ──────────────────────────────────────────

function DependenciaSelectorModal({
  actividadNombre,
  allActividades,
  selected,
  onClose,
  onConfirm,
}: {
  actividadNombre: string
  allActividades:  IActividad[]
  selected:        string[]
  onClose:         () => void
  onConfirm:       (deps: string[]) => void
}) {
  const [search,  setSearch]  = useState('')
  const [checked, setChecked] = useState<Set<string>>(new Set(selected))

  const available = allActividades.filter(a => !a.isDefault && a.nombre !== actividadNombre)
  const filtered  = available.filter(a =>
    a.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (a.bloque ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (nombre: string) =>
    setChecked(prev => { const n = new Set(prev); n.has(nombre) ? n.delete(nombre) : n.add(nombre); return n })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="flex flex-col w-full max-w-2xl mx-4 rounded-xl shadow-2xl overflow-hidden"
        style={{ maxHeight: '80vh', backgroundColor: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: 'var(--color-petroleum)' }}>
              Seleccionar dependencias
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-soft)' }}>
              {available.length} disponibles · {checked.size} seleccionada{checked.size !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-lg hover:bg-[rgba(0,0,0,0.06)] transition-colors"
            style={{ color: 'var(--color-text-soft)' }}
          >✕</button>
        </div>

        {/* Buscador */}
        <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <input
            autoFocus
            type="text"
            placeholder="Buscar por nombre o bloque..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
            style={{
              borderColor:     'var(--color-border)',
              color:           'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
            }}
          />
        </div>

        {/* Tabla */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0">
              <tr style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}>
                <th className="px-4 py-2 w-10" />
                <th className="px-4 py-2 text-left font-medium">Actividad</th>
                <th className="px-4 py-2 text-left font-medium w-44">Bloque</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-text-soft)' }}>
                    Sin resultados
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr
                  key={a.nombre}
                  className="hover:bg-[rgba(0,66,84,0.03)] cursor-pointer transition-colors"
                  onClick={() => toggle(a.nombre)}
                >
                  <td className="px-4 py-2.5 text-center">
                    <input
                      type="checkbox"
                      readOnly
                      checked={checked.has(a.nombre)}
                      className="w-4 h-4 cursor-pointer"
                      style={{ accentColor: 'var(--color-petroleum)' }}
                    />
                  </td>
                  <td className="px-4 py-2.5 font-medium" style={{ color: 'var(--color-text)' }}>{a.nombre}</td>
                  <td className="px-4 py-2.5 text-xs"     style={{ color: 'var(--color-text-soft)' }}>{a.bloque || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
            {checked.size === 0 ? 'Ninguna seleccionada' : `${checked.size} seleccionada${checked.size !== 1 ? 's' : ''}`}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button variant="primary"   size="sm" onClick={() => onConfirm(Array.from(checked))}>Aceptar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Chips de dependencias ────────────────────────────────────────────────────

function DependenciasChips({ dependencias, onOpen }: { dependencias?: string[]; onOpen: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {(dependencias ?? []).map(dep => (
        <span
          key={dep}
          className="text-xs px-2 py-0.5 rounded-full font-medium truncate max-w-[180px]"
          style={{ backgroundColor: 'rgba(0,66,84,0.08)', color: 'var(--color-petroleum)' }}
          title={dep}
        >
          {dep}
        </span>
      ))}
      <button
        type="button"
        onClick={onOpen}
        className="text-xs px-2.5 py-1 rounded-md border font-medium transition-colors hover:bg-[rgba(0,66,84,0.06)]"
        style={{ borderColor: 'var(--color-petroleum)', color: 'var(--color-petroleum)' }}
      >
        {(dependencias ?? []).length === 0 ? '+ Agregar dependencia' : '✎ Editar dependencias'}
      </button>
    </div>
  )
}

// ─── Fila sortable (nueva API @dnd-kit/react) ─────────────────────────────────

function SortableRow({
  act,
  index,
  rowNum,
  canManage,
  isEditing,
  isDragDisabled,
  currentUserId,
  onEdit,
  onRemove,
  onOpenDeps,
  editForm,
}: {
  act:            IActividad
  index:          number       // índice dentro del array de custom activities
  rowNum:         number       // número de fila visual (1-based, incluyendo defaults)
  canManage:      boolean
  isEditing:      boolean
  isDragDisabled: boolean
  currentUserId:  number | null
  onEdit:         () => void
  onRemove:       () => void
  onOpenDeps:     () => void
  editForm:       React.ReactNode
}) {
  // setElement: ref de estado — requerido por la nueva API
  const [element, setElement] = useState<Element | null>(null)
  // handleRef: ref del botón de arrastre
  const handleRef = useRef<HTMLButtonElement | null>(null)

  const { isDragging } = useSortable({
    id:       act.nombre,   // ID estable basado en el nombre
    index,
    element,
    handle:   handleRef,
    disabled: isDragDisabled,
  })

  return (
    <Fragment>
      <tr
        ref={setElement as React.Ref<HTMLTableRowElement>}
        className="hover:bg-[rgba(0,66,84,0.03)] transition-colors"
        style={{
          opacity:         isDragging ? 0.5 : 1,
          backgroundColor: isDragging ? 'rgba(0,37,50,0.12)' : undefined,
          transition:      'opacity 0.15s, background-color 0.15s',
        }}
      >
        {/* Handle + número */}
        <td className="px-3 py-2.5 w-12">
          <div className="flex items-center gap-1.5">
            <button
              ref={handleRef}
              type="button"
              disabled={isDragDisabled}
              className="select-none rounded hover:bg-[rgba(0,66,84,0.1)] transition-colors flex items-center justify-center"
              style={{
                color:       'var(--color-petroleum)',
                cursor:      isDragDisabled ? 'default' : 'grab',
                opacity:     isDragDisabled ? 0.2 : 0.6,
                touchAction: 'none',
                fontSize:    '16px',
                lineHeight:  1,
                width:       '1.4rem',
                height:      '1.4rem',
                border:      'none',
                background:  'none',
                padding:     0,
              }}
              title="Arrastrar para reordenar"
            >⠿</button>
            <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{rowNum}</span>
          </div>
        </td>

        {/* Nombre */}
        <td className="px-3 py-2.5">
          <p className="font-medium line-clamp-2" style={{ color: 'var(--color-text)' }}>{act.nombre}</p>
          {act.bloque && (
            <span className="text-xs md:hidden" style={{ color: 'var(--color-text-soft)' }}>{act.bloque}</span>
          )}
          <DependenciasChips dependencias={act.dependencias} onOpen={onOpenDeps} />
        </td>

        {/* Bloque */}
        <td className="px-3 py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>
          {act.bloque || '—'}
        </td>

        {/* Jornadas */}
        <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--color-text)' }}>
          {act.componentes.length > 0 ? act.componentes.length : '—'}
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
            ) : (
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

// ─── Step 2 ───────────────────────────────────────────────────────────────────

export function Step2Actividades() {
  const { actividades, addActividad, updateActividad, removeActividad, reorderByArray, setDependencias, goToStep } = useWizardStore()
  const [adding,      setAdding]      = useState(false)
  const [editingIdx,  setEditingIdx]  = useState<number | null>(null)
  const [depsModalIdx, setDepsModalIdx] = useState<number | null>(null)

  const { data: session } = useSession()
  const currentUserId   = (session?.user as unknown as { userId?: number })?.userId ?? null
  const currentUserName = session?.user?.name ?? null

  const canManage = (act: IActividad) =>
    !act.isDefault && (!act.creadoPorId || act.creadoPorId === currentUserId)

  const defaultActividades = actividades.filter(a => a.isDefault)
  const customActividades  = actividades.filter(a => !a.isDefault)

  const handleAdd = (data: ActFormData) => {
    addActividad({
      nombre:          data.nombre,
      bloque:          data.bloque || undefined,
      proceso:         undefined,
      jornadas:        undefined,
      creadoPorId:     currentUserId,
      creadoPorNombre: currentUserName,
      componentes:     [],
    })
    setAdding(false)
  }

  const handleUpdate = (globalIdx: number, data: ActFormData) => {
    updateActividad(globalIdx, { ...actividades[globalIdx], nombre: data.nombre, bloque: data.bloque || undefined })
    setEditingIdx(null)
  }

  return (
    <div className="space-y-4">
      {actividades.length > 0 && (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
          <DragDropProvider
            onDragEnd={(event) => {
              // move reorders only custom activities; defaults stay in place
              const newCustom = move(customActividades, event)
              reorderByArray([...defaultActividades, ...newCustom])
              setEditingIdx(null)
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}>
                  <th className="px-3 py-2 text-left font-medium w-12">#</th>
                  <th className="px-3 py-2 text-left font-medium">Nombre actividad</th>
                  <th className="px-3 py-2 text-left font-medium hidden md:table-cell w-40">Bloque</th>
                  <th className="px-3 py-2 text-center font-medium w-24 hidden sm:table-cell">Jornadas</th>
                  <th className="px-3 py-2 text-left font-medium hidden lg:table-cell w-36">Creado por</th>
                  <th className="px-3 py-2 w-20"></th>
                </tr>
              </thead>

              {/* Actividades base — estáticas, no arrastrables */}
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {defaultActividades.map((act, i) => (
                  <tr key={act.nombre} className="hover:bg-[rgba(0,66,84,0.02)] transition-colors">
                    <td className="px-3 py-2.5 w-12">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-5" />
                        <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{i + 1}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="font-medium" style={{ color: 'var(--color-text)' }}>{act.nombre}</p>
                    </td>
                    <td className="px-3 py-2.5 hidden md:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>{act.bloque || '—'}</td>
                    <td className="px-3 py-2.5 text-center text-xs hidden sm:table-cell" style={{ color: 'var(--color-text)' }}>{act.jornadas ?? '—'}</td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <CreadoPorBadge act={act} currentUserId={currentUserId} />
                    </td>
                    <td />
                  </tr>
                ))}
              </tbody>

              {/* Actividades custom — sortables */}
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {customActividades.length > 0 && (
                  <tr aria-hidden><td colSpan={6} style={{ padding: 0, height: 0, borderTop: '1px solid #BCBBB5' }} /></tr>
                )}
                {customActividades.map((act, customIdx) => {
                  const globalIdx = actividades.indexOf(act)
                  const rowNum    = defaultActividades.length + customIdx + 1
                  return (
                    <SortableRow
                      key={act.nombre}
                      act={act}
                      index={customIdx}
                      rowNum={rowNum}
                      canManage={canManage(act)}
                      isEditing={editingIdx === globalIdx}
                      isDragDisabled={editingIdx !== null || adding}
                      currentUserId={currentUserId}
                      onEdit={() => { setEditingIdx(globalIdx); setAdding(false) }}
                      onRemove={() => removeActividad(globalIdx)}
                      onOpenDeps={() => { setDepsModalIdx(globalIdx); setEditingIdx(null) }}
                      editForm={
                        <ActividadForm
                          initial={act}
                          onSave={data => handleUpdate(globalIdx, data)}
                          onCancel={() => setEditingIdx(null)}
                        />
                      }
                    />
                  )
                })}
              </tbody>
            </table>
          </DragDropProvider>
        </div>
      )}

      {actividades.length === 0 && !adding && (
        <Card>
          <div className="py-10 text-center">
            <p className="text-sm" style={{ color: 'var(--color-text-soft)' }}>Sin actividades. Agrega la primera.</p>
          </div>
        </Card>
      )}

      {adding && <ActividadForm onSave={handleAdd} onCancel={() => setAdding(false)} />}

      {!adding && (
        <Button variant="secondary" size="sm" onClick={() => { setAdding(true); setEditingIdx(null) }}>
          + Agregar actividad
        </Button>
      )}

      <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <Button variant="secondary" onClick={() => goToStep(1)}>← Anterior</Button>
        <Button variant="primary" disabled={actividades.length === 0} onClick={() => goToStep(3)}>
          Siguiente: Construcción →
        </Button>
      </div>

      {depsModalIdx !== null && (
        <DependenciaSelectorModal
          actividadNombre={actividades[depsModalIdx].nombre}
          allActividades={actividades}
          selected={actividades[depsModalIdx].dependencias ?? []}
          onClose={() => setDepsModalIdx(null)}
          onConfirm={deps => { setDependencias(depsModalIdx, deps); setDepsModalIdx(null) }}
        />
      )}
    </div>
  )
}
