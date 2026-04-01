'use client'

import { Select } from '@/shared/components/ui'
import { Input } from '@/shared/components/ui'
import type { IArgsListComponentes } from '../../domain/entities/Componentes.entities'

interface Props {
  filtros: IArgsListComponentes
  options: {
    grupos:      { value: number; label: string }[]
    tipos:       { value: number; label: string }[]
    lenguajes:   { value: number; label: string }[]
    tecnologias: { value: number; label: string }[]
  }
  onChange: (filtros: IArgsListComponentes) => void
}

export function ComponentesFilters({ filtros, options, onChange }: Props) {
  const set = (key: keyof IArgsListComponentes, val: string) =>
    onChange({ ...filtros, [key]: val ? Number(val) : undefined, page: 1 })

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4">
      <div className="lg:col-span-2">
        <Input
          placeholder="Buscar componente..."
          value={filtros.search ?? ''}
          onChange={e => onChange({ ...filtros, search: e.target.value || undefined, page: 1 })}
        />
      </div>
      <Select
        placeholder="Todos los grupos"
        options={options.grupos.map(o => ({ ...o, value: String(o.value) }))}
        value={filtros.grupoId ? String(filtros.grupoId) : ''}
        onChange={e => set('grupoId', e.target.value)}
      />
      <Select
        placeholder="Todos los lenguajes"
        options={options.lenguajes.map(o => ({ ...o, value: String(o.value) }))}
        value={filtros.lenguajeId ? String(filtros.lenguajeId) : ''}
        onChange={e => set('lenguajeId', e.target.value)}
      />
      <Select
        placeholder="Todas las tecnologías"
        options={options.tecnologias.map(o => ({ ...o, value: String(o.value) }))}
        value={filtros.tecnologiaId ? String(filtros.tecnologiaId) : ''}
        onChange={e => set('tecnologiaId', e.target.value)}
      />
    </div>
  )
}
