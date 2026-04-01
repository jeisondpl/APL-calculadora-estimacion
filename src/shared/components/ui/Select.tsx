'use client'

import { forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium"
            style={{ color: 'var(--color-text-soft)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors cursor-pointer',
            error
              ? 'border-red-400'
              : 'focus:border-[var(--color-petroleum)]',
            className
          )}
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: error ? undefined : 'var(--color-border)',
            color: 'var(--color-text)',
          }}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs" style={{ color: '#C0392B' }}>{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
