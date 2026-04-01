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
  createdAt:      string
}

export interface IResponseProyecto extends IResponseProyectoSummary {
  fechaEjecucion: string | null
  actividades:    IResponseActividad[]
  updatedAt:      string
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
