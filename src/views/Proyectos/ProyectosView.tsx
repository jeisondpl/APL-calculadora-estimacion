'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import axios, { isAxiosError } from 'axios'
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
  const [toggleErr,    setToggleErr]    = useState<string | null>(null)

  // Modal asignar desarrolladores al cerrar
  interface UsuarioOpt { id: number; nombre: string; rol: { nombre: string } }
  interface ActAsig   { id: number; nombre: string; bloque: string | null; jornadas: number | null; asignadoAId: number | null; fechaInicio?: string | null; fechaFin?: string | null }
  interface ValidarCierreResp { puedesCerrar: boolean; sinPlanificar: ActAsig[] }

  const [devModal,    setDevModal]    = useState<IResponseProyectoSummary | null>(null)
  const [devStep,     setDevStep]     = useState<1 | 2>(1)
  const [devPool,     setDevPool]     = useState<UsuarioOpt[]>([])
  const [devSelected, setDevSelected] = useState<Set<number>>(new Set())
  const [devQuery,    setDevQuery]    = useState('')
  const [devSaving,   setDevSaving]   = useState(false)
  const [devSaveErr,  setDevSaveErr]  = useState<string | null>(null)
  const [actAsig,     setActAsig]     = useState<ActAsig[]>([])

  // Modal de alerta: planificación incompleta
  const [planAlert, setPlanAlert] = useState<{
    proyecto:      IResponseProyectoSummary
    sinPlanificar: ActAsig[]
  } | null>(null)

  const filteredDevPool = devPool.filter(u =>
    !devQuery.trim() || u.nombre.toLowerCase().includes(devQuery.toLowerCase())
  )

  const selectedDevs = devPool.filter(u => devSelected.has(u.id))

  const openDevModal = async (item: IResponseProyectoSummary) => {
    // 1. Validar planificación completa mediante endpoint dedicado
    const validarRes = await axios.get<{ error: boolean; response: ValidarCierreResp }>(
      `/api/proyectos/${item.id}/validar-cierre`
    )
    const validar = validarRes.data.response

    if (!validar.puedesCerrar) {
      setPlanAlert({ proyecto: item, sinPlanificar: validar.sinPlanificar })
      return
    }

    // 2. Si pasa la validación, cargar usuarios y actividades en paralelo
    const [usersRes, proyRes] = await Promise.all([
      axios.get<UsuarioOpt[]>('/api/usuarios/por-rol?roles=DESARROLLADOR,QA'),
      axios.get<{ error: boolean; response: { actividades: ActAsig[] } }>(`/api/proyectos/${item.id}`),
    ])

    const actividades: ActAsig[] = proyRes.data.response?.actividades ?? []

    const sorted = [...usersRes.data].sort((a, b) =>
      a.rol.nombre.localeCompare(b.rol.nombre) || a.nombre.localeCompare(b.nombre)
    )
    setDevPool(sorted)
    const existingIds = new Set((item.estimadores ?? []).map((e: { id: number }) => e.id))
    setDevSelected(existingIds)
    setDevQuery('')
    setDevStep(1)
    setDevSaveErr(null)
    setActAsig(
      actividades.map(a => ({
        id:          a.id,
        nombre:      a.nombre,
        bloque:      a.bloque,
        jornadas:    a.jornadas,
        asignadoAId: a.asignadoAId,
      }))
    )
    setDevModal(item)
  }

  const confirmDevModal = async () => {
    if (!devModal) return
    setDevSaving(true)
    setDevSaveErr(null)
    try {
      await axios.patch(`/api/proyectos/${devModal.id}/estado`, {
        estado:           'CERRADO',
        desarrolladorIds: Array.from(devSelected),
        asignaciones:     actAsig.map(a => ({ actividadId: a.id, usuarioId: a.asignadoAId })),
      })
      await _list(page, LIMIT)
      setDevModal(null)
    } catch (err: unknown) {
      const apiMsg = isAxiosError(err) ? (err.response?.data as { msg?: string })?.msg : undefined
      setDevSaveErr(apiMsg ?? (err instanceof Error ? err.message : 'No se pudo cerrar el proyecto'))
    } finally {
      setDevSaving(false)
    }
  }

  // Asignar todo un bloque a un desarrollador
  const asignarBloque = (bloque: string | null, usuarioId: number | null) => {
    setActAsig(prev => prev.map(a => a.bloque === bloque ? { ...a, asignadoAId: usuarioId } : a))
  }

  // Bloques únicos de las actividades
  const bloquesUnicos = useMemo(
    () => [...new Set(actAsig.map(a => a.bloque))],
    [actAsig]
  )

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
    setToggleErr(null)
    if (item.estado === 'ABIERTO') {
      // Cerrar → validar planificación y mostrar modal
      setTogglingId(item.id)
      try {
        await openDevModal(item)
      } catch (err: unknown) {
        const apiMsg = isAxiosError(err) ? (err.response?.data as { msg?: string })?.msg : undefined
        setToggleErr(apiMsg ?? (err instanceof Error ? err.message : 'Error al validar el proyecto'))
      } finally {
        setTogglingId(null)
      }
      return
    }
    // Reabrir → directo sin modal
    setTogglingId(item.id)
    try {
      await axios.patch(`/api/proyectos/${item.id}/estado`, { estado: 'ABIERTO' })
      await _list(page, LIMIT)
    } finally {
      setTogglingId(null)
    }
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

      {toggleErr && (
        <p className="text-sm px-3 py-2 rounded-lg mb-4 flex items-center justify-between"
          style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
          <span>{toggleErr}</span>
          <button onClick={() => setToggleErr(null)} className="ml-3 opacity-60 hover:opacity-100 text-base leading-none">✕</button>
        </p>
      )}

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
                    <div className="shrink-0 w-26 text-center">
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
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {/* Estimadores como chips */}
                        {(item.estimadores ?? []).map(e => (
                          <span
                            key={e.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium leading-none"
                            style={{ backgroundColor: 'rgba(0,66,84,0.09)', color: 'var(--color-petroleum)' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {e.nombre}
                          </span>
                        ))}

                        {/* Separador si hay ambos */}
                        {(item.estimadores ?? []).length > 0 && item.supervisadoPor && (
                          <span className="w-px h-3 mx-0.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />
                        )}

                        {/* Supervisor */}
                        {item.supervisadoPor && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium leading-none"
                            style={{ backgroundColor: 'rgba(37,99,235,0.08)', color: '#2563EB' }}
                          >
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 1L3 5v6c0 5.25 3.75 10.15 9 11.35C17.25 21.15 21 16.25 21 11V5L12 1zm-1 14l-3-3 1.41-1.41L11 12.17l5.59-5.58L18 8l-7 7z"/>
                            </svg>
                            {item.supervisadoPor}
                          </span>
                        )}

                        {/* Separador */}
                        <span className="w-px h-3 mx-0.5 rounded-full" style={{ backgroundColor: 'var(--color-border)' }} />

                        {/* Actividades y fecha */}
                        <span className="text-[10px]" style={{ color: 'var(--color-text-soft)' }}>
                          {item.actividadesCount} actividades
                        </span>
                        {item.fechaEstimacion && (
                          <>
                            <span className="text-[10px]" style={{ color: 'var(--color-border)' }}>·</span>
                            <span className="text-[10px]" style={{ color: 'var(--color-text-soft)' }}>
                              {new Date(item.fechaEstimacion).toLocaleDateString('es-ES')}
                            </span>
                          </>
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

      {/* Modal: planificación incompleta */}
      {planAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onMouseDown={e => { if (e.target === e.currentTarget) setPlanAlert(null) }}>
          <div className="w-full max-w-lg rounded-xl shadow-2xl flex flex-col"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', maxHeight: '80vh' }}>

            {/* Cabecera — rojo/warning */}
            <div className="px-5 py-4 rounded-t-xl flex items-start gap-3 shrink-0"
              style={{ backgroundColor: 'rgba(192,57,43,0.08)', borderBottom: '1px solid rgba(192,57,43,0.15)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg"
                style={{ backgroundColor: 'rgba(192,57,43,0.12)', color: '#C0392B' }}>
                ⚠
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold" style={{ color: '#C0392B' }}>
                  No se puede cerrar el proyecto
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-soft)' }}>
                  La planificación está incompleta. {planAlert.sinPlanificar.length} actividad{planAlert.sinPlanificar.length !== 1 ? 'es' : ''} sin fechas de inicio y fin.
                </p>
              </div>
              <button onClick={() => setPlanAlert(null)} className="text-lg leading-none opacity-50 hover:opacity-100"
                style={{ color: 'var(--color-text)' }}>✕</button>
            </div>

            {/* Lista de actividades incompletas */}
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-soft)' }}>
                Actividades sin planificar
              </p>
              <div className="space-y-2">
                {planAlert.sinPlanificar.map((a, idx) => (
                  <div key={a.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
                    style={{ borderColor: 'rgba(192,57,43,0.2)', backgroundColor: 'rgba(192,57,43,0.04)' }}>
                    <span className="text-xs font-mono w-5 shrink-0 text-center"
                      style={{ color: 'var(--color-text-soft)' }}>{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{a.nombre}</p>
                      <div className="flex gap-3 mt-0.5">
                        {a.bloque && (
                          <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{a.bloque}</span>
                        )}
                        {a.jornadas != null && (
                          <span className="text-xs font-medium" style={{ color: 'var(--color-petroleum)' }}>
                            {a.jornadas}j
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-1.5 text-xs">
                      <span className="px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: a.fechaInicio ? 'rgba(16,185,129,0.1)' : 'rgba(192,57,43,0.1)', color: a.fechaInicio ? '#10b981' : '#C0392B' }}>
                        {a.fechaInicio ? 'Inicio ✓' : 'Sin inicio'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: a.fechaFin ? 'rgba(16,185,129,0.1)' : 'rgba(192,57,43,0.1)', color: a.fechaFin ? '#10b981' : '#C0392B' }}>
                        {a.fechaFin ? 'Fin ✓' : 'Sin fin'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t flex items-center justify-between shrink-0"
              style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                Completa las fechas en la vista de Planificación
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPlanAlert(null)}>
                  Cancelar
                </Button>
                <Link href={`/proyectos/${planAlert.proyecto.id}/planificar`}>
                  <Button variant="primary" size="sm" onClick={() => setPlanAlert(null)}>
                    Ir a Planificar →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal asignar desarrolladores — 2 pasos */}
      {devModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onMouseDown={e => { if (e.target === e.currentTarget) setDevModal(null) }}>
          <div className="w-full rounded-xl shadow-2xl flex flex-col"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', maxHeight: '88vh', maxWidth: devStep === 1 ? 520 : 760 }}>

            {/* Cabecera */}
            <div className="px-5 py-4 flex items-center justify-between rounded-t-xl shrink-0" style={{ backgroundColor: 'var(--color-petroleum)' }}>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {devStep === 1 ? 'Asignar desarrolladores' : 'Asignar actividades'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {devStep === 1
                    ? `${devPool.length} disponibles · ${devSelected.size} seleccionado${devSelected.size !== 1 ? 's' : ''}`
                    : `${actAsig.length} actividades · ${actAsig.filter(a => a.asignadoAId).length} asignadas`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Indicador de paso */}
                <div className="flex gap-1.5">
                  {([1, 2] as const).map(s => (
                    <div key={s} className="w-2 h-2 rounded-full" style={{ backgroundColor: devStep === s ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                  ))}
                </div>
                <button onClick={() => setDevModal(null)} className="text-white opacity-70 hover:opacity-100 text-lg leading-none">✕</button>
              </div>
            </div>

            {/* ── PASO 1: Selección de desarrolladores ─────────────────────── */}
            {devStep === 1 && (
              <>
                <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <input autoFocus value={devQuery} onChange={e => setDevQuery(e.target.value)}
                    placeholder="Buscar por nombre…"
                    className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                    style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }} />
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredDevPool.length === 0 ? (
                    <p className="text-sm py-8 text-center" style={{ color: 'var(--color-text-soft)' }}>No hay desarrolladores disponibles</p>
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
                        {filteredDevPool.map(u => (
                          <tr key={u.id} className="cursor-pointer hover:bg-[rgba(0,66,84,0.04)] transition-colors"
                            onClick={() => setDevSelected(prev => { const n = new Set(prev); n.has(u.id) ? n.delete(u.id) : n.add(u.id); return n })}>
                            <td className="px-4 py-2.5 text-center">
                              <input type="checkbox" readOnly checked={devSelected.has(u.id)} className="w-4 h-4 accent-[var(--color-petroleum)]" />
                            </td>
                            <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--color-text)' }}>{u.nombre}</td>
                            <td className="px-3 py-2.5">
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: u.rol.nombre === 'QA' ? 'rgba(16,185,129,0.1)' : 'rgba(0,66,84,0.1)',
                                  color:           u.rol.nombre === 'QA' ? '#10b981' : 'var(--color-petroleum)',
                                }}>
                                {u.rol.nombre}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="px-5 py-3 border-t flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
                    {devSelected.size === 0 ? 'Ninguno seleccionado' : `${devSelected.size} seleccionado${devSelected.size !== 1 ? 's' : ''}`}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setDevModal(null)}>Cancelar</Button>
                    <Button variant="primary" size="sm" disabled={devSelected.size === 0} onClick={() => setDevStep(2)}>
                      Siguiente →
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* ── PASO 2: Asignación de actividades ────────────────────────── */}
            {devStep === 2 && (
              <>
                {/* Atajos por bloque */}
                {bloquesUnicos.length > 0 && (
                  <div className="px-4 py-3 border-b flex flex-wrap gap-2 shrink-0" style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(0,66,84,0.03)' }}>
                    <span className="text-xs font-medium self-center mr-1" style={{ color: 'var(--color-text-soft)' }}>Asignar bloque:</span>
                    {bloquesUnicos.map(bloque => (
                      <div key={bloque ?? '__null__'} className="flex items-center gap-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--color-petroleum)' }}>
                          {bloque ?? 'Sin bloque'}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>→</span>
                        <select
                          className="text-xs px-2 py-1 rounded border outline-none"
                          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                          defaultValue=""
                          onChange={e => {
                            const val = e.target.value ? parseInt(e.target.value) : null
                            asignarBloque(bloque, val)
                            e.target.value = ''
                          }}
                        >
                          <option value="">Seleccionar…</option>
                          <option value="">— Sin asignar</option>
                          {selectedDevs.map(u => (
                            <option key={u.id} value={u.id}>{u.nombre}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tabla de actividades */}
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0">
                      <tr style={{ backgroundColor: 'rgba(0,66,84,0.06)', borderBottom: '1px solid var(--color-border)' }}>
                        <th className="px-3 py-2 text-left font-medium w-6" style={{ color: 'var(--color-text-soft)' }}>#</th>
                        <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-soft)' }}>Actividad</th>
                        <th className="px-3 py-2 text-left font-medium w-28 hidden sm:table-cell" style={{ color: 'var(--color-text-soft)' }}>Bloque</th>
                        <th className="px-3 py-2 text-center font-medium w-20 hidden sm:table-cell" style={{ color: 'var(--color-text-soft)' }}>Jornadas</th>
                        <th className="px-3 py-2 text-left font-medium w-44" style={{ color: 'var(--color-text-soft)' }}>Asignar a</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                      {actAsig.map((act, idx) => (
                        <tr key={act.id} className="hover:bg-[rgba(0,66,84,0.03)] transition-colors">
                          <td className="px-3 py-2 text-xs" style={{ color: 'var(--color-text-soft)' }}>{idx + 1}</td>
                          <td className="px-3 py-2 font-medium" style={{ color: 'var(--color-text)' }}>{act.nombre}</td>
                          <td className="px-3 py-2 hidden sm:table-cell text-xs" style={{ color: 'var(--color-text-soft)' }}>
                            {act.bloque || '—'}
                          </td>
                          <td className="px-3 py-2 text-center hidden sm:table-cell">
                            {act.jornadas && act.jornadas > 0 ? (
                              <span className="text-xs font-semibold" style={{ color: 'var(--color-petroleum)' }}>{act.jornadas}</span>
                            ) : (
                              <span className="text-xs" style={{ color: '#d97706' }}>⚠</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <select
                              className="w-full text-xs px-2 py-1.5 rounded border outline-none"
                              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text)' }}
                              value={act.asignadoAId ?? ''}
                              onChange={e => {
                                const val = e.target.value ? parseInt(e.target.value) : null
                                setActAsig(prev => prev.map(a => a.id === act.id ? { ...a, asignadoAId: val } : a))
                              }}
                            >
                              <option value="">— Sin asignar</option>
                              {selectedDevs.map(u => (
                                <option key={u.id} value={u.id}>{u.nombre}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-3 border-t flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={() => setDevStep(1)}>← Volver</Button>
                    {devSaveErr && (
                      <p className="text-xs" style={{ color: '#C0392B' }}>{devSaveErr}</p>
                    )}
                  </div>
                  <Button variant="primary" size="sm" loading={devSaving}
                    onClick={() => confirmDevModal().catch((err: unknown) => {
                      const msg = isAxiosError(err)
                        ? (err.response?.data as { msg?: string })?.msg ?? err.message
                        : (err instanceof Error ? err.message : 'No se pudo cerrar el proyecto')
                      setDevSaveErr(msg)
                    })}>
                    Cerrar y asignar
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
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
