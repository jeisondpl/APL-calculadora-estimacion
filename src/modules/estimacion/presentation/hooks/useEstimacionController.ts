'use client'

import { useState, useCallback } from 'react'
import { ApiEstimacionRepository } from '../../infrastructure/apiEstimacionRepository'
import { calcularEstimacionUseCase } from '../../application/calcularEstimacion/calcularEstimacion'
import { useEstimacionStore } from '../stores/useEstimacionStore'
import type { IArgsCalcularEstimacion } from '../../domain/entities/Estimacion.entities'

export function useEstimacionController() {
  const repository = ApiEstimacionRepository()
  const { resultado, itemsSeleccionados, setResultado, nombreEstimacion } = useEstimacionStore()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const _calcular = useCallback(async (args?: Partial<IArgsCalcularEstimacion>) => {
    setLoading(true)
    setError(null)
    try {
      const payload: IArgsCalcularEstimacion = {
        nombre:      args?.nombre ?? nombreEstimacion ?? undefined,
        descripcion: args?.descripcion,
        items:       args?.items ?? itemsSeleccionados,
      }
      const result = await calcularEstimacionUseCase(repository, payload)
      if (result.error) throw new Error(result.msg)
      setResultado(result.response!)
      return result.response
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al calcular')
      return undefined
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSeleccionados, nombreEstimacion])

  return {
    resultado,
    loading,
    error,
    _calcular,
  }
}
