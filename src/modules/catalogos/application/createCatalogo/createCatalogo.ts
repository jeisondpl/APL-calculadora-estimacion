import { errorResponse } from '@/shared/lib/HttpResponse'
import type { CatalogosRepository } from '../../domain/models/CatalogosRepository'
import type { IArgsCreateCatalogo } from '../../domain/entities/Catalogos.entities'

export function createCatalogo(repo: CatalogosRepository) {
  return (args: IArgsCreateCatalogo) => {
    if (!args.nombre.trim()) return Promise.resolve(errorResponse('El nombre es requerido', 400))
    return repo.create(args)
  }
}
