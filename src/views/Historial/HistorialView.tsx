'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useHistorialController } from '@/modules/estimacion'
import {
  PageHeader, Card, Button, Modal, Badge, ConfirmDialog,
} from '@/shared/components/ui'
import { formatMinutes, downloadFile, estimacionToCsv } from '@/shared/lib/utils'
import type { IResponseEstimacionSummary } from '@/modules/estimacion'

function AhorroLabel({ base, copilot }: { base: number; copilot: number }) {
  const ahorro = base - copilot
  const pct = base > 0 ? Math.round((ahorro / base) * 100) : 0
  return (
    <span className="text-xs" style={{ color: 'var(--color-accent-purple)' }}>
      −{pct}% ({formatMinutes(ahorro)})
    </span>
  )
}

export function HistorialView() {
  const { paginado, detalle, loading, error, _list, _getById, _delete, clearDetalle } =
    useHistorialController()

  const [page,         setPage]         = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<IResponseEstimacionSummary | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const LIMIT = 10

  useEffect(() => { _list(page, LIMIT) }, [_list, page])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    const ok = await _delete(deleteTarget.id, page)
    setDeleting(false)
    if (ok) setDeleteTarget(null)
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Historial de estimaciones"
        subtitle={`${paginado?.total ?? 0} estimaciones guardadas`}
        action={
          <Link href="/calculadora">
            <Button variant="primary" size="sm">+ Nueva estimación</Button>
          </Link>
        }
      />

      {loading && !paginado ? (
        <div className="flex justify-center py-20">
          <span className="w-6 h-6 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm px-3 py-2 rounded-lg"
          style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
          {error}
        </p>
      ) : !paginado || paginado.items.length === 0 ? (
        <Card>
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: 'rgba(0,66,84,0.08)' }}>
              ⊞
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Sin estimaciones guardadas
            </p>
            <p className="text-xs max-w-[200px]" style={{ color: 'var(--color-text-soft)' }}>
              Crea tu primera estimación desde la calculadora
            </p>
            <Link href="/calculadora">
              <Button variant="primary" size="sm" className="mt-1">Ir a la calculadora</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {paginado.items.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[rgba(0,66,84,0.04)] transition-colors group"
                >
                  {/* Clickable area */}
                  <div
                    className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                    onClick={() => _getById(item.id)}
                  >
                    {/* Fecha */}
                    <div className="shrink-0 w-24 text-right">
                      <p className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                        {new Date(item.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                        {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Nombre */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {item.nombre ?? <span style={{ color: 'var(--color-text-soft)', fontStyle: 'italic' }}>Sin nombre</span>}
                      </p>
                      <AhorroLabel base={item.totalBaseMin} copilot={item.totalCopilotMin} />
                    </div>

                    {/* KPIs */}
                    <div className="hidden sm:flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>Base</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                          {formatMinutes(item.totalBaseMin)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>Copilot</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-accent-purple)' }}>
                          {formatMinutes(item.totalCopilotMin)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>TIGO</p>
                        <p className="text-sm font-semibold" style={{ color: 'var(--color-accent-orange)' }}>
                          {formatMinutes(item.totalTmeMin)}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs shrink-0" style={{ color: 'var(--color-text-soft)' }}>›</span>
                  </div>

                  {/* Botón eliminar — visible on hover */}
                  <button
                    onClick={e => { e.stopPropagation(); setDeleteTarget(item) }}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-1.5 py-1 rounded hover:bg-[rgba(192,57,43,0.08)]"
                    style={{ color: '#C0392B' }}
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Paginación */}
          {paginado.total > LIMIT && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, paginado.total)} de {paginado.total}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary"
                  disabled={page === 1 || loading}
                  onClick={() => setPage(p => p - 1)}>
                  ← Anterior
                </Button>
                <Button size="sm" variant="secondary"
                  disabled={page * LIMIT >= paginado.total || loading}
                  onClick={() => setPage(p => p + 1)}>
                  Siguiente →
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal detalle */}
      <Modal
        open={!!detalle}
        onClose={clearDetalle}
        title={detalle?.nombre ?? 'Estimación sin nombre'}
        subtitle={detalle ? new Date(detalle.createdAt).toLocaleString('es-ES') : ''}
        size="lg"
      >
        {detalle && (
          <div className="space-y-4">
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Tiempo base',  value: formatMinutes(detalle.totalBaseMin),    color: 'var(--color-text)' },
                { label: 'Con Copilot',  value: formatMinutes(detalle.totalCopilotMin), color: 'var(--color-accent-purple)' },
                { label: 'TIGO',          value: formatMinutes(detalle.totalTmeMin),      color: 'var(--color-accent-orange)' },
              ].map(kpi => (
                <div key={kpi.label}
                  className="rounded-lg p-3 text-center"
                  style={{ backgroundColor: 'rgba(227,226,218,0.4)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-text-soft)' }}>{kpi.label}</p>
                  <p className="text-base font-semibold" style={{ color: kpi.color }}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Desglose */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-text-soft)' }}>
                Desglose por componente
              </p>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {detalle.items.map(item => (
                  <div key={item.componenteId}
                    className="flex items-start justify-between gap-2 text-xs py-2 px-3 rounded-lg"
                    style={{ backgroundColor: 'rgba(227,226,218,0.3)' }}>
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--color-text)' }}>
                        {item.nombreComponente}
                        {item.cantidad > 1 && (
                          <span style={{ color: 'var(--color-text-soft)' }}> ×{item.cantidad}</span>
                        )}
                      </p>
                      <div className="flex gap-1.5 mt-0.5 flex-wrap">
                        <Badge variant="neutral">{item.lenguajeNombre}</Badge>
                        <Badge variant="info">{item.tecnologiaNombre}</Badge>
                      </div>
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
            </div>

            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const csv    = estimacionToCsv(detalle)
                  const nombre = detalle.nombre?.replace(/\s+/g, '_') ?? 'estimacion'
                  const fecha  = new Date(detalle.createdAt).toISOString().slice(0, 10)
                  downloadFile(csv, `${nombre}_${fecha}.csv`)
                }}
              >
                ↓ Exportar CSV
              </Button>
              <Button variant="secondary" onClick={clearDetalle}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm: eliminar */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar estimación"
        description={`¿Eliminar "${deleteTarget?.nombre ?? 'esta estimación'}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
