import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type {
  IArgsListComponentes,
  IArgsGetComponente,
  IArgsCreateComponente,
  IArgsUpdateComponente,
  IArgsDeleteComponente,
  IResponseComponente,
  IResponseComponentesPaginado,
} from '../entities/Componentes.entities'

export type ComponentesRepository = {
  list(args: IArgsListComponentes):     Promise<HttpResponse<IResponseComponentesPaginado>>
  get(args: IArgsGetComponente):        Promise<HttpResponse<IResponseComponente>>
  create(args: IArgsCreateComponente):  Promise<HttpResponse<IResponseComponente>>
  update(args: IArgsUpdateComponente):  Promise<HttpResponse<IResponseComponente>>
  delete(args: IArgsDeleteComponente):  Promise<HttpResponse<IResponseComponente>>
}
