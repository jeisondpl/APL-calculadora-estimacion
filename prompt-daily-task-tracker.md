# Prompt para Claude Code — Daily Task Tracker

Documento generado con la skill `prompt-engineering-lab`. Contiene dos partes:

- **Parte A** — Plantilla de arquitectura reutilizable (stack INDRA-Next)
- **Parte B** — Prompt completo autocontenido para entregar a Claude Code

> **Uso rápido del Prompt B**: copia el bloque entre los marcadores `===PROMPT-FOR-CLAUDE-CODE-START===` y `===PROMPT-FOR-CLAUDE-CODE-END===`, abre una terminal en una carpeta vacía, ejecuta `claude` y pégalo.

---

# PARTE A — Documento de Arquitectura y Diseño Genérico

> Plantilla reutilizable. Guárdala como `ARQUITECTURA-PLANTILLA.md` en cualquier nuevo proyecto del stack.

## 1. Stack tecnológico (versiones canónicas)

| Capa | Librería | Versión |
|------|----------|---------|
| Runtime | Node.js | ≥ 20 |
| Framework | Next.js (App Router) | 15.x |
| UI | React / React DOM | 19.x |
| Lenguaje | TypeScript | 5.6+ |
| Estilos | Tailwind CSS | 4.x |
| PostCSS | @tailwindcss/postcss | 4.x |
| Auth | next-auth | 5.0.0-beta.30+ |
| Formularios | react-hook-form + @hookform/resolvers | 7.x / 3.x |
| Validación | Zod | 3.23+ |
| Estado | Zustand | 5.x |
| HTTP | Axios | 1.7+ |
| Gráficas | Recharts | 3.x |
| DnD | @dnd-kit/* | 6.x |
| ORM | Prisma | 6.x |
| Hash | bcryptjs | 3.x |
| DB | PostgreSQL (Neon recomendado) | 16+ |
| Package manager | pnpm | 9-10 |

## 2. Arquitectura de carpetas (Clean Architecture + Vertical Slicing)

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas públicas (login)
│   ├── (dashboard)/         # Rutas protegidas con sidebar
│   ├── api/                 # Route handlers REST
│   └── layout.tsx
│
├── modules/                 # Dominio por feature (vertical slice)
│   └── <feature>/
│       ├── domain/entities/
│       ├── application/useCases/
│       ├── infrastructure/repositories/
│       └── presentation/hooks/
│
├── shared/
│   ├── components/ui/       # Button, Card, Badge, Input, Select, Modal, Table
│   ├── components/layout/   # Sidebar, Topbar, Providers
│   └── lib/                 # utils, axios, prisma
│
├── styles/globals.css       # CSS variables + reset + scrollbar
├── views/                   # Composición por página
├── auth.config.ts           # Config Edge-safe (sin Prisma)
├── auth.ts                  # Config Node + Credentials + Prisma
└── middleware.ts            # Edge — usa auth.config.ts
```

## 3. Sistema de diseño INDRA (variante APL)

### 3.1 Paleta corporativa

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-petroleum` | `#004254` | Primario marca, botones, headers |
| `--color-deep-navy` | `#002532` | Sidebar, texto principal |
| `--color-warm-gray` | `#AAAA9F` | Texto secundario, placeholders |
| `--color-dark-gray` | `#646459` | Soft text |
| `--color-bg` | `#E3E2DA` | Fondo página (beige cálido) |
| `--color-surface` | `#FFFFFF` | Cards, modales |
| `--color-border` | `#BCBBB5` | Bordes |
| `--color-success` | `#44B757` | Verde success |
| `--color-accent-purple` | `#8661F5` | Acento info |
| `--color-accent-orange` | `#E56813` | Acento warning |

### 3.2 Tokens CSS completos (`src/styles/globals.css`)

```css
@import "tailwindcss";

:root {
  --color-petroleum:   #004254;
  --color-deep-navy:   #002532;
  --color-warm-gray:   #AAAA9F;
  --color-dark-gray:   #646459;

  --color-success:       #44B757;
  --color-accent-purple: #8661F5;
  --color-accent-orange: #E56813;

  --color-bg:      #E3E2DA;
  --color-surface: #FFFFFF;
  --color-border:  #BCBBB5;

  --color-text:        #002532;
  --color-text-soft:   #646459;
  --color-text-invert: #FFFFFF;

  --font-sans: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', system-ui, sans-serif;

  --z-dropdown: 100; --z-sticky: 200; --z-fixed: 300;
  --z-modal-backdrop: 400; --z-modal: 500; --z-toast: 800;

  --shadow-card:       0 1px 4px 0 rgba(0, 0, 0, 0.08);
  --shadow-card-hover: 0 4px 16px 0 rgba(0, 36, 50, 0.12);
}

*, *::before, *::after { box-sizing: border-box; }
html, body { height: 100%; }
body {
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-warm-gray); }

:focus-visible {
  outline: 2px solid var(--color-petroleum);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 3.3 Tailwind config (`tailwind.config.ts`)

```ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/views/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        petroleum:   '#004254',
        'deep-navy': '#002532',
        'warm-gray': '#AAAA9F',
        'dark-gray': '#646459',
        accent: { green: '#44B757', purple: '#8661F5', orange: '#E56813' },
        neutral: { warm: '#E3E2DA', light: '#BCBBB5' },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '12px' },
      boxShadow: {
        card:         '0 1px 4px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px 0 rgba(0,36,50,0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

### 3.4 Paleta de estados (badges)

| Estado | BG (rgba) | Texto |
|--------|-----------|-------|
| Success | `rgba(68,183,87,0.12)` | `#2D8A3E` |
| Warning | `rgba(229,104,19,0.12)` | `#B85210` |
| Info | `rgba(134,97,245,0.12)` | `#6B45D4` |
| Neutral | `rgba(170,170,159,0.2)` | `#646459` |
| Danger | `rgba(192,57,43,0.12)` | `#C0392B` |

### 3.5 Convenciones de UI

- **Border radius**: `rounded-md` (6px) botones small, `rounded-lg` (8px) inputs/botones, `rounded-card` (12px) cards/modales, `rounded-full` badges
- **Sidebar**: bg `var(--color-deep-navy)`, items activos `bg-petroleum` + dot success
- **Table header**: `bg-petroleum` con texto blanco al 85%
- **Modal backdrop**: `rgba(0,37,50,0.55)` + `backdrop-filter: blur(2px)` con `-webkit-` prefix
- **Focus**: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleum`

## 4. Patrón Auth (NextAuth v5 + Edge-safe split)

### 4.1 `src/auth.config.ts` (Edge — sin Prisma, sin bcrypt)

```ts
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.rol    = (user as any).rol
        token.userId = Number((user as any).id)
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).rol    = token.rol
        (session.user as any).userId = token.userId
      }
      return session
    },
  },
} satisfies NextAuthConfig
```

### 4.2 `src/auth.ts` (Node — con Prisma y bcrypt)

```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/shared/lib/prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        try {
          const email = credentials?.email as string
          const password = credentials?.password as string
          if (!email || !password) return null
          const usuario = await prisma.usuario.findUnique({
            where: { email }, include: { rol: true },
          })
          if (!usuario || !usuario.activo) return null
          const ok = await bcrypt.compare(password, usuario.passwordHash)
          if (!ok) return null
          return {
            id: String(usuario.id), name: usuario.nombre,
            email: usuario.email, rol: usuario.rol.nombre,
          }
        } catch (err) {
          console.error('[auth] authorize threw:', err)
          return null
        }
      },
    }),
  ],
})
```

### 4.3 `src/middleware.ts` (Edge — usa SOLO authConfig)

```ts
import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/auth.config'

const { auth } = NextAuth(authConfig)
const PUBLIC = ['/login']

export default auth((req) => {
  const isPublic = PUBLIC.some(p => req.nextUrl.pathname.startsWith(p))
  if (!req.auth && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'],
}
```

## 5. Patrón Prisma + Neon (pooled + unpooled)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")  // Pooled — runtime serverless
  directUrl = env("DIRECT_URL")    // Unpooled — migraciones
}
```

## 6. Configuración Vercel (`vercel.json`)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "buildCommand": "pnpm prisma generate && pnpm next build",
  "installCommand": "pnpm install --frozen-lockfile",
  "regions": ["iad1"]
}
```

## 7. Next.js config (`next.config.ts`)

```ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: { remotePatterns: [] },
}
export default nextConfig
```

## 8. Variables de entorno (`.env.example`)

```env
# Local (Docker o Neon)
DATABASE_URL="postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://user:pass@host.region.aws.neon.tech/db?sslmode=require&channel_binding=require"

# Auth (generar con: openssl rand -base64 32)
AUTH_SECRET="cambiar-en-produccion"

# API pública
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
# En Vercel: https://<proyecto>.vercel.app/api
```

## 9. `.gitignore` (mínimos críticos)

```
node_modules/
.next/
out/
build/
.env
.env.*
!.env.example
.vercel
next-env.d.ts
```

## 10. Convenciones de código

- **Alias**: `@/*` → `./src/*` (en `tsconfig.json`)
- **Estilos en componentes**: preferir `var(--color-*)` o utilidades Tailwind extendidas, **nunca** hex de marca hardcoded
- **Comentarios**: solo cuando el WHY no es obvio
- **Hooks**: prefijo `use*`, PascalCase para componentes, camelCase para hooks
- **API endpoints**: kebab-case en URL (`/api/listas-tareas`)

## 11. Checklist de bootstrap para nuevos proyectos

- [ ] `pnpm create next-app@15` con TS + Tailwind + App Router + src
- [ ] Instalar dependencias core
- [ ] Configurar `tailwind.config.ts` y `globals.css` con tokens
- [ ] Crear estructura Clean Architecture
- [ ] Configurar Prisma con `directUrl`
- [ ] Implementar auth split (config + ts + middleware)
- [ ] Crear UI base (Button, Card, Input, Select, Modal, Table)
- [ ] Layout dashboard (Sidebar + Topbar)
- [ ] Configurar Vercel + Neon
- [ ] Seed inicial con admin
- [ ] Documentación (README, diseno.md, plantilla-qa-tabla.md)

---

# PARTE B — Prompt completo para Claude Code

> **Cómo usarlo:** crea una carpeta vacía nueva, abre `claude` dentro, y pega todo el bloque siguiente (entre los marcadores `===PROMPT-FOR-CLAUDE-CODE-START===` y `===PROMPT-FOR-CLAUDE-CODE-END===`).

```markdown
===PROMPT-FOR-CLAUDE-CODE-START===

# ROLE
Eres un **Senior Fullstack Architect** especializado en Next.js 15 + React 19
+ TypeScript + Prisma + PostgreSQL, con dominio del sistema de diseño
corporativo INDRA (variante APL Calculadora). Conoces a fondo:
- Clean Architecture + Vertical Slicing
- NextAuth v5 con split Edge-safe / Node runtime
- Despliegue en Vercel + Neon Postgres
- WCAG 2.1 AA y compatibilidad cross-browser

# OBJECTIVE
Construir desde cero un proyecto **"daily-task-tracker"** que permita registrar
tareas diarias en un timeline horario tipo planilla Excel (franjas 8:00 a
18:00 cada 30 min), con CRUD completo, autenticación, persistencia en
PostgreSQL y deploy en Vercel.

## Referencia visual del feature principal

```
| fecha      | Tarea       | 8:00 | 8:30 | 9:00 | 9:30 | 10:00 | ... | 18:00 |
|-----------|-------------|------|------|------|------|-------|-----|-------|
| 01/06/2026| Colsubsidio | ████ | ████ |      |      |       |     |       |
| 01/06/2026| Agente      |      |      | ████ |      |       |     |       |
| 01/06/2026| ODTT-32310  |      |      |      | ████ | ████  |     |       |
| 01/06/2026| Almuerzo    |      |      |      |      |       |████ |       |  ← rojo
```

Cada tarea = una fila. Cada celda = un slot de 30 min. Si `hora_inicio` ≤
slot < `hora_fin`, la celda se pinta con `color` de la tarea.

# CONTEXT

## Stack obligatorio (versiones)

| Capa | Librería | Versión |
|------|----------|---------|
| Framework | Next.js (App Router) | 15.x |
| UI | React / React DOM | 19.x |
| TypeScript | | 5.6+ |
| Estilos | Tailwind CSS | 4.x |
| ORM | Prisma | 6.x |
| DB | PostgreSQL | 16+ |
| Auth | next-auth | 5.0.0-beta.30+ |
| Forms | react-hook-form + @hookform/resolvers | 7.x / 3.x |
| Validación | Zod | 3.23+ |
| Estado | Zustand | 5.x |
| HTTP | Axios | 1.7+ |
| Hash | bcryptjs | 3.x |
| Package manager | pnpm | 9-10 |

## Estructura de carpetas obligatoria

```
src/
├── app/(auth)/login/page.tsx
├── app/(dashboard)/
│   ├── layout.tsx
│   ├── tareas/page.tsx
│   └── listas/page.tsx
├── app/api/
│   ├── auth/[...nextauth]/route.ts
│   ├── tareas/route.ts
│   ├── tareas/[id]/route.ts
│   ├── listas-tareas/route.ts
│   └── listas-tareas/[id]/route.ts
├── modules/
│   ├── tareas/
│   │   ├── domain/entities/Tarea.entities.ts
│   │   ├── application/useCases/
│   │   ├── infrastructure/apiTareasRepository.ts
│   │   └── presentation/hooks/useTareasController.ts
│   └── listas-tareas/ (misma estructura)
├── shared/
│   ├── components/ui/{Button,Card,Badge,Input,Select,Modal,Table,PageHeader}.tsx
│   ├── components/layout/{Sidebar,Topbar,Providers}.tsx
│   └── lib/{prisma,axios,utils}.ts
├── styles/globals.css
├── views/
│   ├── Tareas/TareasTimelineView.tsx
│   ├── Tareas/AgregarTareaForm.tsx
│   └── Listas/ListasView.tsx
├── auth.config.ts
├── auth.ts
└── middleware.ts
```

# DATA MODEL

## Schema Prisma completo (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Rol {
  id       Int       @id @default(autoincrement())
  nombre   String    @unique @db.VarChar(50)
  usuarios Usuario[]

  @@map("roles")
}

model Usuario {
  id           Int      @id @default(autoincrement())
  nombre       String   @db.VarChar(200)
  email        String   @unique @db.VarChar(200)
  passwordHash String   @map("password_hash")
  activo       Boolean  @default(true)
  rolId        Int      @map("rol_id")
  rol          Rol      @relation(fields: [rolId], references: [id])
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt      @map("updated_at")

  listasTareas ListaTarea[]
  tareas       Tarea[]

  @@map("usuarios")
}

model ListaTarea {
  id            Int      @id @default(autoincrement())
  nombre        String   @db.VarChar(200)
  descripcion   String?  @db.Text
  colorDefault  String   @default("#10B981") @map("color_default") @db.VarChar(20)
  ownerId       Int      @map("owner_id")
  owner         Usuario  @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  createdAt     DateTime @default(now()) @map("fecha_creacion")
  updatedAt     DateTime @updatedAt      @map("updated_at")

  tareas        Tarea[]

  @@index([ownerId])
  @@map("listas_tareas")
}

model Tarea {
  id           Int      @id @default(autoincrement())
  listaId      Int      @map("lista_id")
  lista        ListaTarea @relation(fields: [listaId], references: [id], onDelete: Cascade)
  ownerId      Int      @map("owner_id")
  owner        Usuario  @relation(fields: [ownerId], references: [id], onDelete: Cascade)

  fecha        DateTime @db.Date
  nombre       String   @db.VarChar(300)
  descripcion  String?  @db.Text
  horaInicio   String   @map("hora_inicio") @db.VarChar(5)  // "HH:MM"
  horaFin      String   @map("hora_fin")    @db.VarChar(5)
  color        String   @default("#10B981") @db.VarChar(20)
  completada   Boolean  @default(false)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt      @map("updated_at")

  @@index([listaId])
  @@index([ownerId, fecha])
  @@map("tareas")
}
```

## Validación de horas
- `horaInicio` y `horaFin` en formato `HH:MM` (24h)
- Validar con Zod: `/^(0[8-9]|1[0-8]):(00|30)$/` (solo slots de 00 o 30, 08:00 a 18:00)
- `horaFin > horaInicio`

# WORKFLOW (ejecutar en orden, sin saltar fases)

## Fase 1 — Bootstrap del proyecto

1. `pnpm create next-app@15 daily-task-tracker --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm`
2. `cd daily-task-tracker`
3. Instalar dependencias:
   ```bash
   pnpm add next-auth@5.0.0-beta.30 @prisma/client@^6 bcryptjs@^3 \
            react-hook-form@^7 @hookform/resolvers@^3 zod@^3 \
            zustand@^5 axios@^1.7
   pnpm add -D prisma@^6 @types/bcryptjs tsx
   ```
4. `pnpm prisma init`

## Fase 2 — Sistema de diseño

Crear `src/styles/globals.css` con el bloque `:root` completo (sección "Tokens
CSS" abajo). Importar en `src/app/layout.tsx`.

Crear `tailwind.config.ts` con el bloque `theme.extend` completo (sección
"Tailwind config" abajo).

## Fase 3 — Schema y migraciones

1. Reemplazar `prisma/schema.prisma` con el schema completo de DATA MODEL
2. Ejecutar `pnpm prisma migrate dev --name init`
3. Crear `prisma/seed.ts` con: 1 rol ADMIN, 1 usuario admin
   (`admin@local` / `Demo2026!`), 2 listas de ejemplo, 5 tareas de ejemplo
   para la fecha de hoy con diferentes colores
4. Agregar script `db:seed` en package.json
5. Ejecutar el seed

## Fase 4 — Autenticación

Crear los 3 archivos exactamente como en las secciones "Auth Split" más
abajo:
- `src/auth.config.ts` (Edge-safe)
- `src/auth.ts` (Node + Prisma)
- `src/middleware.ts` (Edge)

## Fase 5 — Componentes UI base

Crear `src/shared/components/ui/`:
- `Button.tsx` (variants: primary/secondary/ghost/danger; sizes: sm/md/lg;
  focus-visible: outline 2 petroleum; hovers semánticos por variante)
- `Card.tsx` (rounded-card, shadow-card, prop `hoverable`)
- `Input.tsx` (focus-visible ring, aria-invalid, aria-describedby,
  role="alert" en error)
- `Select.tsx` (mismo patrón que Input)
- `Modal.tsx` (role="dialog", aria-modal="true", aria-labelledby, focus
  trap básico, restore focus on close, prefijo -webkit-backdrop-filter)
- `Table.tsx` (header petroleum, zebra warm, scope="col")
- `Badge.tsx` (5 variantes con rgba semánticas)
- `PageHeader.tsx` (title + subtitle + actions)

Crear `src/shared/components/layout/`:
- `Sidebar.tsx` (bg deep-navy, items activos petroleum + dot success,
  aria-label "Navegación principal", aria-current en activo)
- `Topbar.tsx` (min-h 56px, chip de rol, botón salir con focus-visible)
- `Providers.tsx` (SessionProvider)

## Fase 6 — Módulo Tareas (Clean Arch completo)

`src/modules/tareas/domain/entities/Tarea.entities.ts`:
```ts
export interface ITarea {
  id: number
  listaId: number
  listaNombre?: string
  ownerId: number
  fecha: string          // ISO YYYY-MM-DD
  nombre: string
  descripcion?: string | null
  horaInicio: string     // HH:MM
  horaFin: string        // HH:MM
  color: string
  completada: boolean
  createdAt: string
  updatedAt: string
}

export interface ICreateTareaDTO {
  listaId: number
  fecha: string
  nombre: string
  horaInicio: string
  horaFin: string
  color?: string
  descripcion?: string
}
```

`src/modules/tareas/infrastructure/apiTareasRepository.ts`: usa Axios con
baseURL `/api`, métodos: `list(filters)`, `getById(id)`, `create(dto)`,
`update(id, dto)`, `delete(id)`, `toggleCompletada(id)`.

`src/modules/tareas/presentation/hooks/useTareasController.ts`: hook
con estado `tareas`, `loading`, `error`, métodos `_list`, `_create`,
`_update`, `_delete`, `_toggle`.

(Mismo patrón para módulo `listas-tareas`.)

## Fase 7 — API Routes

`src/app/api/tareas/route.ts`:
- `GET`: query params `?fecha=YYYY-MM-DD` o `?desde=&hasta=`, retorna
  tareas del usuario logueado (obtener `ownerId` con `await auth()`)
- `POST`: valida body con Zod schema, crea tarea

`src/app/api/tareas/[id]/route.ts`:
- `GET`: detalle (404 si no es del usuario)
- `PUT`: update (revalidar con Zod)
- `DELETE`: hard delete

(Mismo patrón para `/api/listas-tareas`.)

Todas las rutas usan `await auth()` para obtener el usuario y filtrar
por `ownerId`. Si no hay sesión, retornar 401.

## Fase 8 — Vista principal: Timeline horario

Crear `src/views/Tareas/TareasTimelineView.tsx`:

```tsx
'use client'
import { useMemo } from 'react'
import type { ITarea } from '@/modules/tareas/domain/entities/Tarea.entities'

const SLOTS = generateSlots('08:00', '18:00', 30)

function generateSlots(from: string, to: string, stepMin: number): string[] {
  const out: string[] = []
  const [fh, fm] = from.split(':').map(Number)
  const [th, tm] = to.split(':').map(Number)
  let cur = fh * 60 + fm
  const end = th * 60 + tm
  while (cur < end) {
    const h = Math.floor(cur / 60), m = cur % 60
    out.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    cur += stepMin
  }
  return out
}

function slotInRange(slot: string, hIni: string, hFin: string): boolean {
  return slot >= hIni && slot < hFin
}

interface Props { tareas: ITarea[]; fecha: string }

export function TareasTimelineView({ tareas }: Props) {
  return (
    <div
      className="overflow-x-auto rounded-lg border"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr style={{ backgroundColor: 'var(--color-petroleum)', color: 'var(--color-text-invert)' }}>
            <th scope="col" className="px-3 py-2 text-left w-32 font-medium">Fecha</th>
            <th scope="col" className="px-3 py-2 text-left w-40 font-medium">Tarea</th>
            {SLOTS.map(s => (
              <th key={s} scope="col" className="px-1 py-2 text-center w-14 font-medium">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tareas.map(t => (
            <tr key={t.id} className="border-t" style={{ borderColor: 'var(--color-border)' }}>
              <td className="px-3 py-1.5" style={{ color: 'var(--color-text-soft)' }}>
                {new Date(t.fecha).toLocaleDateString('es-ES', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </td>
              <td className="px-3 py-1.5 font-medium" style={{ color: 'var(--color-text)' }}>
                {t.nombre}
              </td>
              {SLOTS.map(s => {
                const active = slotInRange(s, t.horaInicio, t.horaFin)
                return (
                  <td
                    key={s}
                    className="p-0 h-7"
                    style={{
                      backgroundColor: active ? t.color : 'transparent',
                      borderLeft: '1px solid var(--color-border)',
                    }}
                    aria-label={active ? `${t.nombre} a las ${s}` : undefined}
                  />
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Fase 9 — Form rápido de agregar

Crear `src/views/Tareas/AgregarTareaForm.tsx` con react-hook-form + Zod:

```tsx
const schema = z.object({
  listaId:    z.coerce.number().int().positive(),
  fecha:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nombre:     z.string().min(1).max(300),
  horaInicio: z.string().regex(/^(0[8-9]|1[0-8]):(00|30)$/),
  horaFin:    z.string().regex(/^(0[8-9]|1[0-8]):(00|30)$/),
}).refine(d => d.horaFin > d.horaInicio, {
  message: 'hora fin debe ser mayor a hora inicio',
  path: ['horaFin'],
})
```

Layout horizontal con grid: `[Lista] [Fecha] [Tarea] [Desde] [Hasta] [+ Agregar]`

## Fase 10 — Vercel + Neon

Crear `vercel.json`, `next.config.ts`, `.env.example` exactamente como
las secciones más abajo.

Crear `.gitignore` mínimo con `.env.*` + `!.env.example`.

## Fase 11 — Documentación

Crear:
- `README.md`: stack, instalación, deploy paso a paso (Neon + Vercel),
  credenciales de prueba
- `diseno.md`: paleta corporativa, tokens, convenciones UI
- `plantilla-qa-tabla.md`: formato tabular con columnas:
  No.|Tester|Fecha|Módulo|Tipo|Severidad|Prioridad|Descripción|
  Pasos|Esperado|Obtenido|Evidencia|Estado|Asignado|Resuelto|Comentarios

## Fase 12 — Validación final

Ejecutar y verificar:
1. `pnpm prisma validate` → OK
2. `pnpm next build` → sin errores
3. `pnpm tsx prisma/seed.ts` → 1 admin + 2 listas + 5 tareas
4. `pnpm dev` → login con `admin@local`/`Demo2026!` funciona
5. Timeline renderiza las 5 tareas con bloques coloreados en los slots correctos
6. Form de agregar crea tarea y aparece inmediatamente en el timeline
7. CRUD completo de listas funciona (crear/editar/eliminar)

# CONSTRAINTS

## MUST
- ✅ Usar PNPM (no npm ni yarn)
- ✅ Auth split: middleware Edge nunca importa Prisma ni bcrypt
- ✅ TODOS los componentes interactivos con `focus-visible`
- ✅ Modal con `role="dialog"` + `aria-modal` + `aria-labelledby` + focus trap
- ✅ Table con `scope="col"`
- ✅ Slots horarios exactamente de 30 min entre 08:00 y 18:00 (20 slots)
- ✅ Tokens via `var(--color-*)` — cero hex de marca hardcoded en componentes
- ✅ `serverExternalPackages: ['@prisma/client', 'bcryptjs']` en next.config
- ✅ `directUrl` en schema.prisma
- ✅ `.gitignore` cubre `.env.*` con excepción `!.env.example`
- ✅ Manejo de errores en `authorize()` con try/catch y console.error
- ✅ Todas las rutas /api/* filtran por `ownerId` del usuario logueado

## MUST NOT
- ❌ Tailwind v3 (debe ser v4 con `@import "tailwindcss"`)
- ❌ Pages Router (solo App Router)
- ❌ Material-UI, Chakra, daisyUI u otros design systems
- ❌ JSX inline styles con hex hardcoded — usar tokens o clases Tailwind
- ❌ `any` en TypeScript salvo casts justificados con comentario
- ❌ Comentarios redundantes que describan QUÉ hace el código

# ACCEPTANCE CRITERIA (verificables binariamente)

| # | Criterio | Cómo verificar |
|---|----------|----------------|
| AC-01 | `prisma validate` retorna OK | `pnpm prisma validate` |
| AC-02 | `next build` sin errores | `pnpm next build` |
| AC-03 | Cero hex marca hardcoded en componentes | `grep -rE "['\"]#(004254\|002532\|AAAA9F)['\"]" src/shared src/views` → 0 |
| AC-04 | Middleware bundle < 200 KB | output del build |
| AC-05 | `auth.config.ts` no importa Prisma ni bcrypt | `grep -E "prisma\|bcrypt" src/auth.config.ts` → 0 |
| AC-06 | Modal tiene role/aria-modal/aria-labelledby | inspección |
| AC-07 | Table con scope="col" | grep |
| AC-08 | `focus-visible` en Button/Input/Select/Modal/Sidebar/Topbar | grep |
| AC-09 | globals.css incluye `prefers-reduced-motion` | grep |
| AC-10 | Modal con `WebkitBackdropFilter` (Safari) | grep |
| AC-11 | Schema Prisma tiene `directUrl` | grep |
| AC-12 | Seed crea 1 admin + 2 listas + 5 tareas | ejecutar y verificar |
| AC-13 | Timeline renderiza 20 columnas (08:00-17:30) | inspección DOM |
| AC-14 | Form agregar valida hora_fin > hora_inicio con Zod | inspección código |
| AC-15 | API rutas filtran por ownerId | `grep "ownerId" src/app/api` |

# OUTPUT FORMAT

Entrega en este orden:

## A) Resumen ejecutivo (≤200 palabras)
Qué se creó, archivos clave, decisiones tomadas, riesgos.

## B) Árbol de archivos generados
Lista jerárquica con anotaciones breves de propósito.

## C) Snippets clave de código
Schema completo, auth.config + auth + middleware, timeline view, agregar form.

## D) Reporte de cumplimiento de Acceptance Criteria
Tabla con AC-01 a AC-15, estado `✅`/`⚠️`/`❌` y evidencia.

## E) Instrucciones de deploy
Paso a paso para Vercel + Neon:
1. Crear proyecto Neon (Postgres 17, región AWS us-east-1)
2. Copiar pooled connection string como DATABASE_URL
3. Copiar unpooled connection string como DIRECT_URL
4. Push a GitHub
5. Importar en Vercel
6. Agregar env vars (DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL,
   NEXT_PUBLIC_API_URL) — todas Production and Preview
7. Correr `pnpm prisma migrate deploy` localmente apuntando a Neon
8. Correr `pnpm tsx prisma/seed.ts`
9. Verificar login

# SELF-CRITIQUE LOOP

Tras generar la salida, antes de terminar:
1. ¿Algún AC quedó `⚠️` o `❌`? Explica y arregla
2. ¿Hay imports de Prisma o bcrypt en `auth.config.ts` o `middleware.ts`?
3. ¿Schema Prisma valida? ¿El seed corre sin error?
4. ¿El timeline maneja correctamente tareas que cruzan exactamente las 18:00?
5. ¿Hay edge cases sin manejar (tarea sin lista, fecha inválida)?
6. ¿Las API routes verifican ownerId antes de update/delete?

Si encuentras hallazgos, **itera y entrega versión corregida**.

===PROMPT-FOR-CLAUDE-CODE-END===
```

---

# Cómo usar este documento

## Para arrancar el proyecto `daily-task-tracker`

1. **Crea una carpeta vacía** en cualquier lugar:
   ```powershell
   mkdir C:\dev\daily-task-tracker
   cd C:\dev\daily-task-tracker
   ```

2. **Abre Claude Code** en esa carpeta:
   ```powershell
   claude
   ```

3. **Copia el bloque del Prompt B completo** (entre los marcadores `===PROMPT-FOR-CLAUDE-CODE-START===` y `===PROMPT-FOR-CLAUDE-CODE-END===`) y **pégalo** en Claude Code.

4. Claude Code ejecutará las 12 fases automáticamente. Tarda ~10-20 min.

5. Al terminar tendrás un repo funcional listo para:
   - `git init` + push a GitHub
   - Crear proyecto en Neon (Postgres)
   - Importar en Vercel + configurar 5 env vars
   - Deploy 🚀

## Para futuros proyectos

Usa la **Parte A** como base de cualquier nuevo proyecto que comparta este stack. Solo cambia:
- El feature principal (sustituir "task tracker" por lo que sea)
- El schema Prisma (tablas del nuevo dominio)
- Las API routes correspondientes
- La vista principal

El resto (auth split, sistema de diseño, deploy, accesibilidad, cross-browser) se replica idéntico.

## Refinamientos opcionales para v2

- Drag-to-resize de bloques en el timeline (`@dnd-kit`)
- Vista semanal (5 días lado a lado)
- Export PDF/Excel del timeline
- Notificaciones de inicio/fin de tarea
- Categorías/etiquetas por lista
- Tema oscuro

---

**Generado con la skill `prompt-engineering-lab`** aplicando:
- Role-based scaffolding (Boonstra 2025)
- Chain-of-Thought por fases (The Prompt Report 2025)
- Few-shot grounding inline (snippets exactos embebidos)
- Constraint-driven prompting (MUST/MUST NOT)
- Self-critique loop final
