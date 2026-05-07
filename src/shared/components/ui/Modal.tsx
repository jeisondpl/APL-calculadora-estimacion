'use client'

import { useEffect, useId, useRef } from 'react'
import { cn } from '@/shared/lib/utils'

interface ModalProps {
  open:      boolean
  onClose:   () => void
  title:     string
  subtitle?: string
  children:  React.ReactNode
  size?:     'sm' | 'md' | 'lg' | 'xl'
}

const SIZES = {
  sm:  'max-w-md',
  md:  'max-w-lg',
  lg:  'max-w-2xl',
  xl:  'max-w-4xl',
}

export function Modal({ open, onClose, title, subtitle, children, size = 'md' }: ModalProps) {
  const titleId    = useId()
  const subtitleId = useId()
  const panelRef   = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Bloquear scroll del body + recordar foco previo
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null
      document.body.style.overflow = 'hidden'
      // mover foco al panel al montar
      requestAnimationFrame(() => panelRef.current?.focus())
    } else {
      document.body.style.overflow = ''
      triggerRef.current?.focus?.()
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Focus trap básico
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last  = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 'var(--z-modal, 500)' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
        style={{
          backgroundColor: 'rgba(0,37,50,0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-card border shadow-xl flex flex-col max-h-[90vh]',
          'motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-200',
          'focus:outline-none',
          SIZES[size]
        )}
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div>
            <h2 id={titleId} className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="text-xs mt-0.5" style={{ color: 'var(--color-text-soft)' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-lg leading-none shrink-0 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleum rounded-md"
            style={{ color: 'var(--color-text-soft)' }}
            aria-label="Cerrar"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
