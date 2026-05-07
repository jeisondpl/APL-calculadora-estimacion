import { cn } from '@/shared/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

const PADDING = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export function Card({ children, className, padding = 'md', hoverable = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border transition-shadow duration-200',
        hoverable && 'hover:shadow-card-hover',
        PADDING[padding],
        className
      )}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card, 0 1px 4px 0 rgba(0,0,0,0.08))',
      }}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-soft)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="ml-4 shrink-0">{action}</div>}
    </div>
  )
}
