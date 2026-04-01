import type { ProyectosRepository } from '../../domain/models/ProyectosRepository'
import type { IArgsListProyectos } from '../../domain/entities/Proyectos.entities'

export const listProyectos = (repo: ProyectosRepository) =>
  (args: IArgsListProyectos) => repo.list(args)
