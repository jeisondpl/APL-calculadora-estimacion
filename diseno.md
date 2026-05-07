# Sistema de Diseño — APL Calculadora de Estimación (INDRA)

Guía completa para replicar la identidad visual, tokens, componentes y convenciones de este proyecto en otro desarrollo.

---

## 1. Stack tecnológico

| Capa | Librería | Versión |
|------|----------|---------|
| Framework | Next.js (App Router) | 15.0.0 |
| UI | React / React DOM | 19.0.0 |
| Lenguaje | TypeScript | 5.6.0 |
| Estilos | Tailwind CSS | 4.0.0 |
| PostCSS | `@tailwindcss/postcss` | 4.0.0 |
| Auth | next-auth | 5.0.0-beta |
| Formularios | react-hook-form + @hookform/resolvers | 7.54 / 3.9 |
| Validación | Zod | 3.23 |
| Estado | Zustand | 5.0 |
| HTTP | Axios | 1.7 |
| Gráficas | Recharts | 3.8.1 |
| DnD | @dnd-kit | — |
| ORM | Prisma | 6.0 |

---

## 2. Paleta de colores (Marca INDRA)

### 2.1 Colores primarios de marca

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Petroleum** (primario) | `#004254` | Sidebar, botones primarios, headers tabla, texto destacado |
| **Deep Navy** | `#002532` | Texto principal, overlays, variante oscura |
| **Warm Gray** | `#AAAA9F` | Texto secundario, placeholders, estados disabled |
| **Dark Gray** | `#646459` | Texto soft, labels secundarios |

### 2.2 Acentos

| Nombre | Hex | Uso |
|--------|-----|-----|
| Success (Green) | `#44B757` | Éxito, checks |
| Purple | `#8661F5` | Acento informativo |
| Orange | `#E56813` | Advertencias / en progreso |

### 2.3 Neutros / superficies

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-bg` | `#E3E2DA` | Fondo de página (beige cálido) |
| `--color-surface` | `#FFFFFF` | Cards, modales |
| `--color-border` | `#BCBBB5` | Bordes default |
| `--color-text` | `#002532` | Texto principal |
| `--color-text-soft` | `#646459` | Texto secundario |
| `--color-text-invert` | `#FFFFFF` | Texto sobre fondos oscuros |

### 2.4 Paleta de estados (badges / gráficas)

| Estado | Fondo (rgba) | Texto (hex) |
|--------|--------------|-------------|
| Success | `rgba(68,183,87,0.12)` | `#2D8A3E` |
| Warning | `rgba(229,104,19,0.12)` | `#B85210` |
| Info | `rgba(134,97,245,0.12)` | `#6B45D4` |
| Neutral | `rgba(170,170,159,0.2)` | `#646459` |
| Danger | `rgba(192,57,43,0.12)` | `#C0392B` |

### 2.5 Colores de actividades / progreso (Recharts)

| Estado | Color | Fondo sutil |
|--------|-------|-------------|
| Completada | `#10B981` | `rgba(16,185,129,0.12)` |
| En curso | `#D97706` | `rgba(245,158,11,0.12)` |
| Planificada | `#2563EB` | `rgba(59,130,246,0.12)` |
| Pendiente | `#9CA3AF` / `#D1D5DB` | `rgba(156,163,175,0.15)` |

### 2.6 Roles de usuario (badges)

| Rol | Color |
|-----|-------|
| `SUPERUSUARIO` | `#F59E0B` |
| `PRODUCT_OWNER` | `#3B82F6` |
| `DESARROLLADOR` | `#004254` (petroleum) |
| `QA` | `#10B981` |

---

## 3. CSS Variables (`src/styles/globals.css`)

```css
:root {
  /* Marca */
  --color-petroleum:       #004254;
  --color-deep-navy:       #002532;
  --color-warm-gray:       #AAAA9F;
  --color-dark-gray:       #646459;

  /* Acentos */
  --color-success:         #44B757;
  --color-accent-purple:   #8661F5;
  --color-accent-orange:   #E56813;

  /* Superficies / bordes */
  --color-bg:              #E3E2DA;
  --color-surface:         #FFFFFF;
  --color-border:          #BCBBB5;

  /* Texto */
  --color-text:            #002532;
  --color-text-soft:       #646459;
  --color-text-invert:     #FFFFFF;

  /* Tipografía */
  --font-sans: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', system-ui, sans-serif;

  /* Z-index */
  --z-dropdown:        100;
  --z-sticky:          200;
  --z-fixed:           300;
  --z-modal-backdrop:  400;
  --z-modal:           500;
  --z-toast:           800;

  /* Sombras */
  --shadow-card:       0 1px 4px 0 rgba(0,0,0,0.08);
  --shadow-card-hover: 0 4px 16px 0 rgba(0,36,50,0.12);
}
```

---

## 4. Tailwind Config (`tailwind.config.ts`)

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
        accent: {
          green:  '#44B757',
          purple: '#8661F5',
          orange: '#E56813',
        },
        neutral: {
          warm:  '#E3E2DA',
          light: '#BCBBB5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card:         '0 1px 4px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 4px 16px 0 rgba(0,36,50,0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
```

---

## 5. Tipografía

- **Familia**: `Inter` → `Segoe UI` → `Roboto` → `Helvetica Neue` → `system-ui`
- **Sin Google Fonts**: usa sistema, fallback a `system-ui`

### Escala (Tailwind)

| Clase | Uso |
|-------|-----|
| `text-xs` (12px) | Labels, badges, tablas densas |
| `text-sm` (14px) | Texto secundario, inputs |
| `text-base` (16px) | Encabezados de card |
| `text-lg` (18px) | Modales, KPIs medianos |
| `text-xl` (20px) | Títulos de página |
| `text-2xl` (24px) | Valores de KPI |
| `text-3xl` (30px) | Porcentajes en gráficas radiales |

### Pesos

- `font-medium` — labels
- `font-semibold` — encabezados, labels principales
- `font-bold` — números destacados, KPIs

---

## 6. Border radius

| Clase | Valor | Uso |
|-------|-------|-----|
| `rounded-md` | 6px | Botones pequeños |
| `rounded-lg` | 8px | Inputs, selects, botones default |
| `rounded-card` | 12px | Cards, modales |
| `rounded-full` | 9999px | Badges, avatares, dots |

---

## 7. Sombras

- **Card default**: `0 1px 4px 0 rgba(0,0,0,0.08)`
- **Card hover**: `0 4px 16px 0 rgba(0,36,50,0.12)`
- **Modal**: `shadow-xl` (Tailwind)
- **Backdrop**: `rgba(0,37,50,0.55)` + `backdrop-filter: blur(2px)`

---

## 8. Spacing y layout

### Escala común

- Gaps: `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px)
- Padding card: `p-4` / `p-6` (default) / `p-8`
- Padding input: `px-3 py-2`
- Padding tabla: `px-4 py-3`
- Padding modal: header `px-6 py-4`, body `px-6 py-5`

### Layout dashboard

```
┌────────────┬───────────────────────────┐
│            │  Topbar (min-h 56px)      │
│  Sidebar   ├───────────────────────────┤
│  w-60      │                           │
│  (240px)   │  Main (flex-1, scroll)    │
│            │  padding px-6 py-4        │
│  bg:       │                           │
│  petroleum │                           │
└────────────┴───────────────────────────┘
```

### Grids responsive comunes

```tsx
// 1 → 2 cols
className="grid grid-cols-1 md:grid-cols-2 gap-6"

// 2 → 3 → 4 cols (cards tipo donut/KPI)
className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
```

### Breakpoints (Tailwind default)

| Prefix | px |
|--------|-----|
| `sm` | 640 |
| `md` | 768 |
| `lg` | 1024 |
| `xl` | 1280 |
| `2xl` | 1536 |

---

## 9. Componentes UI base

### 9.1 Button

**Variantes**: `primary | secondary | ghost | danger`
**Tamaños**: `sm (px-3 py-1.5)` | `md (px-4 py-2)` | `lg (px-5 py-2.5)`

| Variante | BG | Texto |
|----------|-----|-------|
| primary | `#004254` | white |
| secondary | white + border | petroleum |
| ghost | transparent | petroleum |
| danger | `#C0392B` | white |

Disabled: `opacity-50 cursor-not-allowed`

### 9.2 Card

```tsx
<div
  className="rounded-card border p-6"
  style={{
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-surface)',
    boxShadow: 'var(--shadow-card)',
  }}
>
  ...
</div>
```

### 9.3 Badge

```tsx
<span
  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
  style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }}
>
  Completada
</span>
```

### 9.4 Table

- Header: BG `var(--color-petroleum)`, texto `rgba(255,255,255,0.85)`, `uppercase tracking-wider`
- Rows alternadas: `transparent` / `rgba(227,226,218,0.3)`
- Hover: `hover:bg-[var(--color-neutral-warm)]`
- Celdas: `px-4 py-3 text-sm`

### 9.5 Input / Select

```
px-3 py-2 text-sm rounded-lg border
border-[var(--color-border)]
focus:border-[var(--color-petroleum)] focus:outline-none
placeholder:text-[var(--color-warm-gray)]
```

Error: `border-red-400`
Disabled: `opacity-50 cursor-not-allowed`

### 9.6 Modal

- `rounded-card shadow-xl`
- Tamaños: `sm (max-w-md)`, `md (max-w-lg)`, `lg (max-w-2xl)`, `xl (max-w-4xl)`
- Backdrop: `rgba(0,37,50,0.55)` + blur
- z-index: `var(--z-modal, 500)`

---

## 10. Patrones Recharts

### Tooltip personalizado

```tsx
<div
  className="rounded-lg border px-3 py-2 text-xs shadow-md"
  style={{
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  }}
>...</div>
```

### Configuración visual

| Elemento | Valor |
|----------|-------|
| Grid stroke | `rgba(0,0,0,0.05)` |
| Tick fill | `var(--color-text-soft)` (fontSize 10-11) |
| Axis line / tick line | `false` |
| Cursor fill | `rgba(0,66,84,0.04)` |
| Background barras radiales | `rgba(0,66,84,0.06)` |
| Corner radius barras | `6` (radiales) / `3` (horizontales) |

### Colores de series estándar

```ts
const SERIES = {
  completadas:  '#10B981',
  enCurso:      '#D97706',
  planificadas: '#2563EB',
  pendientes:   '#D1D5DB',
}
```

---

## 11. Estructura de carpetas (Clean Architecture + Vertical Slicing)

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Rutas públicas (login)
│   ├── (dashboard)/         # Rutas protegidas
│   │   ├── admin/
│   │   ├── calculadora/
│   │   ├── catalogos/
│   │   ├── componentes/
│   │   ├── historial/
│   │   └── proyectos/
│   ├── api/                 # Route handlers
│   └── layout.tsx           # Root layout
│
├── modules/                 # Módulos de negocio (por feature)
│   └── <modulo>/
│       ├── domain/          # Entities, interfaces
│       ├── application/     # Use cases
│       ├── infrastructure/  # Repositories (API, DB)
│       └── presentation/    # Hooks, controllers
│
├── shared/
│   ├── components/
│   │   ├── layout/          # Sidebar, Topbar, Providers
│   │   └── ui/              # Button, Card, Badge, Input, Modal, Table...
│   ├── lib/                 # axios, prisma, utils (cn, formatters)
│   └── hooks/
│
├── styles/
│   └── globals.css
│
└── views/                   # Vistas de alto nivel (composición por página)
    └── <Feature>/
```

---

## 12. Convenciones de código

- **Alias**: `@/*` → `./src/*`
- **Colores en estilo**: preferir `var(--color-*)` sobre hex hardcoded en componentes
- **Clases condicionales**: usar `cn()` utility de `shared/lib/utils.ts`
- **Estados de actividad**: calculados desde fechas (`fechaInicio` / `fechaFin`), no almacenados
- **Formatters**: `formatMinutes()`, `formatPct()` en `shared/lib/utils.ts`
- **Import order**: React → libs externas → `@/modules` → `@/shared` → relativos

---

## 13. Checklist de replicación

- [ ] Instalar Next.js 15 + React 19 + TypeScript
- [ ] Instalar Tailwind CSS 4 con `@tailwindcss/postcss`
- [ ] Copiar `globals.css` con todas las variables CSS
- [ ] Copiar `tailwind.config.ts` con extensión de tema
- [ ] Verificar que Inter esté disponible o agregar fallback system
- [ ] Crear componentes base: Button, Card, Badge, Input, Select, Modal, Table, PageHeader
- [ ] Implementar layout dashboard: Sidebar (240px) + Topbar + Main
- [ ] Usar `var(--color-*)` consistentemente, no hex hardcoded
- [ ] Aplicar escala de spacing/typography/radius documentada
- [ ] Configurar alias `@/*` en tsconfig
- [ ] Seguir estructura modular (Clean Architecture + Vertical Slicing)
- [ ] Instalar Recharts y aplicar los patrones de tooltip/grid/colores
- [ ] Definir paleta de estados (success/warning/info/neutral/danger) como constantes reutilizables

---

## 14. Referencias rápidas (copy-paste)

### Card base

```tsx
<div
  className="rounded-lg border p-6"
  style={{
    borderColor: 'var(--color-border)',
    backgroundColor: 'var(--color-surface)',
  }}
>
```

### Título de sección

```tsx
<p
  className="text-xs font-semibold uppercase tracking-wider mb-3"
  style={{ color: 'var(--color-text-soft)' }}
>
  Título de sección
</p>
```

### Hover row

```tsx
className="hover:bg-[rgba(0,66,84,0.03)] transition-colors"
```

### Botón primario inline

```tsx
<button
  className="px-4 py-2 text-sm rounded-lg font-medium transition-colors"
  style={{ backgroundColor: 'var(--color-petroleum)', color: '#FFFFFF' }}
>
  Acción
</button>
```

---

**Identidad visual**: INDRA corporativa — petroleum (`#004254`) como eje central, beige cálido (`#E3E2DA`) como superficie de página, acentos sobrios (verde/naranja/azul) en estados, tipografía Inter con pesos medium/semibold/bold, border-radius suaves (8–12px), sombras ligeras.
