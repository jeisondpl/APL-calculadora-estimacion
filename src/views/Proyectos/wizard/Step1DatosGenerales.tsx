'use client'

import { useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import { Input, Button } from '@/shared/components/ui'
import { useWizardStore } from '@/modules/proyectos'
import type { DatosGenerales } from '@/modules/proyectos'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsuarioOption {
  id:     number
  nombre: string
  rol:    { nombre: string }
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  requerimiento:   z.string().min(1, 'Requerido'),
  nombreProyecto:  z.string().min(1, 'Requerido'),
  objetivo:        z.string().optional().default(''),
  fechaEstimacion: z.string().min(1, 'Requerido'),
  fechaEjecucion:  z.string().min(1, 'Requerido'),
  supervisadoPor:  z.string().min(1, 'Requerido'),
})

type FormData = z.infer<typeof schema>

// ─── Component ────────────────────────────────────────────────────────────────

export function Step1DatosGenerales() {
  const { datosGenerales, setDatosGenerales, goToStep, editingId } = useWizardStore()
  const { data: session } = useSession()
  const rol        = (session?.user as unknown as { rol?: string })?.rol ?? ''
  const readOnly   = (rol === 'DESARROLLADOR' || rol === 'QA') && editingId !== null

  // Lists from API
  const [supervisores,   setSupervisores]   = useState<UsuarioOption[]>([])
  const [estimadorPool,  setEstimadorPool]  = useState<UsuarioOption[]>([])

  // Selected estimadores (managed outside RHF because it's an array)
  const [estimadorIds,   setEstimadorIds]   = useState<number[]>(datosGenerales.estimadorIds ?? [])

  // Modal estado
  const [modalOpen,        setModalOpen]        = useState(false)
  const [dateError,        setDateError]        = useState(false)
  const [estimadoresError, setEstimadoresError] = useState(false)
  const [modalSelected,  setModalSelected]  = useState<Set<number>>(new Set())
  const [modalQuery,     setModalQuery]     = useState('')

  const filteredPool = useMemo(() => {
    const q = modalQuery.trim().toLowerCase()
    if (!q) return estimadorPool
    return estimadorPool.filter(u => u.nombre.toLowerCase().includes(q))
  }, [estimadorPool, modalQuery])

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      requerimiento:   datosGenerales.requerimiento,
      nombreProyecto:  datosGenerales.nombreProyecto,
      objetivo:        datosGenerales.objetivo,
      fechaEstimacion: datosGenerales.fechaEstimacion,
      fechaEjecucion:  datosGenerales.fechaEjecucion,
      supervisadoPor:  datosGenerales.supervisadoPor,
    },
  })

  const fechaEstimacion = watch('fechaEstimacion')
  const fechaEjecucion  = watch('fechaEjecucion')

  useEffect(() => {
    if (fechaEstimacion && fechaEjecucion && fechaEjecucion < fechaEstimacion) {
      setDateError(true)
    }
  }, [fechaEstimacion, fechaEjecucion])

  // Fetch lists on mount
  useEffect(() => {
    axios.get<UsuarioOption[]>('/api/usuarios/por-rol?roles=PRODUCT_OWNER')
      .then(r => setSupervisores(r.data))
      .catch(() => {})

    axios.get<UsuarioOption[]>('/api/usuarios/por-rol?roles=DESARROLLADOR,QA')
      .then(r => setEstimadorPool(
        [...r.data].sort((a, b) => a.rol.nombre.localeCompare(b.rol.nombre) || a.nombre.localeCompare(b.nombre))
      ))
      .catch(() => {})
  }, [])

  // Open modal pre-seeded with current selection
  const openModal = () => {
    setModalSelected(new Set(estimadorIds))
    setModalQuery('')
    setModalOpen(true)
  }

  const toggleModal = (id: number) => {
    setModalSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const confirmModal = () => {
    setEstimadorIds(Array.from(modalSelected))
    if (modalSelected.size > 0) setEstimadoresError(false)
    setModalOpen(false)
  }

  const removeEstimador = (id: number) => {
    setEstimadorIds(prev => prev.filter(x => x !== id))
  }

  const getEstimadorName = (id: number) =>
    estimadorPool.find(u => u.id === id)?.nombre ?? String(id)

  const onSubmit = (data: FormData) => {
    if (estimadorIds.length === 0) { setEstimadoresError(true); return }
    // Preserve fields not managed by RHF (noPrefas, tiempoSesionHoras)
    setDatosGenerales({ ...datosGenerales, ...data, estimadorIds } as DatosGenerales)
    goToStep(2)
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <Input
            label="Requerimiento *"
            placeholder="ej: ODTT-30915"
            error={errors.requerimiento?.message}
            readOnly={readOnly}
            style={readOnly ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            {...register('requerimiento')}
          />
          <Input
            label="Nombre del proyecto *"
            placeholder="ej: Línea Base"
            error={errors.nombreProyecto?.message}
            readOnly={readOnly}
            style={readOnly ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            {...register('nombreProyecto')}
          />

          <div className="md:col-span-2">
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-soft)' }}>
              Objetivo
            </label>
            <textarea
              rows={7}
              placeholder="Describe el objetivo del requerimiento..."
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none resize-none transition-colors"
              style={{
                borderColor:     'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color:           'var(--color-text)',
              }}
              {...register('objetivo')}
            />
          </div>

          <Input
            label="Fecha estimación *"
            type="date"
            readOnly={readOnly}
            style={readOnly ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            error={errors.fechaEstimacion?.message}
            {...register('fechaEstimacion')}
          />
          <Input
            label="Fecha ejecución *"
            type="date"
            readOnly={readOnly}
            style={readOnly ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
            error={errors.fechaEjecucion?.message}
            {...register('fechaEjecucion')}
          />

          {/* Supervisado por */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>
              Supervisado por *
            </label>
            <select
              {...register('supervisadoPor')}
              disabled={readOnly}
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{
                borderColor:     errors.supervisadoPor ? '#C0392B' : 'var(--color-border)',
                color:           'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
                opacity:         readOnly ? 0.6 : 1,
                cursor:          readOnly ? 'not-allowed' : 'default',
              }}
            >
              <option value="">— Seleccionar —</option>
              {supervisores.map(s => (
                <option key={s.id} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
            {errors.supervisadoPor && (
              <p className="text-xs" style={{ color: '#C0392B' }}>{errors.supervisadoPor.message}</p>
            )}
          </div>

          {/* Estimadores */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>
              Estimadores *
            </label>

            {/* Chips */}
            {estimadorIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {estimadorIds.map(id => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'var(--color-petroleum)', color: '#fff' }}
                  >
                    {getEstimadorName(id)}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeEstimador(id)}
                        className="ml-1 hover:opacity-70 transition-opacity"
                        aria-label={`Quitar ${getEstimadorName(id)}`}
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {!readOnly && (
              <button
                type="button"
                onClick={openModal}
                className="self-start px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:opacity-80"
                style={{ borderColor: 'var(--color-petroleum)', color: 'var(--color-petroleum)' }}
              >
                + Agregar estimadores
              </button>
            )}
            {estimadoresError && estimadorIds.length === 0 && (
              <p className="text-xs" style={{ color: '#C0392B' }}>Por lo menos debe seleccionar un estimador</p>
            )}
          </div>

        </div>

        <div className="flex justify-end pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <Button type="submit" variant="primary">
            Siguiente: Actividades →
          </Button>
        </div>
      </form>

      {/* Modal error de fechas */}
      {dateError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <div
            className="rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">⚠️</span>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                  Fechas inválidas
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-soft)' }}>
                  La <strong style={{ color: 'var(--color-text)' }}>fecha de ejecución</strong> no puede ser anterior a la <strong style={{ color: 'var(--color-text)' }}>fecha de estimación</strong>.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDateError(false)}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--color-petroleum)' }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de estimadores */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onMouseDown={e => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div
            className="w-full max-w-lg rounded-xl shadow-2xl flex flex-col"
            style={{
              backgroundColor: 'var(--color-surface)',
              border:          '1px solid var(--color-border)',
              maxHeight:       '80vh',
            }}
          >
            {/* Cabecera */}
            <div
              className="px-5 py-4 flex items-center justify-between rounded-t-xl"
              style={{ backgroundColor: 'var(--color-petroleum)' }}
            >
              <div>
                <h2 className="text-sm font-semibold text-white">Seleccionar estimadores</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {estimadorPool.length} disponibles · {modalSelected.size} seleccionado{modalSelected.size !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-white opacity-70 hover:opacity-100 text-lg leading-none">✕</button>
            </div>

            {/* Buscador */}
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <input
                autoFocus
                value={modalQuery}
                onChange={e => setModalQuery(e.target.value)}
                placeholder="Buscar por nombre…"
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{
                  borderColor:     'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color:           'var(--color-text)',
                }}
              />
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto">
              {filteredPool.length === 0 ? (
                <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-soft)' }}>
                  No hay estimadores disponibles
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)', borderBottom: '1px solid var(--color-border)' }}>
                      <th className="w-10 px-4 py-2" />
                      <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-soft)' }}>Nombre</th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-soft)' }}>Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    {filteredPool.map(u => (
                      <tr
                        key={u.id}
                        className="cursor-pointer hover:bg-[rgba(0,66,84,0.04)] transition-colors"
                        onClick={() => toggleModal(u.id)}
                      >
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="checkbox"
                            readOnly
                            checked={modalSelected.has(u.id)}
                            className="w-4 h-4 accent-[var(--color-petroleum)]"
                          />
                        </td>
                        <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text)' }}>
                          {u.nombre}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: u.rol.nombre === 'QA' ? 'rgba(16,185,129,0.1)' : 'rgba(0,66,84,0.1)',
                              color:           u.rol.nombre === 'QA' ? '#10b981' : 'var(--color-petroleum)',
                            }}
                          >
                            {u.rol.nombre}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 border-t flex items-center justify-between"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                {modalSelected.size === 0 ? 'Ninguno seleccionado' : `${modalSelected.size} seleccionado${modalSelected.size !== 1 ? 's' : ''}`}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border text-sm transition-colors hover:opacity-80"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmModal}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90 text-white"
                  style={{ backgroundColor: 'var(--color-petroleum)' }}
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
