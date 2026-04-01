'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

// React 19: forwardRef ya no es necesario — ref se puede pasar como prop directamente
// Mantenemos forwardRef para compatibilidad con React Hook Form
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-soft)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors',
            'placeholder:text-[var(--color-warm-gray)]',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'focus:border-[var(--color-petroleum)]',
            className
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? undefined : 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          {...props}
        />
        {error && (
          <p className="text-xs" style={{ color: '#C0392B' }}>{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs" style={{ color: 'var(--color-text-soft)' }}>{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
