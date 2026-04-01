'use client'

import { useEffect, useState } from 'react'
import { useCatalogosController } from '@/modules/catalogos'
import { PageHeader, Card, CardHeader, Button, ConfirmDialog } from '@/shared/components/ui'
import type { ICatalogo, TipoCatalogo } from '@/modules/catalogos'

// ─── Inline input para agregar / editar ──────────────────────────────────────

function InlineInput({
  initial = '',
  onSave,
  onCancel,
  placeholder,
}: {
  initial?: string
  onSave: (v: string) => Promise<void>
  onCancel: () => void
  placeholder?: string
}) {
  const [value, setValue] = useState(initial)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!value.trim()) return
    setSaving(true)
    await onSave(value.trim())
    setSaving(false)
  }

  return (
    <div className="flex items-center gap-1.5 mt-2">
      <input
        autoFocus
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') onCancel() }}
        placeholder={placeholder}
        className="flex-1 px-2 py-1 text-sm rounded-lg border outline-none"
        style={{
          borderColor: 'var(--color-petroleum)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
        }}
      />
      <Button size="sm" variant="primary" loading={saving} onClick={save}>
        {initial ? 'Guardar' : 'Agregar'}
      </Button>
      <Button size="sm" variant="secondary" onClick={onCancel} disabled={saving}>
        ✕
      </Button>
    </div>
  )
}

// ─── Sección individual de catálogo ──────────────────────────────────────────

const SECTION_META: Record<TipoCatalogo, { label: string; placeholder: string }> = {
  lenguajes:   { label: 'Lenguajes',           placeholder: 'ej: TypeScript' },
  tecnologias: { label: 'Tecnologías',          placeholder: 'ej: Next.js' },
  grupos:      { label: 'Grupos funcionales',   placeholder: 'ej: Base-Front' },
  tipos:       { label: 'Tipos de componente',  placeholder: 'ej: Pantalla' },
}

function CatalogoSection({
  tipo,
  items,
  onCreate,
  onUpdate,
  onDelete,
}: {
  tipo:     TipoCatalogo
  items:    ICatalogo[]
  onCreate: (nombre: string) => Promise<boolean>
  onUpdate: (id: number, nombre: string) => Promise<boolean>
  onDelete: (id: number) => Promise<boolean>
}) {
  const { label, placeholder } = SECTION_META[tipo]
  const [adding,      setAdding]      = useState(false)
  const [editingId,   setEditingId]   = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ICatalogo | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleCreate = async (nombre: string) => {
    const ok = await onCreate(nombre)
    if (ok) setAdding(false)
  }

  const handleUpdate = async (id: number, nombre: string) => {
    const ok = await onUpdate(id, nombre)
    if (ok) setEditingId(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionLoading(true)
    await onDelete(deleteTarget.id)
    setActionLoading(false)
    setDeleteTarget(null)
  }

  return (
    <>
      <Card>
        <CardHeader
          title={label}
          subtitle={`${items.length} entradas`}
          action={
            <Button size="sm" variant="secondary" onClick={() => { setAdding(true); setEditingId(null) }}>
              + Nuevo
            </Button>
          }
        />

        <div className="space-y-1">
          {items.map(item => (
            <div key={item.id}>
              {editingId === item.id ? (
                <InlineInput
                  initial={item.nombre}
                  placeholder={placeholder}
                  onSave={nombre => handleUpdate(item.id, nombre)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div
                  className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(0,66,84,0.04)] group transition-colors"
                >
                  <span className="text-sm" style={{ color: 'var(--color-text)' }}>
                    {item.nombre}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(item.id); setAdding(false) }}
                      className="text-xs px-1.5 py-0.5 rounded hover:bg-[rgba(0,66,84,0.08)] transition-colors"
                      style={{ color: 'var(--color-text-soft)' }}
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="text-xs px-1.5 py-0.5 rounded hover:bg-[rgba(192,57,43,0.08)] transition-colors"
                      style={{ color: '#C0392B' }}
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && !adding && (
            <p className="text-sm py-2" style={{ color: 'var(--color-text-soft)' }}>
              Sin entradas. Agrega la primera.
            </p>
          )}

          {adding && (
            <InlineInput
              placeholder={placeholder}
              onSave={handleCreate}
              onCancel={() => setAdding(false)}
            />
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={actionLoading}
        title={`Eliminar de ${label}`}
        description={`¿Eliminar "${deleteTarget?.nombre}"? Solo es posible si ningún componente lo usa.`}
      />
    </>
  )
}

// ─── Vista principal ──────────────────────────────────────────────────────────

const TIPOS: TipoCatalogo[] = ['grupos', 'tipos', 'lenguajes', 'tecnologias']

export function CatalogosView() {
  const { catalogos, loading, error, _loadAll, _create, _update, _delete } =
    useCatalogosController()

  useEffect(() => { _loadAll() }, [_loadAll])

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Catálogos"
        subtitle="Valores de referencia usados en el catálogo de componentes"
      />

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg mb-4"
          style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}>
          {error}
        </p>
      )}

      {loading && !catalogos.grupos.length ? (
        <div className="flex justify-center py-20">
          <span className="w-6 h-6 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TIPOS.map(tipo => (
            <CatalogoSection
              key={tipo}
              tipo={tipo}
              items={catalogos[tipo]}
              onCreate={nombre => _create(tipo, nombre)}
              onUpdate={(id, nombre) => _update(tipo, id, nombre)}
              onDelete={id => _delete(tipo, id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
