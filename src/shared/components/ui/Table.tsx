import { cn } from '@/shared/lib/utils'

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (row: T) => React.ReactNode
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  emptyText?: string
  keyExtractor: (row: T) => string | number
  className?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function Table<T>({
  columns,
  data,
  loading = false,
  emptyText = 'Sin resultados',
  keyExtractor,
  className,
}: TableProps<T>) {
  const alignClass: Record<string, string> = {
    left:   'text-left',
    center: 'text-center',
    right:  'text-right',
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border', className)}
      style={{ borderColor: 'var(--color-border)' }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ backgroundColor: 'var(--color-petroleum)' }}>
            {columns.map(col => (
              <th
                key={String(col.key)}
                scope="col"
                className={cn(
                  'px-4 py-3 text-xs font-semibold uppercase tracking-wider',
                  alignClass[col.align ?? 'left']
                )}
                style={{ color: 'rgba(255,255,255,0.85)', width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center">
                <span className="inline-block w-5 h-5 border-2 border-[var(--color-petroleum)] border-t-transparent rounded-full animate-spin" />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-sm"
                style={{ color: 'var(--color-text-soft)' }}
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={keyExtractor(row)}
                className="border-t transition-colors hover:bg-neutral-warm"
                style={{ borderColor: 'var(--color-border)', backgroundColor: idx % 2 === 1 ? 'rgba(227,226,218,0.3)' : 'var(--color-surface)' }}
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className={cn('px-4 py-3', alignClass[col.align ?? 'left'])}
                    style={{ color: 'var(--color-text)' }}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
