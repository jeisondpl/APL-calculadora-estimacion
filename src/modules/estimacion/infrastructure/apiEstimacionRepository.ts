import { apiClient } from '@/shared/lib/axios'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type { EstimacionRepository } from '../domain/models/EstimacionRepository'
import type {
  IArgsCalcularEstimacion,
  IArgsListEstimaciones,
  IResponseEstimacion,
  IResponseListEstimaciones,
} from '../domain/entities/Estimacion.entities'

export function ApiEstimacionRepository(): EstimacionRepository {
  async function calcular(
    args: IArgsCalcularEstimacion
  ): Promise<HttpResponse<IResponseEstimacion>> {
    try {
      const { data } = await apiClient.post<HttpResponse<IResponseEstimacion>>('/estimacion', args)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al calcular estimación')
    }
  }

  async function list(
    args: IArgsListEstimaciones
  ): Promise<HttpResponse<IResponseListEstimaciones>> {
    try {
      const { data } = await apiClient.get<HttpResponse<IResponseListEstimaciones>>(
        '/estimacion',
        { params: args }
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al listar estimaciones')
    }
  }

  async function getById(id: number): Promise<HttpResponse<IResponseEstimacion>> {
    try {
      const { data } = await apiClient.get<HttpResponse<IResponseEstimacion>>(
        `/estimacion/${id}`
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al obtener estimación')
    }
  }

  async function deleteById(id: number): Promise<HttpResponse<void>> {
    try {
      const { data } = await apiClient.delete<HttpResponse<void>>(`/estimacion/${id}`)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al eliminar estimación')
    }
  }

  return { calcular, list, getById, deleteById }
}
