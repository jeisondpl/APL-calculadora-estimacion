import { cn } from '@/shared/lib/utils'

type Variant = 'success' | 'warning' | 'info' | 'neutral' | 'danger'

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

const STYLES: Record<Variant, { bg: string; color: string }> = {
  success: { bg: 'rgba(68,183,87,0.12)',  color: '#2D8A3E' },
  warning: { bg: 'rgba(229,104,19,0.12)', color: '#B85210' },
  info:    { bg: 'rgba(134,97,245,0.12)', color: '#6B45D4' },
  neutral: { bg: 'rgba(170,170,159,0.2)', color: 'var(--color-dark-gray)' },
  danger:  { bg: 'rgba(192,57,43,0.12)',  color: '#C0392B' },
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const { bg, color } = STYLES[variant]
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </span>
  )
}
