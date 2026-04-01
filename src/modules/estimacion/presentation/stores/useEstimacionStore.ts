import { create } from 'zustand'
import type { IArgsItemEstimacion, IResponseEstimacion } from '../../domain/entities/Estimacion.entities'

interface EstimacionState {
  // Items seleccionados para calcular
  itemsSeleccionados: IArgsItemEstimacion[]
  // Resultado del último cálculo
  resultado: IResponseEstimacion | null
  // Nombre de la estimación actual
  nombreEstimacion: string

  // Acciones
  agregarComponente:   (componenteId: number) => void
  quitarComponente:    (componenteId: number) => void
  setCantidad:         (componenteId: number, cantidad: number) => void
  setResultado:        (resultado: IResponseEstimacion) => void
  setNombreEstimacion: (nombre: string) => void
  limpiar:             () => void
}

export const useEstimacionStore = create<EstimacionState>((set) => ({
  itemsSeleccionados: [],
  resultado:          null,
  nombreEstimacion:   '',

  agregarComponente: (componenteId) =>
    set(state => {
      const existe = state.itemsSeleccionados.find(i => i.componenteId === componenteId)
      if (existe) {
        return {
          itemsSeleccionados: state.itemsSeleccionados.map(i =>
            i.componenteId === componenteId
              ? { ...i, cantidad: i.cantidad + 1 }
              : i
          ),
        }
      }
      return {
        itemsSeleccionados: [...state.itemsSeleccionados, { componenteId, cantidad: 1 }],
      }
    }),

  quitarComponente: (componenteId) =>
    set(state => ({
      itemsSeleccionados: state.itemsSeleccionados.filter(i => i.componenteId !== componenteId),
    })),

  setCantidad: (componenteId, cantidad) =>
    set(state => ({
      itemsSeleccionados: state.itemsSeleccionados.map(i =>
        i.componenteId === componenteId ? { ...i, cantidad: Math.max(1, cantidad) } : i
      ),
    })),

  setResultado:        (resultado) => set({ resultado }),
  setNombreEstimacion: (nombre)    => set({ nombreEstimacion: nombre }),
  limpiar:             ()          => set({ itemsSeleccionados: [], resultado: null, nombreEstimacion: '' }),
}))
