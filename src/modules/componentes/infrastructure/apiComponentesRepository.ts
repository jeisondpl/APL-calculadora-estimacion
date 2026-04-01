import { apiClient } from '@/shared/lib/axios'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type { ComponentesRepository } from '../domain/models/ComponentesRepository'
import type {
  IArgsListComponentes,
  IArgsGetComponente,
  IArgsCreateComponente,
  IArgsUpdateComponente,
  IArgsDeleteComponente,
  IResponseComponente,
  IResponseComponentesPaginado,
} from '../domain/entities/Componentes.entities'

export function ApiComponentesRepository(): ComponentesRepository {
  async function list(args: IArgsListComponentes): Promise<HttpResponse<IResponseComponentesPaginado>> {
    try {
      const { data } = await apiClient.get<HttpResponse<IResponseComponentesPaginado>>(
        '/componentes',
        { params: args }
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al listar componentes')
    }
  }

  async function get(args: IArgsGetComponente): Promise<HttpResponse<IResponseComponente>> {
    try {
      const { data } = await apiClient.get<HttpResponse<IResponseComponente>>(
        `/componentes/${args.id}`
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al obtener componente')
    }
  }

  async function create(args: IArgsCreateComponente): Promise<HttpResponse<IResponseComponente>> {
    try {
      const { data } = await apiClient.post<HttpResponse<IResponseComponente>>('/componentes', args)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al crear componente')
    }
  }

  async function update(args: IArgsUpdateComponente): Promise<HttpResponse<IResponseComponente>> {
    const { id, ...body } = args
    try {
      const { data } = await apiClient.patch<HttpResponse<IResponseComponente>>(
        `/componentes/${id}`, body
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al actualizar componente')
    }
  }

  async function remove(args: IArgsDeleteComponente): Promise<HttpResponse<IResponseComponente>> {
    try {
      const { data } = await apiClient.delete<HttpResponse<IResponseComponente>>(
        `/componentes/${args.id}`
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al eliminar componente')
    }
  }

  return { list, get, create, update, delete: remove }
}
