import type { EstimacionRepository } from '../../domain/models/EstimacionRepository'

export function getEstimacion(repo: EstimacionRepository) {
  return (id: number) => repo.getById(id)
}
