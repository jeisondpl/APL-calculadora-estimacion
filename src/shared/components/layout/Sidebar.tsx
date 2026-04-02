'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/shared/lib/utils'

const NAV_ITEMS = [
  {
    href: '/proyectos',
    label: 'Proyectos',
    icon: '⊡',
  },
  {
    href: '/componentes',
    label: 'Componentes',
    icon: '⊟',
  },
  {
    href: '/catalogos',
    label: 'Catálogos',
    icon: '⊠',
  },
  {
    href: '/calculadora',
    label: 'Calculadora',
    icon: '⊞',
  },
  {
    href: '/historial',
    label: 'Historial',
    icon: '⊙',
  },
] as const

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className='w-60 shrink-0 flex flex-col min-h-screen' style={{ backgroundColor: 'var(--color-deep-navy)' }}>
      {/* Logo / header */}
      <div className='px-6 py-5 border-b' style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <span className='text-xs font-semibold uppercase tracking-widest' style={{ color: 'var(--color-warm-gray)' }}>
          INDRA
        </span>
        <h1 className='text-sm font-semibold mt-0.5 leading-tight' style={{ color: 'var(--color-text-invert)' }}>
          APL Calculadora
          <br />
          <span style={{ color: 'var(--color-warm-gray)', fontWeight: 400 }}>Estimación</span>
        </h1>
      </div>

      {/* Navegación */}
      <nav className='flex-1 px-3 py-4 space-y-0.5'>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', isActive ? 'text-white font-medium' : 'font-normal hover:text-white')}
              style={{
                color: isActive ? '#fff' : 'var(--color-warm-gray)',
                backgroundColor: isActive ? 'var(--color-petroleum)' : 'transparent',
              }}
            >
              <span className='text-base leading-none'>{item.icon}</span>
              {item.label}
              {isActive && <span className='ml-auto w-1.5 h-1.5 rounded-full' style={{ backgroundColor: 'var(--color-success)' }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className='px-6 py-4 border-t' style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className='text-xs' style={{ color: 'var(--color-dark-gray)' }}>
          v0.1.0
        </p>
      </div>
    </aside>
  )
}
