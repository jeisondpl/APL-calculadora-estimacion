import { apiClient } from '@/shared/lib/axios'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type { ProyectosRepository } from '../domain/models/ProyectosRepository'
import type {
  IArgsCreateProyecto,
  IArgsUpdateProyecto,
  IArgsListProyectos,
  IResponseProyecto,
  IResponseListProyectos,
} from '../domain/entities/Proyectos.entities'

export function ApiProyectosRepository(): ProyectosRepository {
  async function list(args: IArgsListProyectos): Promise<HttpResponse<IResponseListProyectos>> {
    try {
      const { data } = await apiClient.get<HttpResponse<IResponseListProyectos>>('/proyectos', { params: args })
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al listar proyectos')
    }
  }

  async function getById(id: number): Promise<HttpResponse<IResponseProyecto>> {
    try {
      const { data } = await apiClient.get<HttpResponse<IResponseProyecto>>(`/proyectos/${id}`)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al obtener proyecto')
    }
  }

  async function create(args: IArgsCreateProyecto): Promise<HttpResponse<IResponseProyecto>> {
    try {
      const { data } = await apiClient.post<HttpResponse<IResponseProyecto>>('/proyectos', args)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al crear proyecto')
    }
  }

  async function update(args: IArgsUpdateProyecto): Promise<HttpResponse<IResponseProyecto>> {
    try {
      const { data } = await apiClient.put<HttpResponse<IResponseProyecto>>(`/proyectos/${args.id}`, args)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al actualizar proyecto')
    }
  }

  async function deleteById(id: number): Promise<HttpResponse<void>> {
    try {
      const { data } = await apiClient.delete<HttpResponse<void>>(`/proyectos/${id}`)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al eliminar proyecto')
    }
  }

  return { list, getById, create, update, deleteById }
}
