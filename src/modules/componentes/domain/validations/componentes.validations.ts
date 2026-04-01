import type { IArgsCreateComponente, IArgsUpdateComponente } from '../entities/Componentes.entities'

export function validateCreateComponente(args: IArgsCreateComponente): string | null {
  if (!args.nombreComponente?.trim())   return 'El nombre del componente es requerido'
  if (!args.grupoId)                    return 'El grupo es requerido'
  if (!args.tipoId)                     return 'El tipo es requerido'
  if (!args.lenguajeId)                 return 'El lenguaje es requerido'
  if (!args.tecnologiaId)               return 'La tecnología es requerida'
  if (!args.variables?.length)          return 'Se requiere al menos una variable'

  for (const v of args.variables) {
    if (!v.nombreVariable?.trim())      return 'Cada variable debe tener nombre'
    if (v.tiempoBaseMin < 0)            return 'El tiempo base no puede ser negativo'
    if (v.pctCopilot < 0 || v.pctCopilot > 100)
                                        return '% Copilot debe estar entre 0 y 100'
    if (v.pctTme < 0 || v.pctTme > 100)
                                        return '% TME debe estar entre 0 y 100'
  }

  return null
}

export function validateUpdateComponente(args: IArgsUpdateComponente): string | null {
  if (!args.id) return 'El id es requerido'
  return null
}
