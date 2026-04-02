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
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user   = session?.user as unknown as { rol?: string } | undefined
  const rolKey = user?.rol ?? ''

  return (
    <aside className='w-60 shrink-0 flex flex-col min-h-screen' style={{ backgroundColor: 'var(--color-deep-navy)' }}>
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
      <nav className='flex-1 px-3 py-4 space-y-0.5'>
        {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(rolKey)).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors', isActive ? 'text-white font-medium' : 'font-normal hover:text-white')}
              style={{
                color:           isActive ? '#fff' : 'var(--color-warm-gray)',
                backgroundColor: isActive ? 'var(--color-petroleum)' : 'transparent',
              }}
            >
              <span className='text-base leading-none'>{item.icon}</span>
              {item.label}
              {isActive && <span className='ml-auto w-1.5 h-1.5 rounded-full' style={{ backgroundColor: 'var(--color-success)' }} />}
            </Link>
          )
        })}

        {/* Admin — solo SUPERUSUARIO */}
        {rolKey === 'SUPERUSUARIO' && (
          <Link
            href='/admin/usuarios'
            className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname.startsWith('/admin') ? 'text-white font-medium' : 'font-normal hover:text-white')}
            style={{
              color:           pathname.startsWith('/admin') ? '#fff' : 'var(--color-warm-gray)',
              backgroundColor: pathname.startsWith('/admin') ? 'var(--color-petroleum)' : 'transparent',
            }}
          >
            <span className='text-base leading-none'>⚙</span>
            Usuarios
            {pathname.startsWith('/admin') && (
              <span className='ml-auto w-1.5 h-1.5 rounded-full' style={{ backgroundColor: 'var(--color-success)' }} />
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
