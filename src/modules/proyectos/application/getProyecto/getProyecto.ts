import type { ProyectosRepository } from '../../domain/models/ProyectosRepository'

export const getProyecto = (repo: ProyectosRepository) =>
  (id: number) => repo.getById(id)
