'use client'

import { useState, useCallback } from 'react'
import { ApiComponentesRepository } from '../../infrastructure/apiComponentesRepository'
import { listComponentesUseCase } from '../../application/listComponentes/listComponentes'
import { createComponenteUseCase } from '../../application/createComponente/createComponente'
import { updateComponenteUseCase } from '../../application/updateComponente/updateComponente'
import { deleteComponenteUseCase } from '../../application/deleteComponente/deleteComponente'
import type {
  IArgsListComponentes,
  IArgsCreateComponente,
  IArgsUpdateComponente,
  IArgsDeleteComponente,
  IResponseComponente,
  IResponseComponentesPaginado,
} from '../../domain/entities/Componentes.entities'

export function useComponentesController() {
  const repository = ApiComponentesRepository()

  const [paginado, setPaginado]     = useState<IResponseComponentesPaginado | null>(null)
  const [seleccionado, setSeleccionado] = useState<IResponseComponente | null>(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const _list = useCallback(async (args: IArgsListComponentes = {}) => {
    setLoading(true)
    setError(null)
    try {
      const result = await listComponentesUseCase(repository, args)
      if (result.error) throw new Error(result.msg)
      setPaginado(result.response ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al listar')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _create = useCallback(async (args: IArgsCreateComponente) => {
    setLoading(true)
    setError(null)
    try {
      const result = await createComponenteUseCase(repository, args)
      if (result.error) throw new Error(result.msg)
      return result.response
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear')
      return undefined
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _update = useCallback(async (args: IArgsUpdateComponente) => {
    setLoading(true)
    setError(null)
    try {
      const result = await updateComponenteUseCase(repository, args)
      if (result.error) throw new Error(result.msg)
      return result.response
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al actualizar')
      return undefined
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const _delete = useCallback(async (args: IArgsDeleteComponente) => {
    setLoading(true)
    setError(null)
    try {
      const result = await deleteComponenteUseCase(repository, args)
      if (result.error) throw new Error(result.msg)
      return result.response
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar')
      return undefined
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    paginado,
    seleccionado,
    setSeleccionado,
    loading,
    error,
    _list,
    _create,
    _update,
    _delete,
  }
}
