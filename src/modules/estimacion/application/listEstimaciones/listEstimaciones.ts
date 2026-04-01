import type { EstimacionRepository } from '../../domain/models/EstimacionRepository'
import type { IArgsListEstimaciones } from '../../domain/entities/Estimacion.entities'

export function listEstimaciones(repo: EstimacionRepository) {
  return (args: IArgsListEstimaciones) => repo.list(args)
}
