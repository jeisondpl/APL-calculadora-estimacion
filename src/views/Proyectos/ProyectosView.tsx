'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { useProyectosController } from '@/modules/proyectos'
import { PageHeader, Card, Button, ConfirmDialog } from '@/shared/components/ui'
import { formatMinutes } from '@/shared/lib/utils'
import type { IResponseProyectoSummary } from '@/modules/proyectos'

export function ProyectosView() {
  const { paginado, loading, error, _list, _delete } = useProyectosController()
  const { data: session } = useSession()
  const rol     = (session?.user as unknown as { rol?: string })?.rol ?? ''
  const canEdit = rol === 'SUPERUSUARIO' || rol === 'PRODUCT_OWNER'
  const [page,          setPage]          = useState(1)
  const [search,        setSearch]        = useState('')
  const [filterEstado,  setFilterEstado]  = useState<'todos' | 'ABIERTO' | 'CERRADO'>('todos')
  const [refreshing,    setRefreshing]    = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<IResponseProyectoSummary | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [togglingId,   setTogglingId]   = useState<number | null>(null)
  const LIMIT = 10

  useEffect(() => { _list(page, LIMIT) }, [_list, page])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await _delete(deleteTarget.id, page)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const filteredItems = useMemo(() => {
    if (!paginado?.items) return []
    const q = search.trim().toLowerCase()
    return paginado.items.filter(i => {
      if (q && !i.requerimiento.toLowerCase().includes(q) && !i.nombreProyecto.toLowerCase().includes(q)) return false
      if (filterEstado !== 'todos' && i.estado !== filterEstado) return false
      return true
    })
  }, [paginado?.items, search, filterEstado])

  const handleToggleEstado = async (item: IResponseProyectoSummary) => {
    setTogglingId(item.id)
    const nuevoEstado = item.estado === 'ABIERTO' ? 'CERRADO' : 'ABIERTO'
    await axios.patch(`/api/proyectos/${item.id}/estado`, { estado: nuevoEstado })
    await _list(page, LIMIT)
    setTogglingId(null)
  }

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Proyectos de estimación"
        subtitle={`${paginado?.total ?? 0} proyectos guardados`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={async () => { setRefreshing(true); await _list(page, LIMIT); setRefreshing(false) }}
              disabled={refreshing}
              title="Recargar lista"
              className="p-2 rounded-lg border transition-colors hover:bg-[rgba(0,66,84,0.06)] disabled:opacity-40"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-petroleum)' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1 0 4.582 9H4" />
              </svg>
            </button>
            {canEdit && (
              <Link href="/proyectos/nuevo">
                <Button variant="primary">+ Nuevo proyecto</Button>
              </Link>
            )}
          </div>
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
            {canEdit && (
              <Link href="/proyectos/nuevo">
                <Button variant="primary" size="sm" className="mt-1">Crear proyecto</Button>
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-56 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--color-text-soft)' }}
              xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por requerimiento o nombre…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border outline-none"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100"
                style={{ color: 'var(--color-text)' }}
              >✕</button>
            )}
          </div>

          {/* Select estado */}
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value as typeof filterEstado)}
            className="px-3 py-2.5 text-sm rounded-xl border outline-none"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
          >
            <option value="todos">Todos los estados</option>
            <option value="ABIERTO">Abiertos</option>
            <option value="CERRADO">Cerrados</option>
          </select>

          </div>{/* fin flex filtros */}

          <Card padding="none">
            <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center text-sm" style={{ color: 'var(--color-text-soft)' }}>
                  Sin resultados con los filtros aplicados.
                </div>
              ) : filteredItems.map(item => (
                <div key={item.id} className={`flex items-center gap-4 px-5 py-4 transition-colors group ${item.estado === 'CERRADO' ? 'opacity-70' : 'hover:bg-[rgba(0,66,84,0.04)]'}`}>

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
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                          {item.nombreProyecto}
                        </p>
                        {item.estado === 'CERRADO' ? (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                            CERRADO
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                            ABIERTO
                          </span>
                        )}
                      </div>
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
                        { label: 'TIGO',     value: formatMinutes(item.totalTmeMin),     color: 'var(--color-accent-orange)' },
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
                    {/* Editar (todos con proyecto abierto, o canEdit) → ojo solo lectura para DEV/QA con proyecto CERRADO */}
                    {canEdit || item.estado === 'ABIERTO' ? (
                      <Link href={`/proyectos/${item.id}/editar`}>
                        <button className="text-xs px-1.5 py-1 rounded hover:bg-[rgba(0,66,84,0.08)]"
                          style={{ color: 'var(--color-text-soft)' }} title="Editar">✎</button>
                      </Link>
                    ) : (
                      <Link href={`/proyectos/${item.id}`}>
                        <button
                          className="text-xs px-1.5 py-1 rounded hover:bg-[rgba(0,66,84,0.08)]"
                          style={{ color: 'var(--color-text-soft)' }}
                          title="Ver detalle (solo lectura)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </Link>
                    )}

                    {/* Cerrar / Abrir — solo SUPERUSUARIO y PRODUCT_OWNER */}
                    {canEdit && (
                      <button
                        onClick={() => handleToggleEstado(item)}
                        disabled={togglingId === item.id}
                        title={item.estado === 'ABIERTO' ? 'Cerrar proyecto' : 'Reabrir proyecto'}
                        className="text-xs px-1.5 py-1 rounded transition-colors hover:bg-[rgba(0,66,84,0.08)] disabled:opacity-40"
                        style={{ color: item.estado === 'ABIERTO' ? '#f59e0b' : '#10b981' }}
                      >
                        {togglingId === item.id
                          ? '…'
                          : item.estado === 'CERRADO' ? '🔒' : '🔓'}
                      </button>
                    )}

                    {/* Eliminar — solo SUPERUSUARIO y PRODUCT_OWNER */}
                    {canEdit && (
                      <button
                        onClick={() => setDeleteTarget(item)}
                        className="text-xs px-1.5 py-1 rounded hover:bg-[rgba(192,57,43,0.08)]"
                        style={{ color: '#C0392B' }} title="Eliminar"
                      >✕</button>
                    )}
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
