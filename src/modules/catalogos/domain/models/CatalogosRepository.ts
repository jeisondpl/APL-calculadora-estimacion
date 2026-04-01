import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type {
  ICatalogo,
  TipoCatalogo,
  IArgsCreateCatalogo,
  IArgsUpdateCatalogo,
  IArgsDeleteCatalogo,
} from '../entities/Catalogos.entities'

export type CatalogosRepository = {
  getByTipo(tipo: TipoCatalogo):         Promise<HttpResponse<ICatalogo[]>>
  create(args: IArgsCreateCatalogo):     Promise<HttpResponse<ICatalogo>>
  update(args: IArgsUpdateCatalogo):     Promise<HttpResponse<ICatalogo>>
  delete(args: IArgsDeleteCatalogo):     Promise<HttpResponse<void>>
}
