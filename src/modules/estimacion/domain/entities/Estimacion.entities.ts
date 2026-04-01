// ─── List / detail ───────────────────────────────────────────────────────────

export interface IArgsListEstimaciones {
  page?:  number
  limit?: number
}

export interface IResponseEstimacionSummary {
  id:              number
  nombre:          string | null
  totalBaseMin:    number
  totalCopilotMin: number
  totalTmeMin:     number
  createdAt:       string
}

export interface IResponseListEstimaciones {
  items: IResponseEstimacionSummary[]
  total: number
  page:  number
  limit: number
}

// ─── Inputs ──────────────────────────────────────────────────────────────────

export interface IArgsItemEstimacion {
  componenteId: number
  cantidad:     number
}

export interface IArgsCalcularEstimacion {
  nombre?:      string
  descripcion?: string
  items:        IArgsItemEstimacion[]
}

// ─── Outputs ─────────────────────────────────────────────────────────────────

export interface IResponseItemEstimacion {
  componenteId:      number
  nombreComponente:  string
  lenguajeNombre:    string
  tecnologiaNombre:  string
  cantidad:          number
  tiempoBaseMin:     number
  tiempoCopilotMin:  number
  tiempoTmeMin:      number
}

export interface IResponseEstimacion {
  id:             number
  nombre:         string | null
  descripcion:    string | null
  totalBaseMin:   number
  totalCopilotMin: number
  totalTmeMin:    number
  items:          IResponseItemEstimacion[]
  createdAt:      string
}
