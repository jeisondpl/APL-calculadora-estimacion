import type { CatalogosRepository } from '../../domain/models/CatalogosRepository'
import type { IArgsDeleteCatalogo } from '../../domain/entities/Catalogos.entities'

export function deleteCatalogo(repo: CatalogosRepository) {
  return (args: IArgsDeleteCatalogo) => repo.delete(args)
}
