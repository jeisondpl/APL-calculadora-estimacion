'use client'

import { useState, useCallback } from 'react'
import { ApiCatalogosRepository } from '../../infrastructure/apiCatalogosRepository'
import { createCatalogo } from '../../application/createCatalogo/createCatalogo'
import { updateCatalogo } from '../../application/updateCatalogo/updateCatalogo'
import { deleteCatalogo } from '../../application/deleteCatalogo/deleteCatalogo'
import type {
  ICatalogo,
  TipoCatalogo,
  IResponseCatalogos,
} from '../../domain/entities/Catalogos.entities'

const INITIAL: IResponseCatalogos = {
  lenguajes:   [],
  tecnologias: [],
  grupos:      [],
  tipos:       [],
}

const repo       = ApiCatalogosRepository()
const _createUC  = createCatalogo(repo)
const _updateUC  = updateCatalogo(repo)
const _deleteUC  = deleteCatalogo(repo)

export function useCatalogosController() {
  const [catalogos, setCatalogos] = useState<IResponseCatalogos>(INITIAL)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const _loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [lenguajes, tecnologias, grupos, tipos] = await Promise.all([
        repo.getByTipo('lenguajes'),
        repo.getByTipo('tecnologias'),
        repo.getByTipo('grupos'),
        repo.getByTipo('tipos'),
      ])
      setCatalogos({
        lenguajes:   lenguajes.response   ?? [],
        tecnologias: tecnologias.response ?? [],
        grupos:      grupos.response      ?? [],
        tipos:       tipos.response       ?? [],
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const _create = useCallback(async (tipo: TipoCatalogo, nombre: string) => {
    setError(null)
    const res = await _createUC({ tipo, nombre })
    if (res.error) { setError(res.msg ?? 'Error al crear'); return false }
    await _loadAll()
    return true
  }, [_loadAll])

  const _update = useCallback(async (tipo: TipoCatalogo, id: number, nombre: string) => {
    setError(null)
    const res = await _updateUC({ tipo, id, nombre })
    if (res.error) { setError(res.msg ?? 'Error al actualizar'); return false }
    await _loadAll()
    return true
  }, [_loadAll])

  const _delete = useCallback(async (tipo: TipoCatalogo, id: number) => {
    setError(null)
    const res = await _deleteUC({ tipo, id })
    if (res.error) { setError(res.msg ?? 'Error al eliminar'); return false }
    await _loadAll()
    return true
  }, [_loadAll])

  const toOptions = (items: ICatalogo[]) =>
    items.map(i => ({ value: i.id, label: i.nombre }))

  return {
    catalogos,
    loading,
    error,
    _loadAll,
    _create,
    _update,
    _delete,
    options: {
      lenguajes:   toOptions(catalogos.lenguajes),
      tecnologias: toOptions(catalogos.tecnologias),
      grupos:      toOptions(catalogos.grupos),
      tipos:       toOptions(catalogos.tipos),
    },
  }
}
