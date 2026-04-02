import { create } from 'zustand'
import type { IActividad, IActividadComponente } from '../../domain/entities/Proyectos.entities'

export interface DatosGenerales {
  requerimiento:   string
  nombreProyecto:  string
  objetivo:        string
  fechaEstimacion: string
  fechaEjecucion:  string
  estimadoPor:     string
  supervisadoPor:  string
}

const DATOS_INIT: DatosGenerales = {
  requerimiento:   '',
  nombreProyecto:  '',
  objetivo:        '',
  fechaEstimacion: '',
  fechaEjecucion:  '',
  estimadoPor:     '',
  supervisadoPor:  '',
}

export const DEFAULT_ACTIVITY_NAMES = new Set([
  'Análisis preliminar',
  'Agendas de prefactibilidad y socialización',
  'Análisis Funcional',
  'Diseño técnico',
  'Planificación, Valoración',
])

const ACTIVIDADES_DEFAULT: IActividad[] = [
  { nombre: 'Análisis preliminar',                       bloque: 'Back Bloque III',   orden: 0, isDefault: true, componentes: [] },
  { nombre: 'Agendas de prefactibilidad y socialización', bloque: 'Back Bloque III',   orden: 1, isDefault: true, componentes: [] },
  { nombre: 'Análisis Funcional',                        bloque: 'Back Bloque III',   orden: 2, isDefault: true, componentes: [] },
  { nombre: 'Diseño técnico',                            bloque: 'Magento Bloque II', orden: 3, isDefault: true, componentes: [] },
  { nombre: 'Planificación, Valoración',                 bloque: 'Back Bloque III',   orden: 4, isDefault: true, componentes: [] },
]

interface WizardState {
  step:           1 | 2 | 3
  editingId:      number | null   // null = nuevo, number = editar
  datosGenerales: DatosGenerales
  actividades:    IActividad[]

  // Navegación
  goToStep:        (s: 1 | 2 | 3) => void
  setEditingId:    (id: number | null) => void

  // Datos generales
  setDatosGenerales: (d: DatosGenerales) => void

  // Actividades
  addActividad:      (a: IActividad) => void
  updateActividad:   (idx: number, a: IActividad) => void
  removeActividad:   (idx: number) => void
  reorderActividad:  (from: number, to: number) => void

  // Componentes por actividad
  addComponente:    (actIdx: number, c: IActividadComponente) => void
  updateComponente: (actIdx: number, compId: number, c: Partial<IActividadComponente>) => void
  removeComponente: (actIdx: number, compId: number) => void

  // Reset
  reset: () => void
  loadFromProyecto: (datos: DatosGenerales, actividades: IActividad[]) => void
}

export const useWizardStore = create<WizardState>((set) => ({
  step:           1,
  editingId:      null,
  datosGenerales: DATOS_INIT,
  actividades:    ACTIVIDADES_DEFAULT,

  goToStep:     s    => set({ step: s }),
  setEditingId: id   => set({ editingId: id }),

  setDatosGenerales: d => set({ datosGenerales: d }),

  addActividad: a =>
    set(s => ({ actividades: [...s.actividades, { ...a, orden: s.actividades.length, componentes: a.componentes ?? [] }] })),

  updateActividad: (idx, a) =>
    set(s => ({ actividades: s.actividades.map((x, i) => i === idx ? { ...a, componentes: x.componentes } : x) })),

  removeActividad: idx =>
    set(s => ({ actividades: s.actividades.filter((_, i) => i !== idx).map((a, i) => ({ ...a, orden: i })) })),

  reorderActividad: (from, to) =>
    set(s => {
      const arr = [...s.actividades]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return { actividades: arr.map((a, i) => ({ ...a, orden: i })) }
    }),

  addComponente: (actIdx, c) =>
    set(s => ({
      actividades: s.actividades.map((a, i) =>
        i === actIdx ? { ...a, componentes: [...a.componentes, c] } : a
      ),
    })),

  updateComponente: (actIdx, compId, patch) =>
    set(s => ({
      actividades: s.actividades.map((a, i) =>
        i === actIdx
          ? { ...a, componentes: a.componentes.map(c => c.componenteId === compId ? { ...c, ...patch } : c) }
          : a
      ),
    })),

  removeComponente: (actIdx, compId) =>
    set(s => ({
      actividades: s.actividades.map((a, i) =>
        i === actIdx ? { ...a, componentes: a.componentes.filter(c => c.componenteId !== compId) } : a
      ),
    })),

  reset: () => set({ step: 1, editingId: null, datosGenerales: DATOS_INIT, actividades: ACTIVIDADES_DEFAULT.map(a => ({ ...a, componentes: [] })) }),

  loadFromProyecto: (datos, actividades) =>
    set({
      step: 1,
      datosGenerales: datos,
      actividades: actividades.map(a => ({
        ...a,
        isDefault: DEFAULT_ACTIVITY_NAMES.has(a.nombre),
      })),
    }),
}))
