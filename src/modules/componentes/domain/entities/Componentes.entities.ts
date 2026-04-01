// ─── Inputs ──────────────────────────────────────────────────────────────────

export interface IArgsListComponentes {
  grupoId?:      number
  tipoId?:       number
  lenguajeId?:   number
  tecnologiaId?: number
  search?:       string
  page?:         number
  limit?:        number
}

export interface IArgsGetComponente {
  id: number
}

export interface IArgsVariableComponente {
  nombreVariable: string
  tiempoBaseMin:  number
  pctCopilot:     number
  pctTme:         number
}

export interface IArgsCreateComponente {
  nombreComponente: string
  grupoId:          number
  tipoId:           number
  lenguajeId:       number
  tecnologiaId:     number
  publicar?:        boolean
  variables:        IArgsVariableComponente[]
}

export interface IArgsUpdateComponente {
  id:               number
  nombreComponente?: string
  grupoId?:          number
  tipoId?:           number
  lenguajeId?:       number
  tecnologiaId?:     number
  publicar?:         boolean
  activo?:           boolean
}

export interface IArgsDeleteComponente {
  id: number
}

// ─── Outputs ─────────────────────────────────────────────────────────────────

export interface IResponseVariableComponente {
  id:               number
  nombreVariable:   string
  tiempoBaseMin:    number
  pctCopilot:       number
  tiempoCopilotMin: number
  pctTme:           number
  tiempoTmeMin:     number
}

export interface IResponseComponente {
  id:               number
  idCsv:            number
  nombreComponente: string
  publicar:         boolean
  grupoId:          number
  grupoNombre:      string
  tipoId:           number
  tipoNombre:       string
  lenguajeId:       number
  lenguajeNombre:   string
  tecnologiaId:     number
  tecnologiaNombre: string
  totalBaseMin:     number
  totalCopilotMin:  number
  totalTmeMin:      number
  variables:        IResponseVariableComponente[]
}

export interface IResponseComponentesPaginado {
  items:  IResponseComponente[]
  total:  number
  page:   number
  limit:  number
}
