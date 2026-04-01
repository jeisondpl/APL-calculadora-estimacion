import { apiClient } from '@/shared/lib/axios'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type { CatalogosRepository } from '../domain/models/CatalogosRepository'
import type {
  ICatalogo,
  TipoCatalogo,
  IArgsCreateCatalogo,
  IArgsUpdateCatalogo,
  IArgsDeleteCatalogo,
} from '../domain/entities/Catalogos.entities'

export function ApiCatalogosRepository(): CatalogosRepository {
  async function getByTipo(tipo: TipoCatalogo): Promise<HttpResponse<ICatalogo[]>> {
    try {
      const { data } = await apiClient.get<HttpResponse<ICatalogo[]>>(`/catalogos/${tipo}`)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : `Error al cargar ${tipo}`)
    }
  }

  async function create({ tipo, nombre }: IArgsCreateCatalogo): Promise<HttpResponse<ICatalogo>> {
    try {
      const { data } = await apiClient.post<HttpResponse<ICatalogo>>(
        `/catalogos/${tipo}`,
        { nombre }
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al crear')
    }
  }

  async function update({ tipo, id, nombre }: IArgsUpdateCatalogo): Promise<HttpResponse<ICatalogo>> {
    try {
      const { data } = await apiClient.patch<HttpResponse<ICatalogo>>(
        `/catalogos/${tipo}/${id}`,
        { nombre }
      )
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al actualizar')
    }
  }

  async function del({ tipo, id }: IArgsDeleteCatalogo): Promise<HttpResponse<void>> {
    try {
      const { data } = await apiClient.delete<HttpResponse<void>>(`/catalogos/${tipo}/${id}`)
      return data
    } catch (e) {
      return errorResponse(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  return { getByTipo, create, update, delete: del }
}
