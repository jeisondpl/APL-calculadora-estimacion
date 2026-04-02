'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useComponentesController } from '@/modules/componentes'
import { useCatalogosController } from '@/modules/catalogos'
import { useEstimacionStore } from '@/modules/estimacion'
import Link from 'next/link'
import {
  PageHeader, Badge, Button, SummaryCard,
  Table, Modal, ConfirmDialog,
} from '@/shared/components/ui'
import type { TableColumn } from '@/shared/components/ui'
import { ComponentesFilters } from '@/modules/componentes/presentation/components/ComponentesFilters'
import { ComponenteForm } from '@/modules/componentes/presentation/components/ComponenteForm'
import { formatMinutes } from '@/shared/lib/utils'
import type {
  IResponseComponente,
  IArgsListComponentes,
} from '@/modules/componentes'
import type { CreateComponenteFormData } from '@/modules/componentes/presentation/schemas/componente.schema'

// ─── Botón agregar a estimación ───────────────────────────────────────────────
function AgregarBtn({ componenteId }: { componenteId: number }) {
  const { agregarComponente, itemsSeleccionados } = useEstimacionStore()
  const cantidad = itemsSeleccionados.find(i => i.componenteId === componenteId)?.cantidad ?? 0
  return (
    <Button
      size="sm"
      variant={cantidad > 0 ? 'secondary' : 'primary'}
      onClick={() => agregarComponente(componenteId)}
    >
      {cantidad > 0 ? `+1 (${cantidad})` : '+ Estimar'}
    </Button>
  )
}

export function ComponentesView() {
  const { paginado, loading, _list, _create, _update, _delete } = useComponentesController()
  const { options, _loadAll }   = useCatalogosController()
  const { itemsSeleccionados }  = useEstimacionStore()
  const [isPending, startTransition] = useTransition()

  const { data: session } = useSession()
  const rol = (session?.user as unknown as { rol?: string })?.rol ?? ''
  const canEdit = rol === 'SUPERUSUARIO' || rol === 'PRODUCT_OWNER'

  const [filtros, setFiltros]         = useState<IArgsListComponentes>({ page: 1, limit: 20 })
  const [modalOpen, setModalOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState<IResponseComponente | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<IResponseComponente | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const reload = useCallback(() => _list(filtros), [filtros, _list])

  useEffect(() => { _loadAll() }, [_loadAll])
  useEffect(() => { _list(filtros) }, [filtros, _list])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCreate = async (data: CreateComponenteFormData) => {
    setActionLoading(true)
    await _create(data)
    setActionLoading(false)
    setModalOpen(false)
    reload()
  }

  const handleUpdate = async (data: CreateComponenteFormData) => {
    if (!editTarget) return
    setActionLoading(true)
    await _update({ id: editTarget.id, ...data })
    setActionLoading(false)
    setEditTarget(null)
    reload()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    await _delete({ id: deleteTarget.id })
    setActionLoading(false)
    setDeleteTarget(null)
    reload()
  }

  const openEdit = (row: IResponseComponente) => setEditTarget(row)
  const openDelete = (row: IResponseComponente) => setDeleteTarget(row)

  // ── Columnas ─────────────────────────────────────────────────────────────────

  const COLUMNS: TableColumn<IResponseComponente>[] = [
    {
      key: 'nombreComponente', header: 'Componente', width: '22%',
      render: r => (
        <span className="font-medium" style={{ color: 'var(--color-text)' }}>
          {r.nombreComponente}
        </span>
      ),
    },
    {
      key: 'grupoNombre', header: 'Grupo', width: '13%',
      render: r => <Badge variant="neutral">{r.grupoNombre}</Badge>,
    },
    { key: 'lenguajeNombre',   header: 'Lenguaje',   width: '9%' },
    { key: 'tecnologiaNombre', header: 'Tecnología',  width: '11%' },
    {
      key: 'totalBaseMin', header: 'Base', width: '9%', align: 'right',
      render: r => formatMinutes(r.totalBaseMin),
    },
    {
      key: 'totalCopilotMin', header: 'Copilot', width: '9%', align: 'right',
      render: r => (
        <span style={{ color: 'var(--color-accent-purple)' }}>
          {formatMinutes(r.totalCopilotMin)}
        </span>
      ),
    },
    {
      key: 'totalTmeMin', header: 'TIGO', width: '9%', align: 'right',
      render: r => (
        <span style={{ color: 'var(--color-accent-orange)' }}>
          {formatMinutes(r.totalTmeMin)}
        </span>
      ),
    },
    {
      key: 'acciones', header: '', width: '18%', align: 'right',
      render: r => (
        <div className="flex items-center justify-end gap-1">
          <AgregarBtn componenteId={r.id} />
          {canEdit && (
            <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>
              ✎
            </Button>
          )}
          {canEdit && (
            <Button
              size="sm" variant="ghost"
              style={{ color: '#C0392B' }}
              onClick={() => openDelete(r)}
            >
              ✕
            </Button>
          )}
        </div>
      ),
    },
  ]

  const totalSeleccionados = itemsSeleccionados.reduce((s, i) => s + i.cantidad, 0)

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Catálogo de Componentes"
        subtitle={`${paginado?.total ?? 0} componentes disponibles`}
        action={
          <div className="flex gap-2">
            {totalSeleccionados > 0 && (
              <Link href="/calculadora">
                <Button variant="secondary" size="sm">
                  Ver estimación ({totalSeleccionados})
                </Button>
              </Link>
            )}
            {canEdit && (
              <Button variant="primary" onClick={() => setModalOpen(true)}>
                + Nuevo componente
              </Button>
            )}
          </div>
        }
      />

      {/* KPIs */}
      {paginado && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Total componentes" value={String(paginado.total)} />
          <SummaryCard label="En selección"      value={String(totalSeleccionados)} accent="green" />
          <SummaryCard label="Grupos"            value={String(options.grupos.length)} accent="purple" />
          <SummaryCard label="Tecnologías"       value={String(options.tecnologias.length)} accent="orange" />
        </div>
      )}

      <ComponentesFilters
        filtros={filtros}
        options={options}
        onChange={f => startTransition(() => setFiltros(f))}
      />

      <Table
        columns={COLUMNS}
        data={paginado?.items ?? []}
        loading={loading || isPending}
        emptyText="No se encontraron componentes con los filtros aplicados"
        keyExtractor={r => r.id}
      />

      {/* Paginación */}
      {paginado && paginado.total > filtros.limit! && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs" style={{ color: 'var(--color-text-soft)' }}>
            {((filtros.page! - 1) * filtros.limit!) + 1}–
            {Math.min(filtros.page! * filtros.limit!, paginado.total)} de {paginado.total}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary"
              disabled={filtros.page === 1}
              onClick={() => setFiltros(f => ({ ...f, page: f.page! - 1 }))}>
              ← Anterior
            </Button>
            <Button size="sm" variant="secondary"
              disabled={filtros.page! * filtros.limit! >= paginado.total}
              onClick={() => setFiltros(f => ({ ...f, page: f.page! + 1 }))}>
              Siguiente →
            </Button>
          </div>
        </div>
      )}

      {/* Modal: crear componente */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo componente"
        subtitle="Completa los datos y agrega las variables de estimación"
        size="lg"
      >
        <ComponenteForm
          options={options}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          loading={actionLoading}
        />
      </Modal>

      {/* Modal: editar componente */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Editar componente"
        subtitle={editTarget?.nombreComponente}
        size="lg"
      >
        {editTarget && (
          <ComponenteForm
            initial={editTarget}
            options={options}
            onSubmit={handleUpdate}
            onCancel={() => setEditTarget(null)}
            loading={actionLoading}
          />
        )}
      </Modal>

      {/* Confirm: eliminar */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title="Eliminar componente"
        description={`¿Eliminar "${deleteTarget?.nombreComponente}"? El componente se desactivará y no aparecerá en el catálogo.`}
      />
    </div>
  )
}
