'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWizardStore } from '@/modules/proyectos'
import { useComponentesController } from '@/modules/componentes'
import { Button, Badge } from '@/shared/components/ui'
import { formatMinutes } from '@/shared/lib/utils'
import type { IResponseComponente } from '@/modules/componentes'
import type { IActividadComponente } from '@/modules/proyectos'

// ─── Buscador de componentes ──────────────────────────────────────────────────

function ComponenteSearch({
  onSelect,
  exclude,
}: {
  onSelect: (c: IResponseComponente) => void
  exclude: number[]
}) {
  const { paginado, _list } = useComponentesController()
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)

  useEffect(() => { _list({ limit: 200 }) }, [_list])

  const filtered = (paginado?.items ?? []).filter(c =>
    !exclude.includes(c.id) &&
    (query.trim() === '' ||
      c.nombreComponente.toLowerCase().includes(query.toLowerCase()) ||
      c.grupoNombre.toLowerCase().includes(query.toLowerCase()) ||
      c.tecnologiaNombre.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 12)

  return (
    <div className="relative">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Buscar componente por nombre, grupo o tecnología..."
        className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
        style={{
          borderColor: 'var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        }}
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute z-20 left-0 right-0 top-full mt-1 rounded-lg border shadow-lg overflow-hidden max-h-60 overflow-y-auto"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {filtered.map(c => (
            <button
              key={c.id}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-[rgba(0,66,84,0.06)] transition-colors border-b last:border-b-0"
              style={{ borderColor: 'var(--color-border)' }}
              onMouseDown={() => { onSelect(c); setQuery(''); setOpen(false) }}
            >
              <p className="text-xs font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {c.nombreComponente}
              </p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                <Badge variant="neutral">{c.grupoNombre}</Badge>
                <Badge variant="info">{c.tecnologiaNombre}</Badge>
                <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                  {formatMinutes(c.totalBaseMin)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Panel de una actividad ───────────────────────────────────────────────────

function ActividadPanel({ actIdx }: { actIdx: number }) {
  const { actividades, addComponente, updateComponente, removeComponente } = useWizardStore()
  const actividad = actividades[actIdx]

  const handleSelect = (c: IResponseComponente) => {
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
  }

  const totalBase = actividad.componentes.reduce((s, c) => s + (c.tiempoBaseMin ?? 0) * c.cantidad, 0)
  const totalH    = +(totalBase / 60).toFixed(2)
  const totalJ    = +(totalH / 8).toFixed(2)
  const excludeIds = actividad.componentes.map(c => c.componenteId)

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Header de actividad */}
      <div
        className="px-4 py-3 flex items-start justify-between gap-4"
        style={{ backgroundColor: 'var(--color-petroleum)' }}
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {actIdx + 1}. {actividad.nombre}
          </p>
          <div className="flex gap-3 mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {actividad.proceso && <span>{actividad.proceso}</span>}
            {actividad.bloque  && <span>· {actividad.bloque}</span>}
            {actividad.jornadas && <span>· {actividad.jornadas} jornadas</span>}
          </div>
        </div>
        {totalBase > 0 && (
          <div className="shrink-0 text-right text-xs" style={{ color: 'rgba(255,255,255,0.85)' }}>
            <p className="font-semibold">{formatMinutes(totalBase)}</p>
            <p>{totalH}h · {totalJ}j</p>
          </div>
        )}
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
                    <div className="flex items-center justify-center gap-1 border rounded overflow-hidden mx-auto w-fit"
                      style={{ borderColor: 'var(--color-border)' }}>
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
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={comp.reutilizar}
                      onChange={e => updateComponente(actIdx, comp.componenteId, { reutilizar: e.target.checked })}
                      className="w-4 h-4 cursor-pointer accent-[var(--color-petroleum)]"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium" style={{ color: 'var(--color-petroleum)' }}>
                    {formatMinutes((comp.tiempoBaseMin ?? 0) * comp.cantidad)}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => removeComponente(actIdx, comp.componenteId)}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: '#C0392B' }}
                    >✕</button>
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

      {/* Buscador */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <ComponenteSearch onSelect={handleSelect} exclude={excludeIds} />
      </div>
    </div>
  )
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────

export function Step3Construccion({
  onSave,
  saving,
}: {
  onSave: () => void
  saving: boolean
}) {
  const { actividades, goToStep } = useWizardStore()

  const totalBase    = actividades.reduce((s, a) =>
    s + a.componentes.reduce((cs, c) => cs + (c.tiempoBaseMin ?? 0) * c.cantidad, 0), 0)
  const totalH = +(totalBase / 60).toFixed(2)
  const totalJ = +(totalH / 8).toFixed(2)

  return (
    <div className="space-y-4">
      {/* Resumen global */}
      {totalBase > 0 && (
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

      {/* Panel por actividad */}
      {actividades.map((_, idx) => (
        <ActividadPanel key={idx} actIdx={idx} />
      ))}

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
