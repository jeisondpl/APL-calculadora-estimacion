import { errorResponse } from '@/shared/lib/HttpResponse'
import type { CatalogosRepository } from '../../domain/models/CatalogosRepository'
import type { IArgsUpdateCatalogo } from '../../domain/entities/Catalogos.entities'

export function updateCatalogo(repo: CatalogosRepository) {
  return (args: IArgsUpdateCatalogo) => {
    if (!args.nombre.trim()) return Promise.resolve(errorResponse('El nombre es requerido', 400))
    return repo.update(args)
  }
}
