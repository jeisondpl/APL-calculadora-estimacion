'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/shared/lib/utils'

const NAV_ITEMS = [
  { href: '/proyectos',   label: 'Proyectos',   icon: '⊡' },
  { href: '/componentes', label: 'Componentes', icon: '⊟' },
  { href: '/catalogos',   label: 'Catálogos',   icon: '⊠' },
  { href: '/calculadora', label: 'Calculadora', icon: '⊞' },
  { href: '/historial',   label: 'Historial',   icon: '⊙' },
] as const

const ROL_LABELS: Record<string, string> = {
  SUPERUSUARIO:  'Super Admin',
  PRODUCT_OWNER: 'Product Owner',
  DESARROLLADOR: 'Desarrollador',
  QA:            'QA',
}

const ROL_COLORS: Record<string, string> = {
  SUPERUSUARIO:  '#f59e0b',
  PRODUCT_OWNER: '#3b82f6',
  DESARROLLADOR: 'var(--color-petroleum)',
  QA:            '#10b981',
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user    = session?.user as unknown as { name?: string; email?: string; rol?: string } | undefined
  const rolKey  = user?.rol ?? ''
  const rolLabel = ROL_LABELS[rolKey] ?? rolKey

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
        {NAV_ITEMS.map((item) => {
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

      {/* Usuario + Cerrar sesión */}
      <div className='px-4 py-4 border-t space-y-3' style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {user && (
          <div className='flex items-start gap-2.5'>
            {/* Avatar inicial */}
            <div
              className='w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white'
              style={{ backgroundColor: ROL_COLORS[rolKey] ?? 'var(--color-petroleum)' }}
            >
              {user.name?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className='min-w-0'>
              <p className='text-xs font-medium leading-tight truncate' style={{ color: '#fff' }}>
                {user.name}
              </p>
              <span
                className='inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded'
                style={{ backgroundColor: `${ROL_COLORS[rolKey] ?? 'var(--color-petroleum)'}22`, color: ROL_COLORS[rolKey] ?? 'var(--color-warm-gray)' }}
              >
                {rolLabel}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className='w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-red-500/10 hover:text-red-400'
          style={{ color: 'var(--color-warm-gray)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Cerrar sesión
        </button>

        <p className='text-xs' style={{ color: 'var(--color-dark-gray)' }}>v0.1.0</p>
      </div>
    </aside>
  )
}
