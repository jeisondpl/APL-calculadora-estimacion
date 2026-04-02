'use client'

import { useEffect, useState } from 'react'
import { useEstimacionController, useEstimacionStore } from '@/modules/estimacion'
import { useComponentesController } from '@/modules/componentes'
import {
  PageHeader, Button, Card, CardHeader,
  SummaryCard, Badge,
} from '@/shared/components/ui'
import Link from 'next/link'
import { formatMinutes, downloadFile, estimacionToCsv } from '@/shared/lib/utils'

export function EstimacionView() {
  const { resultado, loading, error, _calcular } = useEstimacionController()
  const {
    itemsSeleccionados,
    nombreEstimacion,
    setNombreEstimacion,
    quitarComponente,
    setCantidad,
    limpiar,
  } = useEstimacionStore()

  const { paginado, _list } = useComponentesController()
  const [copied, setCopied] = useState(false)

  useEffect(() => { _list({ limit: 200 }) }, [_list])

  // Enriquecer ítems del store con datos del catálogo local
  const itemsConDatos = itemsSeleccionados.map(item => ({
    ...item,
    comp: paginado?.items.find(c => c.id === item.componenteId),
  }))

  const totalBasePreview    = itemsConDatos.reduce((s, i) => s + (i.comp?.totalBaseMin    ?? 0) * i.cantidad, 0)
  const totalCopilotPreview = itemsConDatos.reduce((s, i) => s + (i.comp?.totalCopilotMin ?? 0) * i.cantidad, 0)
  const totalTmePreview     = itemsConDatos.reduce((s, i) => s + (i.comp?.totalTmeMin     ?? 0) * i.cantidad, 0)

  const ahorrocopilot = (resultado?.totalBaseMin ?? totalBasePreview)
    - (resultado?.totalCopilotMin ?? totalCopilotPreview)

  const handleExport = () => {
    if (!resultado) return
    const csv      = estimacionToCsv(resultado)
    const nombre   = resultado.nombre?.replace(/\s+/g, '_') ?? 'estimacion'
    const fecha    = new Date(resultado.createdAt).toISOString().slice(0, 10)
    downloadFile(csv, `${nombre}_${fecha}.csv`)
  }

  const handleCopy = async () => {
    if (!resultado) return
    const text = [
      `Estimación: ${resultado.nombre ?? 'Sin nombre'}`,
      `Fecha: ${new Date(resultado.createdAt).toLocaleDateString('es-ES')}`,
      ``,
      `Tiempo base:    ${formatMinutes(resultado.totalBaseMin)}`,
      `Con Copilot:    ${formatMinutes(resultado.totalCopilotMin)} (ahorro ${formatMinutes(ahorrocopilot)})`,
      `TIGO:            ${formatMinutes(resultado.totalTmeMin)}`,
      ``,
      `Detalle:`,
      ...resultado.items.map(i =>
        `  · ${i.nombreComponente} ×${i.cantidad} — ${formatMinutes(i.tiempoBaseMin)}`
      ),
    ].join('\n')

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Calculadora de Estimación"
        subtitle="Selecciona componentes desde el catálogo y calcula el esfuerzo total"
        action={
          <Link href="/componentes">
            <Button variant="secondary" size="sm">+ Agregar componentes</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Panel izquierdo ────────────────────────────────────────── */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Preview de tiempos (antes de calcular) */}
          {itemsSeleccionados.length > 0 && !resultado && (
            <div className="grid grid-cols-3 gap-3">
              <SummaryCard label="Base estimado"    value={formatMinutes(totalBasePreview)}    sublabel="Preview" />
              <SummaryCard label="Copilot estimado" value={formatMinutes(totalCopilotPreview)} sublabel="Preview" accent="purple" />
              <SummaryCard label="TIGO estimado"     value={formatMinutes(totalTmePreview)}     sublabel="Preview" accent="orange" />
            </div>
          )}

          <Card>
            <CardHeader
              title="Componentes seleccionados"
              subtitle={`${itemsSeleccionados.length} tipo(s) · ${itemsSeleccionados.reduce((s, i) => s + i.cantidad, 0)} unidades`}
              action={
                itemsSeleccionados.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={limpiar}
                    style={{ color: '#C0392B' }}>
                    Limpiar todo
                  </Button>
                )
              }
            />

            {itemsSeleccionados.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm" style={{ color: 'var(--color-text-soft)' }}>
                  No hay componentes en la estimación.
                </p>
                <Link href="/componentes">
                  <Button variant="primary" size="sm" className="mt-3">
                    Ir al catálogo
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {itemsConDatos.map(({ componenteId, cantidad, comp }) => (
                  <div key={componenteId} className="flex items-center gap-3 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {comp?.nombreComponente ?? `Componente #${componenteId}`}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {comp && <Badge variant="neutral">{comp.grupoNombre}</Badge>}
                        {comp && <Badge variant="info">{comp.tecnologiaNombre}</Badge>}
                        {comp && (
                          <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                            {formatMinutes(comp.totalBaseMin)} base
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {comp && (
                        <span className="text-xs font-medium w-20 text-right"
                          style={{ color: 'var(--color-petroleum)' }}>
                          {formatMinutes(comp.totalBaseMin * cantidad)}
                        </span>
                      )}
                      <div className="flex items-center gap-1 border rounded-lg overflow-hidden"
                        style={{ borderColor: 'var(--color-border)' }}>
                        <button
                          onClick={() => setCantidad(componenteId, cantidad - 1)}
                          disabled={cantidad <= 1}
                          className="px-2 py-1 text-sm hover:bg-gray-100 disabled:opacity-40 transition-colors"
                          style={{ color: 'var(--color-text)' }}
                        >
                          −
                        </button>
                        <span className="px-2 py-1 text-sm font-medium min-w-[2rem] text-center"
                          style={{ color: 'var(--color-text)' }}>
                          {cantidad}
                        </span>
                        <button
                          onClick={() => setCantidad(componenteId, cantidad + 1)}
                          className="px-2 py-1 text-sm hover:bg-gray-100 transition-colors"
                          style={{ color: 'var(--color-text)' }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => quitarComponente(componenteId)}
                        className="text-sm hover:opacity-70 transition-opacity"
                        style={{ color: '#C0392B' }}
                        aria-label="Quitar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Nombre + botón calcular */}
          {itemsSeleccionados.length > 0 && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Nombre de la estimación (opcional)"
                value={nombreEstimacion}
                onChange={e => setNombreEstimacion(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border outline-none transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                }}
              />
              <Button
                variant="primary"
                loading={loading}
                onClick={() => _calcular()}
              >
                Calcular y guardar
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
              {error}
            </p>
          )}
        </div>

        {/* ── Panel derecho: resultado ───────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {resultado ? (
            <>
              {/* KPIs */}
              <SummaryCard
                label="Tiempo base total"
                value={formatMinutes(resultado.totalBaseMin)}
                sublabel="Sin asistencia de IA"
                accent="default"
              />
              <SummaryCard
                label="Con Copilot"
                value={formatMinutes(resultado.totalCopilotMin)}
                sublabel={`Ahorro: ${formatMinutes(ahorrocopilot)}`}
                accent="purple"
              />
              <SummaryCard
                label="TIGO"
                value={formatMinutes(resultado.totalTmeMin)}
                sublabel="Con factor multiplicador"
                accent="orange"
              />

              {/* Desglose */}
              <Card padding="sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-text-soft)' }}>
                    Desglose por componente
                  </p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={handleCopy}>
                      {copied ? '✓ Copiado' : '⎘ Copiar'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleExport}>
                      ↓ CSV
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {resultado.items.map(item => (
                    <div key={item.componenteId}
                      className="flex items-start justify-between gap-2 text-xs py-1 border-b last:border-b-0"
                      style={{ borderColor: 'var(--color-border)' }}>
                      <div className="min-w-0">
                        <p className="truncate font-medium" style={{ color: 'var(--color-text)' }}>
                          {item.nombreComponente}
                          {item.cantidad > 1 && (
                            <span style={{ color: 'var(--color-text-soft)' }}> ×{item.cantidad}</span>
                          )}
                        </p>
                        <p style={{ color: 'var(--color-text-soft)' }}>
                          {item.lenguajeNombre} · {item.tecnologiaNombre}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                          {formatMinutes(item.tiempoBaseMin)}
                        </p>
                        <p style={{ color: 'var(--color-accent-purple)' }}>
                          {formatMinutes(item.tiempoCopilotMin)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Button variant="secondary" size="sm" onClick={limpiar}>
                Nueva estimación
              </Button>
            </>
          ) : (
            <Card>
              <div className="py-16 text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: 'rgba(0,66,84,0.08)' }}>
                  ⊞
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  Sin resultados aún
                </p>
                <p className="text-xs max-w-[180px]" style={{ color: 'var(--color-text-soft)' }}>
                  Agrega componentes y pulsa &quot;Calcular y guardar&quot;
                </p>
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  )
}
