import { z } from 'zod'

export const variableSchema = z.object({
  nombreVariable: z.string().min(1, 'Nombre requerido').max(200),
  tiempoBaseMin:  z.coerce.number().min(1, 'Debe ser mayor a 0'),
  pctCopilot:     z.coerce.number().min(0).max(100),
  pctTme:         z.coerce.number().min(0).max(100),
})

export const createComponenteSchema = z.object({
  nombreComponente: z.string().min(1, 'Nombre requerido').max(200),
  grupoId:          z.coerce.number().min(1, 'Grupo requerido'),
  tipoId:           z.coerce.number().min(1, 'Tipo requerido'),
  lenguajeId:       z.coerce.number().min(1, 'Lenguaje requerido'),
  tecnologiaId:     z.coerce.number().min(1, 'Tecnología requerida'),
  publicar:         z.boolean().default(true),
  variables:        z.array(variableSchema).min(1, 'Al menos una variable'),
})

export type CreateComponenteFormData = z.infer<typeof createComponenteSchema>
