export type {
  IActividad,
  IActividadComponente,
  IArgsCreateProyecto,
  IArgsUpdateProyecto,
  IResponseProyecto,
  IResponseProyectoSummary,
  IResponseActividad,
  IResponseActividadComponente,
  IResponseListProyectos,
} from './domain/entities/Proyectos.entities'
export { useProyectosController } from './presentation/hooks/useProyectosController'
export { useWizardStore }         from './presentation/stores/useWizardStore'
export type { DatosGenerales }    from './presentation/stores/useWizardStore'
