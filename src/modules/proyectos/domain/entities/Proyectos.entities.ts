// ─── Actividad ────────────────────────────────────────────────────────────────

export interface IActividadComponente {
  id?:             number
  componenteId:    number
  nombreComponente?: string
  grupoNombre?:    string
  lenguajeNombre?: string
  tecnologiaNombre?: string
  proceso?:        string
  cantidad:        number
  reutilizar:      boolean
  tiempoBaseMin?:  number
  tiempoCopilotMin?: number
  tiempoTmeMin?:   number
}

export interface IActividad {
  id?:         number
  nombre:      string
  proceso?:    string
  bloque?:     string
  jornadas?:   number
  fechaInicio?: string   // ISO date string
  fechaFin?:   string
  orden?:      number
  isDefault?:  boolean   // actividades precargadas, no eliminables
  creadoPorId?:      number | null
  creadoPorNombre?:  string | null
  tiemposEstimador?: { userId: number; nombre: string; horas: number }[]
  dependencias?:     string[]   // nombres de actividades previas requeridas
  componentes: IActividadComponente[]
  // totales calculados
  totalBaseMin?:    number
  totalCopilotMin?: number
  totalTmeMin?:     number
}

// ─── Proyecto ─────────────────────────────────────────────────────────────────

export interface IArgsCreateProyecto {
  requerimiento:   string
  nombreProyecto:  string
  objetivo?:       string
  fechaEstimacion?: string
  fechaEjecucion?:  string
  estimadoPor?:    string
  supervisadoPor?: string
  estimadorIds?:   number[]
  noPrefas?:       number
  tiempoSesionHoras?: number
  actividades:     IActividad[]
}

export interface IArgsUpdateProyecto extends IArgsCreateProyecto {
  id: number
}

export interface IArgsListProyectos {
  page?:  number
  limit?: number
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface IResponseProyectoSummary {
  id:             number
  requerimiento:  string
  nombreProyecto: string
  objetivo:       string | null
  fechaEstimacion: string | null
  estimadoPor:    string | null
  supervisadoPor: string | null
  totalBaseMin:   number
  totalCopilotMin: number
  totalTmeMin:    number
  actividadesCount: number
  estado:         string
  createdAt:      string
  estimadores:    { id: number; nombre: string }[]
}

export interface IResponseProyecto extends IResponseProyectoSummary {
  fechaEjecucion:    string | null
  noPrefas:          number | null
  tiempoSesionHoras: number | null
  actividades:       IResponseActividad[]
  updatedAt:         string
}

export interface IResponseActividad {
  id:          number
  nombre:      string
  proceso:     string | null
  bloque:      string | null
  jornadas:    number | null
  fechaInicio: string | null
  fechaFin:    string | null
  orden:       number
  creadoPorId:      number | null
  creadoPorNombre:  string | null
  tiemposEstimador: { userId: number; nombre: string; horas: number }[]
  dependencias:    string[]
  totalBaseMin:    number
  totalCopilotMin: number
  totalTmeMin:     number
  componentes: IResponseActividadComponente[]
}

export interface IResponseActividadComponente {
  id:              number
  componenteId:    number
  nombreComponente: string
  grupoNombre:     string
  lenguajeNombre:  string
  tecnologiaNombre: string
  proceso:         string | null
  cantidad:        number
  reutilizar:      boolean
  tiempoBaseMin:   number
  tiempoCopilotMin: number
  tiempoTmeMin:    number
}

export interface IResponseListProyectos {
  items: IResponseProyectoSummary[]
  total: number
  page:  number
  limit: number
}
