import type { HttpResponse } from '@/shared/lib/HttpResponse'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { EstimacionRepository } from '../../domain/models/EstimacionRepository'
import type { IArgsCalcularEstimacion, IResponseEstimacion } from '../../domain/entities/Estimacion.entities'

export const calcularEstimacionUseCase = async (
  repository: EstimacionRepository,
  args: IArgsCalcularEstimacion
): Promise<HttpResponse<IResponseEstimacion>> => {
  if (!args.items?.length)          return errorResponse('Selecciona al menos un componente', 400)
  if (args.items.some(i => i.cantidad < 1))
                                    return errorResponse('La cantidad debe ser al menos 1', 400)
  return repository.calcular(args)
}
