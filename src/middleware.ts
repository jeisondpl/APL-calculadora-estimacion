import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC = ['/login']

// rutas accesibles solo por estos roles
const ROLE_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: '/admin',                    roles: ['SUPERUSUARIO'] },
  { prefix: '/catalogos',               roles: ['SUPERUSUARIO'] },
  { prefix: '/proyectos',               roles: ['SUPERUSUARIO', 'PRODUCT_OWNER', 'DESARROLLADOR', 'QA'] },
  { prefix: '/componentes',             roles: ['SUPERUSUARIO', 'PRODUCT_OWNER', 'DESARROLLADOR', 'QA'] },
]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC.some(p => pathname.startsWith(p))

  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (req.auth) {
    const userRol = (req.auth.user as unknown as { rol?: string })?.rol ?? ''
    for (const route of ROLE_ROUTES) {
      if (pathname.startsWith(route.prefix) && !route.roles.includes(userRol)) {
        return NextResponse.redirect(new URL('/proyectos', req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
