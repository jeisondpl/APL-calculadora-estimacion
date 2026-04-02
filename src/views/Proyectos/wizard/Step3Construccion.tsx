'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useWizardStore } from '@/modules/proyectos'
import { useComponentesController } from '@/modules/componentes'
import { Button, Badge } from '@/shared/components/ui'
import { formatMinutes } from '@/shared/lib/utils'
import type { IResponseComponente } from '@/modules/componentes'
import type { IActividadComponente } from '@/modules/proyectos'

// ─── Modal selector de componentes ───────────────────────────────────────────

function ComponenteModal({
  allItems,
  exclude,
  onAccept,
  onClose,
}: {
  allItems: IResponseComponente[]
  exclude:  number[]
  onAccept: (selected: IResponseComponente[]) => void
  onClose:  () => void
}) {
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const filtered = allItems.filter(c =>
    !exclude.includes(c.id) &&
    (query.trim() === '' ||
      c.nombreComponente.toLowerCase().includes(query.toLowerCase()) ||
      c.grupoNombre.toLowerCase().includes(query.toLowerCase()) ||
      c.tecnologiaNombre.toLowerCase().includes(query.toLowerCase()))
  )

  const toggle = (id: number) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleAccept = () => {
    const items = allItems.filter(c => selected.has(c.id))
    onAccept(items)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl flex flex-col"
        style={{
          backgroundColor: 'var(--color-surface)',
          maxHeight: '80vh',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Cabecera */}
        <div
          className="px-5 py-4 flex items-center justify-between rounded-t-xl"
          style={{ backgroundColor: 'var(--color-petroleum)' }}
        >
          <div>
            <h2 className="text-sm font-semibold text-white">Seleccionar componentes</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {allItems.length} disponibles · {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 text-lg leading-none">✕</button>
        </div>

        {/* Buscador */}
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, grupo o tecnología…"
            className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
            }}
          />
          {query.trim() && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--color-text-soft)' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
            </p>
          )}
        </div>

        {/* Lista */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-center py-10" style={{ color: 'var(--color-text-soft)' }}>
              Sin resultados
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0" style={{ backgroundColor: 'var(--color-surface)', zIndex: 1 }}>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th className="px-4 py-2 w-10"></th>
                  <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>Componente</th>
                  <th className="px-3 py-2 text-left text-xs font-medium hidden sm:table-cell" style={{ color: 'var(--color-text-soft)' }}>Grupo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium hidden sm:table-cell" style={{ color: 'var(--color-text-soft)' }}>Tecnología</th>
                  <th className="px-3 py-2 text-right text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>Base</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {filtered.map(c => {
                  const checked = selected.has(c.id)
                  return (
                    <tr
                      key={c.id}
                      className="cursor-pointer transition-colors"
                      style={{ backgroundColor: checked ? 'rgba(0,66,84,0.07)' : undefined }}
                      onClick={() => toggle(c.id)}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <input
                          type="checkbox"
                          readOnly
                          checked={checked}
                          className="w-4 h-4 accent-[var(--color-petroleum)] cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                          {c.nombreComponente}
                        </p>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <Badge variant="neutral">{c.grupoNombre}</Badge>
                      </td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <Badge variant="info">{c.tecnologiaNombre}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-medium" style={{ color: 'var(--color-petroleum)' }}>
                        {formatMinutes(c.totalBaseMin)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 flex items-center justify-between border-t rounded-b-xl"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
            {selected.size > 0
              ? `${selected.size} componente${selected.size !== 1 ? 's' : ''} seleccionado${selected.size !== 1 ? 's' : ''}`
              : 'Ninguno seleccionado'}
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
            <Button variant="primary" size="sm" disabled={selected.size === 0} onClick={handleAccept}>
              Aceptar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Tabla agrupada de actividades base (isDefault) ──────────────────────────

function ActividadesBaseTable({ currentUserId, currentUserName, currentRol }: { currentUserId: number | null; currentUserName: string | null; currentRol: string }) {
  const { actividades, datosGenerales, setDatosGenerales, setTiempoEstimador } = useWizardStore()
  const defaults = actividades.map((a, idx) => ({ a, idx })).filter(({ a }) => a.isDefault)

  if (defaults.length === 0) return null

  const { noPrefas, tiempoSesionHoras } = datosGenerales
  const canEditSesion = currentRol === 'SUPERUSUARIO' || currentRol === 'PRODUCT_OWNER'

  // Collect all estimadores present across all activities
  const estimadorMap = new Map<number, string>()
  if (currentUserId && currentUserName) estimadorMap.set(currentUserId, currentUserName)
  defaults.forEach(({ a }) =>
    (a.tiemposEstimador ?? []).forEach(t => { if (!estimadorMap.has(t.userId)) estimadorMap.set(t.userId, t.nombre) })
  )
  const estimadores = Array.from(estimadorMap.entries()).map(([id, nombre]) => ({ id, nombre }))

  // Formula: Jornadas = (noPrefas × Σ horas_estimadores) / 8
  const calcJornadas = (a: typeof defaults[0]['a']) => {
    const suma = (a.tiemposEstimador ?? []).reduce((s, t) => s + t.horas, 0)
    if (!noPrefas || suma === 0) return null
    return +((noPrefas * suma) / 8.8).toFixed(2)
  }

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="px-4 py-3" style={{ backgroundColor: 'var(--color-petroleum)' }}>
        <p className="text-sm font-semibold text-white">Actividades base</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Ingresa el tiempo invertido por cada estimador en cada sesión
        </p>
      </div>

      {/* Campos globales: No. prefas + Tiempo sesión */}
      <div
        className="px-4 py-3 flex flex-wrap gap-6 border-b"
        style={{ backgroundColor: 'rgba(0,66,84,0.04)', borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text-soft)' }}>
            No. prefas / sesiones
          </label>
          <input
            type="number"
            min={0}
            step={1}
            readOnly={!canEditSesion}
            value={noPrefas || ''}
            onChange={e => canEditSesion && setDatosGenerales({ ...datosGenerales, noPrefas: e.target.value === '' ? 0 : parseInt(e.target.value) })}
            placeholder="0"
            className="w-20 px-2 py-1 text-sm rounded-md border outline-none"
            style={{
              borderColor: 'var(--color-border)',
              backgroundColor: canEditSesion ? 'var(--color-surface)' : 'transparent',
              color: 'var(--color-text)',
              cursor: canEditSesion ? 'text' : 'not-allowed',
              opacity: canEditSesion ? 1 : 0.6,
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium whitespace-nowrap" style={{ color: 'var(--color-text-soft)' }}>
            Tiempo por sesión
          </label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              step={0.5}
              readOnly={!canEditSesion}
              value={tiempoSesionHoras || ''}
              onChange={e => canEditSesion && setDatosGenerales({ ...datosGenerales, tiempoSesionHoras: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              placeholder="0.0"
              className="w-20 px-2 py-1 text-sm rounded-md border outline-none"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: canEditSesion ? 'var(--color-surface)' : 'transparent',
                color: 'var(--color-text)',
                cursor: canEditSesion ? 'text' : 'not-allowed',
                opacity: canEditSesion ? 1 : 0.6,
              }}
            />
            <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>h</span>
          </div>
        </div>
        {noPrefas > 0 && (
          <span className="text-xs self-center px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(0,66,84,0.1)', color: 'var(--color-petroleum)' }}>
            Jornadas = (prefas × Σ horas) ÷ 8.8
          </span>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)', borderBottom: '1px solid var(--color-border)' }}>
              <th className="px-3 py-2 text-left text-xs font-medium w-8" style={{ color: 'var(--color-text-soft)' }}>#</th>
              <th className="px-3 py-2 text-left text-xs font-medium" style={{ color: 'var(--color-text-soft)' }}>Actividad</th>
              {estimadores.map(est => (
                <th key={est.id} className="px-3 py-2 text-center text-xs font-medium w-32" style={{ color: est.id === currentUserId ? 'var(--color-petroleum)' : 'var(--color-text-soft)' }}>
                  <span className="block truncate max-w-[7rem]" title={est.nombre}>
                    {est.id === currentUserId ? '👤 Tú' : est.nombre.split(' ')[0]}
                  </span>
                  <span className="font-normal opacity-70">(h/sesión)</span>
                </th>
              ))}
              <th className="px-3 py-2 text-center text-xs font-medium w-24" style={{ color: 'var(--color-text-soft)' }}>Jornadas</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {defaults.map(({ a, idx }, row) => {
              const jornadas = calcJornadas(a)
              return (
                <tr key={idx} className="hover:bg-[rgba(0,66,84,0.02)] transition-colors">
                  <td className="px-3 py-2.5 text-xs" style={{ color: 'var(--color-text-soft)' }}>{row + 1}</td>
                  <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text)' }}>{a.nombre}</td>
                  {estimadores.map(est => {
                    const entry = (a.tiemposEstimador ?? []).find(t => t.userId === est.id)
                    const isMe  = est.id === currentUserId
                    return (
                      <td key={est.id} className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          readOnly={!isMe}
                          value={entry?.horas ?? ''}
                          onChange={e => {
                            if (!isMe) return
                            const h = e.target.value === '' ? 0 : parseFloat(e.target.value)
                            setTiempoEstimador(idx, est.id, est.nombre, h)
                          }}
                          placeholder="0.0"
                          className="w-20 px-2 py-1 text-sm rounded-md border outline-none text-center"
                          style={{
                            borderColor:     'var(--color-border)',
                            backgroundColor: isMe ? 'var(--color-surface)' : 'transparent',
                            color:           'var(--color-text)',
                            opacity:         !isMe && !entry ? 0.3 : 1,
                            cursor:          !isMe ? 'default' : 'text',
                          }}
                        />
                      </td>
                    )
                  })}
                  <td className="px-3 py-2.5 text-center">
                    {jornadas !== null && jornadas > 0 ? (
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-petroleum)' }}>{jornadas}</span>
                    ) : (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#d97706' }}
                        title="Sin jornadas — no se puede planificar"
                      >
                        Sin jornadas
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
          {defaults.some(({ a }) => calcJornadas(a) !== null) && (
            <tfoot>
              <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)', borderTop: '1px solid var(--color-border)' }}>
                <td colSpan={2 + estimadores.length} className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--color-text-soft)' }}>
                  Total actividades base:
                </td>
                <td className="px-3 py-2 text-center text-xs font-semibold" style={{ color: 'var(--color-petroleum)' }}>
                  {defaults.reduce((s, { a }) => s + (calcJornadas(a) ?? 0), 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

// ─── Panel actividad con componentes ─────────────────────────────────────────

function ActividadPanel({
  actIdx,
  allItems,
  currentUserId,
}: {
  actIdx:        number
  allItems:      IResponseComponente[]
  currentUserId: number | null
}) {
  const { actividades, addComponente, updateComponente, removeComponente } = useWizardStore()
  const actividad  = actividades[actIdx]
  const [modal, setModal] = useState(false)

  const locked = !!(actividad.creadoPorId && actividad.creadoPorId !== currentUserId)

  const handleAccept = (items: IResponseComponente[]) => {
    items.forEach(c => {
      const comp: IActividadComponente = {
        componenteId:     c.id,
        nombreComponente: c.nombreComponente,
        grupoNombre:      c.grupoNombre,
        lenguajeNombre:   c.lenguajeNombre,
        tecnologiaNombre: c.tecnologiaNombre,
        cantidad:         1,
        reutilizar:       false,
        tiempoBaseMin:    c.totalBaseMin,
        tiempoCopilotMin: c.totalCopilotMin,
        tiempoTmeMin:     c.totalTmeMin,
      }
      addComponente(actIdx, comp)
    })
    setModal(false)
  }

  const totalBase  = actividad.componentes.reduce((s, c) => s + (c.tiempoBaseMin ?? 0) * c.cantidad, 0)
  const totalH     = +(totalBase / 60).toFixed(2)
  const totalJ     = +(totalH / 8).toFixed(2)
  const excludeIds = actividad.componentes.map(c => c.componenteId)

  return (
    <>
      {modal && (
        <ComponenteModal
          allItems={allItems}
          exclude={excludeIds}
          onAccept={handleAccept}
          onClose={() => setModal(false)}
        />
      )}

      <div className="rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
        {/* Header */}
        <div
          className="px-4 py-3 rounded-t-lg flex items-start justify-between gap-4"
          style={{ backgroundColor: locked ? 'rgba(0,66,84,0.55)' : 'var(--color-petroleum)' }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-white truncate">
                {actIdx + 1}. {actividad.nombre}
              </p>
              {actividad.componentes.length === 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{ backgroundColor: 'rgba(245,158,11,0.25)', color: '#fbbf24' }}
                  title="Sin componentes — las jornadas serán 0"
                >
                  ⚠ Sin jornadas
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {actividad.bloque && <span>{actividad.bloque}</span>}
              {actividad.componentes.length > 0 && (
                <span>· {actividad.componentes.length} componente{actividad.componentes.length !== 1 ? 's' : ''}</span>
              )}
              {actividad.creadoPorNombre && (
                <span
                  className="px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                >
                  {locked ? `🔒 ${actividad.creadoPorNombre}` : '👤 Tú'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {totalBase > 0 && (
              <div className="text-right text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
                <p className="font-semibold">{formatMinutes(totalBase)}</p>
                <p>{totalH}h · {totalJ}j</p>
              </div>
            )}
            {!locked && (
              <button
                onClick={() => setModal(true)}
                className="px-3 py-1.5 text-xs rounded-md font-medium transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
              >
                + Agregar
              </button>
            )}
          </div>
        </div>

        {/* Componentes asociados */}
        {actividad.componentes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)' }}>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-soft)' }}>Componente</th>
                  <th className="px-3 py-2 text-left font-medium hidden sm:table-cell" style={{ color: 'var(--color-text-soft)' }}>Tecnología</th>
                  <th className="px-3 py-2 text-center font-medium w-24" style={{ color: 'var(--color-text-soft)' }}>Cantidad</th>
                  <th className="px-3 py-2 text-center font-medium w-20" style={{ color: 'var(--color-text-soft)' }}>Reutilizar</th>
                  <th className="px-3 py-2 text-right font-medium w-24" style={{ color: 'var(--color-text-soft)' }}>Base/min</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {actividad.componentes.map(comp => (
                  <tr key={comp.componenteId} className="hover:bg-[rgba(0,66,84,0.03)]">
                    <td className="px-3 py-2">
                      <p className="font-medium truncate max-w-xs" style={{ color: 'var(--color-text)' }}>
                        {comp.nombreComponente}
                      </p>
                      <div className="flex gap-1 mt-0.5">
                        <Badge variant="neutral">{comp.grupoNombre}</Badge>
                      </div>
                    </td>
                    <td className="px-3 py-2 hidden sm:table-cell" style={{ color: 'var(--color-text-soft)' }}>
                      {comp.tecnologiaNombre}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {locked ? (
                        <span className="font-medium text-xs" style={{ color: 'var(--color-text)' }}>{comp.cantidad}</span>
                      ) : (
                        <div
                          className="flex items-center justify-center gap-1 border rounded overflow-hidden mx-auto w-fit"
                          style={{ borderColor: 'var(--color-border)' }}
                        >
                          <button
                            className="px-1.5 py-0.5 hover:bg-gray-100 disabled:opacity-40"
                            disabled={comp.cantidad <= 1}
                            onClick={() => updateComponente(actIdx, comp.componenteId, { cantidad: comp.cantidad - 1 })}
                          >−</button>
                          <span className="px-2 font-medium min-w-[1.5rem] text-center" style={{ color: 'var(--color-text)' }}>
                            {comp.cantidad}
                          </span>
                          <button
                            className="px-1.5 py-0.5 hover:bg-gray-100"
                            onClick={() => updateComponente(actIdx, comp.componenteId, { cantidad: comp.cantidad + 1 })}
                          >+</button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={comp.reutilizar}
                        disabled={locked}
                        onChange={e => !locked && updateComponente(actIdx, comp.componenteId, { reutilizar: e.target.checked })}
                        className="w-4 h-4 accent-[var(--color-petroleum)]"
                        style={{ cursor: locked ? 'not-allowed' : 'pointer', opacity: locked ? 0.5 : 1 }}
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium" style={{ color: 'var(--color-petroleum)' }}>
                      {formatMinutes((comp.tiempoBaseMin ?? 0) * comp.cantidad)}
                    </td>
                    <td className="px-3 py-2">
                      {!locked && (
                        <button
                          onClick={() => removeComponente(actIdx, comp.componenteId)}
                          className="hover:opacity-70 transition-opacity"
                          style={{ color: '#C0392B' }}
                        >✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)' }}>
                  <td colSpan={4} className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--color-text-soft)' }}>
                    Total actividad:
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-semibold" style={{ color: 'var(--color-petroleum)' }}>
                    {formatMinutes(totalBase)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {actividad.componentes.length === 0 && (
          <div className="px-4 py-5 text-center">
            {locked ? (
              <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                🔒 Solo lectura · esta actividad fue creada por otro estimador
              </p>
            ) : (
              <>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-soft)' }}>
                  Sin componentes. Abre el selector para agregar.
                </p>
                <button
                  onClick={() => setModal(true)}
                  className="px-4 py-2 text-xs rounded-lg border transition-colors hover:bg-[rgba(0,66,84,0.06)]"
                  style={{ borderColor: 'var(--color-petroleum)', color: 'var(--color-petroleum)' }}
                >
                  + Agregar componentes
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </>
  )
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

export function Step3Construccion({
  onSave,
  saving,
}: {
  onSave:  () => void
  saving:  boolean
}) {
  const { actividades, goToStep } = useWizardStore()
  const { paginado, _list } = useComponentesController()
  const { data: session } = useSession()
  const currentUserId   = (session?.user as unknown as { userId?: number })?.userId ?? null
  const currentUserName = session?.user?.name ?? null
  const currentRol      = (session?.user as unknown as { rol?: string })?.rol ?? ''

  // Carga única de componentes a nivel de Step3
  useEffect(() => { _list({ limit: 500 }) }, [_list])
  const allItems = paginado?.items ?? []

  const totalBase     = actividades.reduce((s, a) =>
    s + a.componentes.reduce((cs, c) => cs + (c.tiempoBaseMin ?? 0) * c.cantidad, 0), 0)
  const jornadasFijas = actividades.reduce((s, a) => s + (a.isDefault ? (a.jornadas ?? 0) : 0), 0)
  const totalH        = +(totalBase / 60).toFixed(2)
  const totalJ        = +(totalH / 8 + jornadasFijas).toFixed(2)

  return (
    <div className="space-y-4">
      {/* Resumen global */}
      {(totalBase > 0 || jornadasFijas > 0) && (
        <div
          className="flex items-center gap-6 px-4 py-3 rounded-lg text-sm"
          style={{ backgroundColor: 'rgba(0,66,84,0.08)' }}
        >
          <span className="font-medium" style={{ color: 'var(--color-petroleum)' }}>Total proyecto:</span>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{formatMinutes(totalBase)}</span>
          <span style={{ color: 'var(--color-text-soft)' }}>{totalH} h</span>
          <span style={{ color: 'var(--color-text-soft)' }}>{totalJ} jornadas</span>
        </div>
      )}

      {/* Actividades base agrupadas */}
      <ActividadesBaseTable currentUserId={currentUserId} currentUserName={currentUserName} currentRol={currentRol} />

      {/* Actividades con componentes */}
      {actividades.map((act, idx) =>
        act.isDefault ? null : (
          <ActividadPanel key={idx} actIdx={idx} allItems={allItems} currentUserId={currentUserId} />
        )
      )}

      {/* Navegación */}
      <div className="flex justify-between pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <Button variant="secondary" onClick={() => goToStep(2)}>← Anterior</Button>
        <Button variant="primary" onClick={onSave} loading={saving}>
          Guardar proyecto
        </Button>
      </div>
    </div>
  )
}
