import type { HttpResponse } from '@/shared/lib/HttpResponse'
import type {
  IArgsCreateProyecto,
  IArgsUpdateProyecto,
  IArgsListProyectos,
  IResponseProyecto,
  IResponseListProyectos,
} from '../entities/Proyectos.entities'

export type ProyectosRepository = {
  list(args: IArgsListProyectos):       Promise<HttpResponse<IResponseListProyectos>>
  getById(id: number):                  Promise<HttpResponse<IResponseProyecto>>
  create(args: IArgsCreateProyecto):    Promise<HttpResponse<IResponseProyecto>>
  update(args: IArgsUpdateProyecto):    Promise<HttpResponse<IResponseProyecto>>
  deleteById(id: number):               Promise<HttpResponse<void>>
}
