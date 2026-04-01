'use client'

import { useState, useCallback } from 'react'
import { ApiProyectosRepository } from '../../infrastructure/apiProyectosRepository'
import { listProyectos }   from '../../application/listProyectos/listProyectos'
import { getProyecto }     from '../../application/getProyecto/getProyecto'
import { createProyecto }  from '../../application/createProyecto/createProyecto'
import { updateProyecto }  from '../../application/updateProyecto/updateProyecto'
import { deleteProyecto }  from '../../application/deleteProyecto/deleteProyecto'
import type {
  IResponseListProyectos,
  IResponseProyecto,
  IArgsCreateProyecto,
  IArgsUpdateProyecto,
} from '../../domain/entities/Proyectos.entities'

const repo        = ApiProyectosRepository()
const _listUC     = listProyectos(repo)
const _getUC      = getProyecto(repo)
const _createUC   = createProyecto(repo)
const _updateUC   = updateProyecto(repo)
const _deleteUC   = deleteProyecto(repo)

export function useProyectosController() {
  const [paginado,  setPaginado]  = useState<IResponseListProyectos | null>(null)
  const [proyecto,  setProyecto]  = useState<IResponseProyecto | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const _list = useCallback(async (page = 1, limit = 10) => {
    setLoading(true); setError(null)
    const res = await _listUC({ page, limit })
    if (!res.error && res.response) setPaginado(res.response)
    else setError(res.msg ?? 'Error al listar')
    setLoading(false)
  }, [])

  const _getById = useCallback(async (id: number) => {
    setLoading(true); setError(null)
    const res = await _getUC(id)
    if (!res.error && res.response) setProyecto(res.response)
    else setError(res.msg ?? 'Error al cargar proyecto')
    setLoading(false)
    return res.response ?? null
  }, [])

  const _create = useCallback(async (args: IArgsCreateProyecto) => {
    setLoading(true); setError(null)
    const res = await _createUC(args)
    if (res.error) { setError(res.msg ?? 'Error al crear'); setLoading(false); return null }
    setProyecto(res.response!)
    setLoading(false)
    return res.response!
  }, [])

  const _update = useCallback(async (args: IArgsUpdateProyecto) => {
    setLoading(true); setError(null)
    const res = await _updateUC(args)
    if (res.error) { setError(res.msg ?? 'Error al actualizar'); setLoading(false); return null }
    setProyecto(res.response!)
    setLoading(false)
    return res.response!
  }, [])

  const _delete = useCallback(async (id: number, page = 1) => {
    setLoading(true); setError(null)
    const res = await _deleteUC(id)
    if (res.error) { setError(res.msg ?? 'Error al eliminar'); setLoading(false); return false }
    await _list(page)
    setLoading(false)
    return true
  }, [_list])

  const clearProyecto = useCallback(() => setProyecto(null), [])

  return { paginado, proyecto, loading, error, _list, _getById, _create, _update, _delete, clearProyecto }
}
