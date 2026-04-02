/**
 * Convierte minutos enteros a formato legible.
 * @example formatMinutes(90) → "1h 30min"
 */
export function formatMinutes(min: number): string {
  if (min <= 0) return '0 min'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

/**
 * Formatea un número como porcentaje.
 * @example formatPct(30) → "30%"
 */
export function formatPct(pct: number): string {
  return `${pct}%`
}

/**
 * Combina clases CSS condicionalmente (equivalente a clsx/cn).
 * @example cn('base', isActive && 'active', undefined) → "base active"
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Calcula el tiempo ajustado por porcentaje de reducción.
 * Usado para Copilot: base * (1 - pct/100)
 */
export function calcTiempoReducido(baseMin: number, pct: number): number {
  return Math.round(baseMin * (1 - pct / 100))
}

/**
 * Calcula el tiempo ajustado por porcentaje de incremento.
 * Usado para TME: base * (1 + pct/100)
 */
export function calcTiempoIncrementado(baseMin: number, pct: number): number {
  return Math.round(baseMin * (1 + pct / 100))
}

/**
 * Descarga un string como archivo en el navegador.
 */
export function downloadFile(content: string, filename: string, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mime }) // BOM para que Excel abra correctamente
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Convierte una estimación a texto CSV.
 */
export function estimacionToCsv(estimacion: {
  nombre:          string | null
  createdAt:       string
  totalBaseMin:    number
  totalCopilotMin: number
  totalTmeMin:     number
  items: {
    nombreComponente: string
    lenguajeNombre:   string
    tecnologiaNombre: string
    cantidad:         number
    tiempoBaseMin:    number
    tiempoCopilotMin: number
    tiempoTmeMin:     number
  }[]
}): string {
  const fecha = new Date(estimacion.createdAt).toLocaleDateString('es-ES')
  const rows: string[][] = [
    ['Estimación', estimacion.nombre ?? 'Sin nombre'],
    ['Fecha',      fecha],
    [],
    ['Resumen'],
    ['Tiempo base (min)',    String(estimacion.totalBaseMin)],
    ['Tiempo Copilot (min)', String(estimacion.totalCopilotMin)],
    ['Tiempo TIGO (min)',     String(estimacion.totalTmeMin)],
    ['Ahorro Copilot (min)', String(estimacion.totalBaseMin - estimacion.totalCopilotMin)],
    [],
    ['Componente', 'Lenguaje', 'Tecnología', 'Cantidad',
     'Base (min)', 'Copilot (min)', 'TIGO (min)'],
    ...estimacion.items.map(i => [
      i.nombreComponente,
      i.lenguajeNombre,
      i.tecnologiaNombre,
      String(i.cantidad),
      String(i.tiempoBaseMin),
      String(i.tiempoCopilotMin),
      String(i.tiempoTmeMin),
    ]),
  ]

  return rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(';')).join('\n')
}
