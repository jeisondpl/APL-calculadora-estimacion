'use client'

import { useCallback, useState } from 'react'
import { ApiEstimacionRepository } from '../../infrastructure/apiEstimacionRepository'
import { listEstimaciones } from '../../application/listEstimaciones/listEstimaciones'
import { getEstimacion } from '../../application/getEstimacion/getEstimacion'
import type {
  IResponseEstimacionSummary,
  IResponseEstimacion,
  IResponseListEstimaciones,
} from '../../domain/entities/Estimacion.entities'

const repo = ApiEstimacionRepository()
const _listUC   = listEstimaciones(repo)
const _getByIdUC = getEstimacion(repo)

export function useHistorialController() {
  const [paginado, setPaginado]   = useState<IResponseListEstimaciones | null>(null)
  const [detalle,  setDetalle]    = useState<IResponseEstimacion | null>(null)
  const [loading,  setLoading]    = useState(false)
  const [error,    setError]      = useState<string | null>(null)

  const _list = useCallback(
    async (page = 1, limit = 10) => {
      setLoading(true)
      setError(null)
      const res = await _listUC({ page, limit })
      if (!res.error && res.response) setPaginado(res.response)
      else setError(res.msg ?? 'Error al cargar historial')
      setLoading(false)
    },
    []
  )

  const _getById = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    const res = await _getByIdUC(id)
    if (!res.error && res.response) setDetalle(res.response)
    else setError(res.msg ?? 'Error al cargar estimación')
    setLoading(false)
  }, [])

  const clearDetalle = useCallback(() => setDetalle(null), [])

  const _delete = useCallback(async (id: number, currentPage: number) => {
    setLoading(true)
    setError(null)
    const res = await repo.deleteById(id)
    if (res.error) {
      setError(res.msg ?? 'Error al eliminar')
      setLoading(false)
      return false
    }
    setDetalle(null)
    await _list(currentPage)
    return true
  }, [_list])

  return { paginado, detalle, loading, error, _list, _getById, _delete, clearDetalle }
}
