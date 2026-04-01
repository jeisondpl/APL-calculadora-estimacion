'use client'

import { cn } from '@/shared/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary:   'text-white border-transparent',
  secondary: 'border bg-white',
  ghost:     'border-transparent bg-transparent',
  danger:    'text-white border-transparent',
}

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  const inlineStyle: React.CSSProperties =
    variant === 'primary'   ? { backgroundColor: 'var(--color-petroleum)' } :
    variant === 'danger'    ? { backgroundColor: '#C0392B' } :
    variant === 'secondary' ? { borderColor: 'var(--color-border)', color: 'var(--color-text)' } :
    { color: 'var(--color-text-soft)' }

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium border transition-opacity cursor-pointer',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      style={inlineStyle}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
