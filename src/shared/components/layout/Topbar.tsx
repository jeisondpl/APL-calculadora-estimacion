'use client'

import { useSession, signOut } from 'next-auth/react'

const ROL_LABELS: Record<string, string> = {
  SUPERUSUARIO:  'Super Admin',
  PRODUCT_OWNER: 'Product Owner',
  DESARROLLADOR: 'Desarrollador',
  QA:            'QA',
}

// Paleta de chips de rol (documentada en .claude/skills/indra-corporate-ui/reference.md)
// DESARROLLADOR usa petroleum de marca (mismo valor que --color-petroleum: #004254)
const ROL_COLORS: Record<string, { fg: string; bg: string }> = {
  SUPERUSUARIO:  { fg: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  PRODUCT_OWNER: { fg: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  DESARROLLADOR: { fg: 'var(--color-petroleum)', bg: 'rgba(0,66,84,0.10)' },
  QA:            { fg: '#10B981', bg: 'rgba(16,185,129,0.12)' },
}
const ROL_FALLBACK = { fg: 'var(--color-text-soft)', bg: 'rgba(170,170,159,0.18)' }

interface TopbarProps {
  title?: string
}

export function Topbar({ title }: TopbarProps) {
  const { data: session } = useSession()
  const user   = session?.user as unknown as { name?: string; email?: string; rol?: string } | undefined
  const rolKey = user?.rol ?? ''

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b shrink-0"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderColor:     'var(--color-border)',
        minHeight: '56px',
      }}
    >
      {/* Título de página */}
      <div>
        {title && (
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
        )}
      </div>

      {/* Información del usuario */}
      {user && (
        <div className="flex items-center gap-3">
          {/* Nombre + rol */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-tight" style={{ color: 'var(--color-text)' }}>
              {user.name}
            </p>
            <p className="text-xs leading-tight" style={{ color: 'var(--color-text-soft)' }}>
              {user.email}
            </p>
          </div>

          {/* Badge rol */}
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: (ROL_COLORS[rolKey] ?? ROL_FALLBACK).bg,
              color:           (ROL_COLORS[rolKey] ?? ROL_FALLBACK).fg,
            }}
            aria-label={`Rol: ${ROL_LABELS[rolKey] ?? rolKey}`}
          >
            {ROL_LABELS[rolKey] ?? rolKey}
          </span>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              backgroundColor: (ROL_COLORS[rolKey] ?? ROL_FALLBACK).fg,
              color: 'var(--color-text-invert)',
            }}
            aria-hidden="true"
          >
            {user.name?.charAt(0).toUpperCase() ?? '?'}
          </div>

          {/* Cerrar sesión */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[rgba(192,57,43,0.08)] hover:text-[#C0392B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleum"
            style={{ color: 'var(--color-text-soft)', border: '1px solid var(--color-border)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
            Salir
          </button>
        </div>
      )}
    </header>
  )
}
