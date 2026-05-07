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

## 🌳 Ramas

- `main` — rama estable
- `feature/proyectos-con-actividades` — feature branch activa

## 📝 Licencia

Propiedad de INDRA. Uso interno corporativo.
