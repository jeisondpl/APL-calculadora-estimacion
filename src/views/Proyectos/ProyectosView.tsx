'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useProyectosController } from '@/modules/proyectos'
import { PageHeader, Card, Button, ConfirmDialog } from '@/shared/components/ui'
import { formatMinutes } from '@/shared/lib/utils'
import type { IResponseProyectoSummary } from '@/modules/proyectos'

export function ProyectosView() {
  const { paginado, loading, error, _list, _delete } = useProyectosController()
  const [page,         setPage]         = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<IResponseProyectoSummary | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const LIMIT = 10

  useEffect(() => { _list(page, LIMIT) }, [_list, page])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await _delete(deleteTarget.id, page)
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Proyectos de estimación"
        subtitle={`${paginado?.total ?? 0} proyectos guardados`}
        action={
          <Link href="/proyectos/nuevo">
            <Button variant="primary">+ Nuevo proyecto</Button>
          </Link>
        }
      />

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg mb-4"
          style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
          {error}
        </p>
      )}

      {loading && !paginado ? (
        <div className="flex justify-center py-20">
          <span className="w-6 h-6 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !paginado || paginado.items.length === 0 ? (
        <Card>
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: 'rgba(0,66,84,0.08)' }}>⊞</div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              Sin proyectos estimados
            </p>
            <p className="text-xs max-w-[200px]" style={{ color: 'var(--color-text-soft)' }}>
              Crea el primer proyecto con actividades y componentes
            </p>
            <Link href="/proyectos/nuevo">
              <Button variant="primary" size="sm" className="mt-1">Crear proyecto</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <Card padding="none">
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {paginado.items.map(item => (
                <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[rgba(0,66,84,0.04)] transition-colors group">

                  <Link href={`/proyectos/${item.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                    {/* ID badge */}
                    <div className="shrink-0 w-16 text-center">
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded"
                        style={{ backgroundColor: 'rgba(0,66,84,0.08)', color: 'var(--color-petroleum)' }}>
                        {item.requerimiento}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                        {item.nombreProyecto}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-soft)' }}>
                        {item.objetivo ?? 'Sin objetivo'}
                      </p>
                      <div className="flex gap-3 mt-1 text-xs" style={{ color: 'var(--color-text-soft)' }}>
                        {item.estimadoPor   && <span>Estimado: {item.estimadoPor}</span>}
                        {item.supervisadoPor && <span>Supervisado: {item.supervisadoPor}</span>}
                        <span>{item.actividadesCount} actividades</span>
                        {item.fechaEstimacion && (
                          <span>{new Date(item.fechaEstimacion).toLocaleDateString('es-ES')}</span>
                        )}
                      </div>
                    </div>

                    {/* KPIs */}
                    <div className="hidden lg:flex items-center gap-6 shrink-0">
                      {[
                        { label: 'Base',    value: formatMinutes(item.totalBaseMin),    color: 'var(--color-text)' },
                        { label: 'Copilot', value: formatMinutes(item.totalCopilotMin), color: 'var(--color-accent-purple)' },
                        { label: 'TME',     value: formatMinutes(item.totalTmeMin),     color: 'var(--color-accent-orange)' },
                      ].map(k => (
                        <div key={k.label} className="text-right">
                          <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{k.label}</p>
                          <p className="text-sm font-semibold" style={{ color: k.color }}>{k.value}</p>
                        </div>
                      ))}
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--color-text-soft)' }}>›</span>
                  </Link>

                  {/* Acciones hover */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Link href={`/proyectos/${item.id}/editar`}>
                      <button className="text-xs px-1.5 py-1 rounded hover:bg-[rgba(0,66,84,0.08)]"
                        style={{ color: 'var(--color-text-soft)' }} title="Editar">✎</button>
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="text-xs px-1.5 py-1 rounded hover:bg-[rgba(192,57,43,0.08)]"
                      style={{ color: '#C0392B' }} title="Eliminar"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {paginado.total > LIMIT && (
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, paginado.total)} de {paginado.total}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 1 || loading}
                  onClick={() => setPage(p => p - 1)}>← Anterior</Button>
                <Button size="sm" variant="secondary" disabled={page * LIMIT >= paginado.total || loading}
                  onClick={() => setPage(p => p + 1)}>Siguiente →</Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar proyecto"
        description={`¿Eliminar "${deleteTarget?.nombreProyecto}"? Se eliminarán todas sus actividades y componentes asociados.`}
      />
    </div>
  )
}
