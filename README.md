# APL-calculadora-estimacion

Aplicación web corporativa de **INDRA** para gestión de estimaciones, proyectos y seguimiento de actividades por desarrollador.

## 🛠️ Stack tecnológico

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript 5.6
- **Estilos:** Tailwind CSS 4 + sistema de diseño corporativo INDRA
- **Auth:** NextAuth 5
- **Formularios:** React Hook Form + Zod
- **Estado:** Zustand
- **HTTP:** Axios
- **ORM:** Prisma + PostgreSQL
- **Visualización:** Recharts
- **DnD:** @dnd-kit
- **IA:** OpenAI (asistente operacional + RAG sobre documentos MAU)

## 📦 Instalación

```bash
pnpm install
cp .env.example .env.local   # configurar variables
pnpm prisma generate
pnpm prisma migrate dev
pnpm dev
```

App disponible en `http://localhost:3000`.

## 📁 Arquitectura

Clean Architecture + Vertical Slicing:

```
src/
├── app/              # Next.js App Router (rutas)
├── modules/          # Dominio por feature (catalogos, componentes, estimacion, proyectos)
│   └── <modulo>/
│       ├── domain/        # Entities, interfaces
│       ├── application/   # Use cases
│       ├── infrastructure/ # Repositories
│       └── presentation/   # Hooks, controllers
├── shared/           # ui/, layout/, lib/, hooks/
├── styles/globals.css
└── views/            # Composición de páginas
```

## 🧩 Módulos principales

- **Calculadora de estimación** — selección de componentes, cantidades, cálculo de tiempos (Base, Copilot, TME)
- **Proyectos** — gestión de proyectos derivados de estimaciones
- **Actividades** — asignación de desarrolladores, fechas, dependencias, reordenamiento
- **Tab Progreso** — gráficas de avance global, por desarrollador (barras y donuts)
- **Gantt** — línea de tiempo de actividades
- **Asistente IA** — generación de notas Jira, consultas operacionales, carga de MAU
- **Administración** — gestión de usuarios y roles (SUPERUSUARIO, PRODUCT_OWNER, DESARROLLADOR, QA)

## 🎨 Sistema de diseño

Documentación completa en [`diseno.md`](./diseno.md) y skill local en [`.claude/skills/indra-corporate-ui/`](./.claude/skills/indra-corporate-ui/).

Paleta corporativa principal:
- `petroleum #004254` — primario de marca
- `deep-navy #002532` — sidebar, texto principal
- `bg #E3E2DA` — fondo de página (beige cálido)
- `success #44B757`, `accent-purple #8661F5`, `accent-orange #E56813` — acentos

## ✅ QA

Plantillas para registro de hallazgos:
- [`plantilla-qa.md`](./plantilla-qa.md) — formato ficha por bug/recomendación
- [`plantilla-qa-tabla.md`](./plantilla-qa-tabla.md) — formato tabular consolidado

## 🚀 Deploy en Vercel + Neon

### 1. Crear base de datos en Neon

- Crear proyecto en [neon.tech](https://neon.tech) — región **AWS US East 1 (N. Virginia)** + Postgres 17
- Copiar el **connection string** con pooling activado (acaba en `-pooler.c-7.us-east-1.aws.neon.tech`)

### 2. Importar repo en Vercel

- New Project → Import desde GitHub `jeisondpl/APL-calculadora-estimacion` rama `main`
- Application Preset: **Next.js** (auto-detectado por `vercel.json`)

### 3. Variables de entorno en Vercel

| Variable | Valor | Origen |
|----------|-------|--------|
| `DATABASE_URL` | Neon **pooled** (host con `-pooler`) | Connect → toggle "Connection pooling" **ON** |
| `DIRECT_URL` | Neon **unpooled** (host sin `-pooler`) | Connect → toggle "Connection pooling" **OFF** |
| `AUTH_SECRET` | Generar con `openssl rand -base64 32` | Local |
| `AUTH_URL` | URL final del proyecto (ej. `https://apl-calculadora-estimacion-xxxx.vercel.app`) | Vercel asigna tras 1er deploy |
| `NEXT_PUBLIC_API_URL` | Misma URL + `/api` | Vercel |

> **Por qué dos URLs:**
> - `DATABASE_URL` (pooled) optimiza conexiones efímeras de funciones serverless en runtime.
> - `DIRECT_URL` (unpooled) es necesaria para `prisma migrate` — Prisma Migrate usa prepared statements que el pooler no soporta.

### 4. Migraciones Prisma

`vercel.json` ejecuta `prisma generate` en cada build. Para aplicar **migraciones** a Neon, una opción:

**A) Desde tu máquina (recomendado para 1ª vez):**

```powershell
$env:DIRECT_URL="<unpooled-connection-string>"
$env:DATABASE_URL="<pooled-connection-string>"
pnpm prisma migrate deploy
```

**B) En el build de Vercel (CI):** cambiar `buildCommand` en `vercel.json` a:

```json
"buildCommand": "pnpm prisma migrate deploy && pnpm prisma generate && pnpm next build"
```

Esto requiere que `DIRECT_URL` esté configurada en Vercel (paso 3).

## 🌳 Ramas

- `main` — rama estable (la que despliega Vercel)
- `feature/proyectos-con-actividades` — feature branch activa

## 📝 Licencia

Propiedad de INDRA. Uso interno corporativo.
