import { cn } from '@/shared/lib/utils'

interface SummaryCardProps {
  label: string
  value: string
  sublabel?: string
  accent?: 'default' | 'green' | 'purple' | 'orange'
  className?: string
}

const ACCENT_COLORS = {
  default: 'var(--color-petroleum)',
  green:   'var(--color-success)',
  purple:  'var(--color-accent-purple)',
  orange:  'var(--color-accent-orange)',
}

export function SummaryCard({
  label,
  value,
  sublabel,
  accent = 'default',
  className,
}: SummaryCardProps) {
  const accentColor = ACCENT_COLORS[accent]

  return (
    <div
      className={cn('rounded-card border p-5', className)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderTop: `3px solid ${accentColor}`,
      }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: 'var(--color-text-soft)' }}>
        {label}
      </p>
      <p className="text-2xl font-bold" style={{ color: accentColor }}>
        {value}
      </p>
      {sublabel && (
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-soft)' }}>
          {sublabel}
        </p>
      )}
    </div>
  )
}
