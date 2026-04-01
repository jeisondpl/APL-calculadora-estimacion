import type { HttpResponse } from '@/shared/lib/HttpResponse'
import { errorResponse } from '@/shared/lib/HttpResponse'
import type { ComponentesRepository } from '../../domain/models/ComponentesRepository'
import type { IArgsUpdateComponente, IResponseComponente } from '../../domain/entities/Componentes.entities'
import { validateUpdateComponente } from '../../domain/validations/componentes.validations'

export const updateComponenteUseCase = async (
  repository: ComponentesRepository,
  args: IArgsUpdateComponente
): Promise<HttpResponse<IResponseComponente>> => {
  const error = validateUpdateComponente(args)
  if (error) return errorResponse(error, 400)
  return repository.update(args)
}
