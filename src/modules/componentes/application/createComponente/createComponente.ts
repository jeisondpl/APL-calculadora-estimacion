import type { HttpResponse } from '@/shared/lib/HttpResponse'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { ComponentesRepository } from '../../domain/models/ComponentesRepository'
import type { IArgsCreateComponente, IResponseComponente } from '../../domain/entities/Componentes.entities'
import { validateCreateComponente } from '../../domain/validations/componentes.validations'

export const createComponenteUseCase = async (
  repository: ComponentesRepository,
  args: IArgsCreateComponente
): Promise<HttpResponse<IResponseComponente>> => {
  const error = validateCreateComponente(args)
  if (error) return errorResponse(error, 400)
  return repository.create(args)
}
