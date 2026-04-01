import { errorResponse } from '@/shared/lib/HttpResponse'
import type { ProyectosRepository } from '../../domain/models/ProyectosRepository'
import type { IArgsCreateProyecto } from '../../domain/entities/Proyectos.entities'

export const createProyecto = (repo: ProyectosRepository) =>
  (args: IArgsCreateProyecto) => {
    if (!args.requerimiento?.trim())  return Promise.resolve(errorResponse('El requerimiento es requerido', 400))
    if (!args.nombreProyecto?.trim()) return Promise.resolve(errorResponse('El nombre del proyecto es requerido', 400))
    return repo.create(args)
  }
