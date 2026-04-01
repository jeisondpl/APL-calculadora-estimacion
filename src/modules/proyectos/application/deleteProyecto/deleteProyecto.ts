import type { ProyectosRepository } from '../../domain/models/ProyectosRepository'

export const deleteProyecto = (repo: ProyectosRepository) =>
  (id: number) => repo.deleteById(id)
