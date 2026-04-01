import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type {
  IArgsCalcularEstimacion,
  IArgsListEstimaciones,
  IResponseEstimacion,
  IResponseListEstimaciones,
} from '../entities/Estimacion.entities'

export type EstimacionRepository = {
  calcular(args: IArgsCalcularEstimacion): Promise<HttpResponse<IResponseEstimacion>>
  list(args: IArgsListEstimaciones):       Promise<HttpResponse<IResponseListEstimaciones>>
  getById(id: number):                     Promise<HttpResponse<IResponseEstimacion>>
  deleteById(id: number):                  Promise<HttpResponse<void>>
}
