'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/shared/lib/utils'

const NAV_ITEMS = [
  { href: '/proyectos',   label: 'Proyectos',   icon: '⊡', roles: null },
  { href: '/componentes', label: 'Componentes', icon: '⊟', roles: null },
  { href: '/catalogos',   label: 'Catálogos',   icon: '⊠', roles: ['SUPERUSUARIO', 'PRODUCT_OWNER'] },
  { href: '/calculadora', label: 'Calculadora', icon: '⊞', roles: null },
  { href: '/historial',   label: 'Historial',   icon: '⊙', roles: null },
] as const

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user   = session?.user as unknown as { rol?: string } | undefined
  const rolKey = user?.rol ?? ''

  const navLinkClasses = (isActive: boolean) => cn(
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-success)]',
    isActive ? 'font-medium' : 'font-normal hover:bg-white/5 hover:text-white'
  )

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    color:           isActive ? 'var(--color-text-invert)' : 'var(--color-warm-gray)',
    backgroundColor: isActive ? 'var(--color-petroleum)' : 'transparent',
  })

  return (
    <aside
      className='w-60 shrink-0 flex flex-col min-h-screen'
      style={{ backgroundColor: 'var(--color-deep-navy)' }}
      aria-label="Navegación principal"
    >
      {/* Logo / header */}
      <div className='px-5 py-4 border-b' style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <Image
          src="/indra-logo.png"
          alt="INDRA GROUP"
          width={130}
          height={40}
          className="object-contain"
          priority
        />
        <p className='text-xs mt-2 font-medium' style={{ color: 'rgba(255,255,255,0.45)' }}>
          APL Calculadora de Estimación
        </p>
      </div>

      {/* Navegación */}
      <nav className='flex-1 px-3 py-4 space-y-0.5' aria-label="Menú de secciones">
        {NAV_ITEMS.filter(item => !item.roles || (item.roles as readonly string[]).includes(rolKey)).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={navLinkClasses(isActive)}
              style={navLinkStyle(isActive)}
            >
              <span className='text-base leading-none' aria-hidden="true">{item.icon}</span>
              {item.label}
              {isActive && <span className='ml-auto w-1.5 h-1.5 rounded-full' style={{ backgroundColor: 'var(--color-success)' }} aria-hidden="true" />}
            </Link>
          )
        })}

        {/* Admin — solo SUPERUSUARIO */}
        {rolKey === 'SUPERUSUARIO' && (
          <Link
            href='/admin/usuarios'
            aria-current={pathname.startsWith('/admin') ? 'page' : undefined}
            className={navLinkClasses(pathname.startsWith('/admin'))}
            style={navLinkStyle(pathname.startsWith('/admin'))}
          >
            <span className='text-base leading-none' aria-hidden="true">⚙</span>
            Usuarios
            {pathname.startsWith('/admin') && (
              <span className='ml-auto w-1.5 h-1.5 rounded-full' style={{ backgroundColor: 'var(--color-success)' }} aria-hidden="true" />
            )}
          </Link>
        )}
      </nav>

      {/* Footer */}
      <div className='px-6 py-4 border-t' style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className='text-xs' style={{ color: 'var(--color-dark-gray)' }}>v0.1.0</p>
      </div>
    </aside>
  )
}
