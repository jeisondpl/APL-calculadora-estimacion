import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type { ComponentesRepository } from '../../domain/models/ComponentesRepository'
import type { IArgsListComponentes, IResponseComponentesPaginado } from '../../domain/entities/Componentes.entities'

export const listComponentesUseCase = (
  repository: ComponentesRepository,
  args: IArgsListComponentes
): Promise<HttpResponse<IResponseComponentesPaginado>> => repository.list(args)
