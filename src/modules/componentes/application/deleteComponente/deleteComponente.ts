import type { HttpResponse } from '@/shared/lib/HttpResponse'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { ComponentesRepository } from '../../domain/models/ComponentesRepository'
import type { IArgsDeleteComponente, IResponseComponente } from '../../domain/entities/Componentes.entities'

export const deleteComponenteUseCase = async (
  repository: ComponentesRepository,
  args: IArgsDeleteComponente
): Promise<HttpResponse<IResponseComponente>> => {
  if (!args.id) return errorResponse('El id es requerido', 400)
  return repository.delete(args)
}
