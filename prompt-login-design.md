# Prompt — Implementar Login Corporativo de Dos Columnas

Prompt genérico autocontenido para entregar a cualquier IA (Claude Code, Cursor, GPT) que genere una página de login con apariencia corporativa profesional, layout split de dos paneles (branding + formulario), totalmente accesible y responsive.

> **Cómo usarlo:** copia el bloque entre los marcadores `===PROMPT-START===` y `===PROMPT-END===`. Antes de pegarlo, ajusta las variables marcadas con `<<...>>` en la sección **CONFIGURACIÓN**. Pégalo en la IA elegida.

---

```markdown
===PROMPT-START===

# ROLE
Eres un **Senior Frontend Engineer** experto en Next.js 15 (App Router) + React 19
+ TypeScript + Tailwind CSS 4 + NextAuth v5, con dominio en sistemas de diseño
corporativos B2B y accesibilidad WCAG 2.1 AA.

# OBJECTIVE
Crear una página de **login corporativo** en `src/app/(auth)/login/page.tsx`
con layout split de dos paneles:

```
┌─────────────────────────────┬──────────────────────────────┐
│                             │                              │
│   PANEL IZQUIERDO           │   PANEL DERECHO              │
│   (Branding · oculto < lg)  │   (Formulario)               │
│                             │                              │
│   [Logo arriba]             │   Bienvenido de nuevo        │
│                             │   Inicia sesión …            │
│   [Badge "Live"]            │                              │
│   <Headline en 2 líneas>    │   ┌──────────────────────┐  │
│   <Subtítulo descriptivo>   │   │ Correo electrónico   │  │
│                             │   └──────────────────────┘  │
│   [Stat] [Stat] [Stat]      │   ┌──────────────────────┐  │
│                             │   │ Contraseña           │  │
│   [© Footer abajo]          │   └──────────────────────┘  │
│                             │                              │
│   (Decoración: círculos     │   ┌──────────────────────┐  │
│    radiales sutiles)        │   │ Iniciar sesión       │  │
│                             │   └──────────────────────┘  │
│                             │                              │
│                             │   [Hint usuarios de prueba] │
│                             │                              │
└─────────────────────────────┴──────────────────────────────┘
```

# CONFIGURACIÓN — ajustar antes de generar

Reemplaza los valores `<<...>>` con los de tu proyecto:

| Variable | Valor a usar |
|----------|--------------|
| `<<APP_NAME>>` | <<APP_NAME>>  *(ej. "APL Calculadora de Estimación")* |
| `<<LOGO_PATH>>` | <<LOGO_PATH>>  *(ej. "/indra-logo.png" — debe estar en /public)* |
| `<<LOGO_ALT>>` | <<LOGO_ALT>>  *(ej. "INDRA GROUP")* |
| `<<HEADLINE_LINE_1>>` | <<HEADLINE_LINE_1>>  *(ej. "Estima con")* |
| `<<HEADLINE_LINE_2>>` | <<HEADLINE_LINE_2>>  *(ej. "precisión y velocidad")* |
| `<<SUBTITLE>>` | <<SUBTITLE>>  *(ej. "Planifica, estima y gestiona el esfuerzo de tus proyectos de software…")* |
| `<<STAT_1_VALUE>>` / `<<STAT_1_LABEL>>` | "300+" / "Componentes" |
| `<<STAT_2_VALUE>>` / `<<STAT_2_LABEL>>` | "3" / "Pasos wizard" |
| `<<STAT_3_VALUE>>` / `<<STAT_3_LABEL>>` | "∞" / "Proyectos" |
| `<<BRAND_NAME>>` | <<BRAND_NAME>>  *(ej. "INDRA GROUP")* |
| `<<REDIRECT_AFTER_LOGIN>>` | <<REDIRECT_AFTER_LOGIN>>  *(ej. "/proyectos")* |
| `<<PLACEHOLDER_EMAIL>>` | <<PLACEHOLDER_EMAIL>>  *(ej. "usuario@indra.com")* |
| `<<TEST_USERS>>` | Lista de objetos `{ email, rol }` o `[]` si no aplica |
| `<<TEST_PASSWORD>>` | <<TEST_PASSWORD>>  *(ej. "Indra2025!")* |

# CONTEXT — Stack y tokens de diseño

## Stack obligatorio
- Next.js 15 (App Router) — archivo: `src/app/(auth)/login/page.tsx`
- React 19 con `'use client'`
- TypeScript 5.6+
- Tailwind CSS 4
- NextAuth v5 (Credentials provider configurado en `src/auth.ts`)
- `next/image` para logo, `next/navigation` para router

## Tokens CSS requeridos (deben existir en `src/styles/globals.css`)

```css
:root {
  --color-petroleum:   #004254;  /* Primario marca */
  --color-deep-navy:   #002532;  /* Panel branding */
  --color-warm-gray:   #AAAA9F;  /* Acento texto sobre dark */
  --color-bg:          #E3E2DA;  /* Fondo panel formulario (beige cálido) */
  --color-surface:     #FFFFFF;  /* Inputs */
  --color-border:      #BCBBB5;  /* Bordes inputs */
  --color-text:        #002532;  /* Texto principal */
  --color-text-soft:   #646459;  /* Texto secundario */
  --font-sans: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', system-ui, sans-serif;
}
```

> Si el proyecto usa OTRA paleta corporativa, reemplaza los hex pero respeta
> el contrato: una variable `--color-deep-navy` para el panel izquierdo dark,
> `--color-petroleum` para CTAs, `--color-bg` warm/light para el panel derecho.

# DESIGN SPECIFICATIONS (las reglas visuales detalladas)

## Layout general

- Container raíz: `min-h-screen flex` (split horizontal)
- Panel izquierdo: `hidden lg:flex lg:w-1/2` (oculto en mobile/tablet)
- Panel derecho: `flex-1` (ocupa 100% en mobile, 50% en desktop)
- Sin scroll vertical (centrado vertical en ambos paneles)

## Panel izquierdo (Branding) — SOLO desktop ≥ 1024px

- BG: `var(--color-deep-navy)` (#002532)
- Padding: `px-12 py-12`
- Flex columna con `justify-between`: logo arriba, contenido centro, footer abajo

### Decoración de fondo (círculos sutiles)

3 círculos absolutos posicionados:
1. `-top-32 -left-32 w-96 h-96 rounded-full opacity-10` con `bg-petroleum`
2. `-bottom-20 -right-20 w-80 h-80 rounded-full opacity-10` con `bg-petroleum`
3. `top-1/2 -right-10 w-40 h-40 rounded-full opacity-5` con `bg-white`

Todos los círculos: `absolute`, sin pointer-events, sirven solo de decoración.
El contenido va con `relative z-10` para quedar por encima.

### Logo

- `<Image src="<<LOGO_PATH>>" alt="<<LOGO_ALT>>" width={200} height={60} priority />`
- `object-contain`
- En el panel izquierdo desktop

### Badge "live" indicator

```tsx
<div
  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
>
  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
  <<APP_NAME>>
</div>
```

### Headline

```tsx
<h1 className="text-4xl font-bold text-white leading-tight">
  <<HEADLINE_LINE_1>><br />
  <span style={{ color: 'var(--color-warm-gray)' }}><<HEADLINE_LINE_2>></span>
</h1>
```

### Subtítulo descriptivo

```tsx
<p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
  <<SUBTITLE>>
</p>
```

### Stats — 3 cards en grid

```tsx
<div className="grid grid-cols-3 gap-4 pt-4">
  {stats.map(s => (
    <div
      key={s.label}
      className="rounded-xl px-4 py-3 text-center"
      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <p className="text-2xl font-bold text-white">{s.value}</p>
      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
    </div>
  ))}
</div>
```

### Footer del panel izquierdo

```tsx
<p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
  © {new Date().getFullYear()} <<BRAND_NAME>> · Todos los derechos reservados
</p>
```

## Panel derecho (Formulario) — siempre visible

- BG: `var(--color-bg)`
- Flex columna `justify-center` (centrado vertical)
- Padding: `px-8 sm:px-16 lg:px-20`
- Form contenido en `max-w-md mx-auto`

### Logo mobile

Solo visible en `lg:hidden`, tamaño reducido:
```tsx
<div className="lg:hidden mb-8">
  <Image src="<<LOGO_PATH>>" alt="<<LOGO_ALT>>" width={140} height={42} className="object-contain" />
</div>
```

### Encabezado del formulario

```tsx
<div className="mb-8">
  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
    Bienvenido de nuevo
  </h2>
  <p className="text-sm mt-1" style={{ color: 'var(--color-text-soft)' }}>
    Inicia sesión para continuar con tu trabajo
  </p>
</div>
```

### Inputs

- `rounded-xl` (12px radius)
- `border` color `var(--color-border)`
- BG `var(--color-surface)`
- Texto `var(--color-text)`
- Padding `px-4 py-3 text-sm`
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleum` (WCAG)
- Cada input con `<label htmlFor>` (obligatorio para accesibilidad)

### Estados de error

```tsx
{error && (
  <div
    role="alert"
    aria-live="polite"
    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
    style={{ backgroundColor: 'rgba(192,57,43,0.08)', color: '#C0392B' }}
  >
    <span aria-hidden="true">⚠</span>
    {error}
  </div>
)}
```

### Botón submit

```tsx
<button
  type="submit"
  disabled={loading}
  className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all
             disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110
             focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleum"
  style={{ backgroundColor: 'var(--color-petroleum)' }}
>
  {loading ? (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      Verificando…
    </span>
  ) : 'Iniciar sesión'}
</button>
```

### Panel de usuarios de prueba (opcional, condicional)

Si `<<TEST_USERS>>` no es vacío, renderizar:

```tsx
<div
  className="mt-8 p-4 rounded-xl text-xs space-y-1"
  style={{ backgroundColor: 'rgba(0,66,84,0.06)', border: '1px solid var(--color-border)' }}
>
  <p className="font-semibold mb-2" style={{ color: 'var(--color-text-soft)' }}>
    Usuarios de prueba (contraseña: <code><<TEST_PASSWORD>></code>)
  </p>
  {testUsers.map(u => (
    <div key={u.email} className="flex justify-between items-center">
      <button
        type="button"
        onClick={() => { setEmail(u.email); setPassword('<<TEST_PASSWORD>>') }}
        className="font-mono hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleum rounded"
        style={{ color: 'var(--color-petroleum)' }}
        aria-label={`Rellenar con credenciales de ${u.rol}`}
      >
        {u.email}
      </button>
      <span style={{ color: 'var(--color-text-soft)' }}>{u.rol}</span>
    </div>
  ))}
</div>
```

> El click en cada email autocompleta los inputs — útil para QA/demo.
> Si tu proyecto es producción real, **omitir este bloque** o renderizarlo
> SOLO en `process.env.NODE_ENV === 'development'`.

# LÓGICA DE LOGIN (NextAuth v5)

```tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', { email, password, redirect: false })

    setLoading(false)

    if (res?.error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
    } else {
      router.push('<<REDIRECT_AFTER_LOGIN>>')
      router.refresh()
    }
  }

  // ... render JSX según secciones de arriba
}
```

# CONSTRAINTS

## MUST
- ✅ `'use client'` directive en la primera línea
- ✅ Usar `next/image` para el logo (no `<img>`)
- ✅ Usar `next/navigation` (`useRouter`) — no `next/router` (deprecated)
- ✅ Layout responsive: panel izquierdo oculto en mobile (`hidden lg:flex`)
- ✅ Cada input con `<label htmlFor>` ligado al `id` (a11y)
- ✅ Botones con `focus-visible:outline-*` (a11y)
- ✅ Error con `role="alert"` y `aria-live="polite"`
- ✅ Spinner de loading con `aria-hidden="true"` o `aria-label="Cargando"`
- ✅ Atributos `autoComplete="email"` y `autoComplete="current-password"`
- ✅ `required` HTML5 en inputs (fallback de validación nativa)
- ✅ Botón con `disabled={loading}` para prevenir doble submit
- ✅ Decoración de fondo con `aria-hidden="true"` (no es contenido)
- ✅ Logo en panel izquierdo con `priority` (LCP optimization)

## MUST NOT
- ❌ Inline hex hardcoded — usar `var(--color-*)` o utilidades Tailwind extendidas
- ❌ Imports de Prisma o bcrypt en este archivo (es client component)
- ❌ Usar `<img>` (debe ser `<Image>` de next)
- ❌ Color text sobre fondos sin verificar contraste WCAG 4.5:1
- ❌ Posicionar el botón submit fuera del `<form>` (rompe Enter-to-submit)
- ❌ Animaciones sin respetar `prefers-reduced-motion`

# ACCEPTANCE CRITERIA (verificables binariamente)

| # | Criterio | Cómo verificar |
|---|----------|----------------|
| AC-01 | El archivo existe en `src/app/(auth)/login/page.tsx` | `ls` |
| AC-02 | Compila con `pnpm next build` sin errores | terminal |
| AC-03 | Renderiza split de 2 paneles en ≥1024px | DevTools responsive |
| AC-04 | En mobile (<1024px) solo se ve el panel derecho | DevTools |
| AC-05 | Logo carga desde `<<LOGO_PATH>>` | network tab |
| AC-06 | Inputs tienen `<label htmlFor>` correspondiente | inspección DOM |
| AC-07 | Foco visible (outline 2px petroleum) al tabular | navegar con Tab |
| AC-08 | Error se muestra con `role="alert"` | inspección DOM |
| AC-09 | Botón con loading muestra spinner + texto "Verificando…" | manual |
| AC-10 | Click en email de test rellena inputs | manual |
| AC-11 | Submit válido redirige a `<<REDIRECT_AFTER_LOGIN>>` | manual |
| AC-12 | Submit inválido muestra mensaje de error | manual |
| AC-13 | Contraste texto-fondo cumple WCAG AA (≥4.5:1) | DevTools / axe |
| AC-14 | Círculos decorativos con `aria-hidden="true"` | inspección DOM |
| AC-15 | No hay hex hardcoded de marca (`#004254`, `#002532`) | grep |

# OUTPUT FORMAT

Entrega:

## A) El archivo completo `src/app/(auth)/login/page.tsx`
Code block con TypeScript + JSX listo para copiar.

## B) Notas de implementación (≤150 palabras)
- Decisiones de a11y aplicadas
- Cómo ajustar para otro brand (qué tokens cambiar)
- Edge cases manejados

## C) Reporte de cumplimiento de AC
Tabla con AC-01 a AC-15 y estado `✅`/`⚠️`/`❌`.

# SELF-CRITIQUE LOOP

Antes de entregar:
1. ¿Algún AC quedó `⚠️` o `❌`? Arregla
2. ¿Hay imports innecesarios (que aumentan bundle)?
3. ¿El layout colapsa correctamente en 320px de ancho?
4. ¿Las animaciones respetan `prefers-reduced-motion`?
5. ¿El logo tiene fallback si la imagen falla?

Si encuentras algo, **itera y entrega versión final corregida**.

===PROMPT-END===
```

---

# Cómo usar este prompt

## Paso 1 — Ajustar la sección CONFIGURACIÓN

Antes de copiar el prompt, reemplaza los `<<...>>` con tus valores. Ejemplos:

### Para un task tracker

```
<<APP_NAME>> = Daily Task Tracker
<<LOGO_PATH>> = /logo.svg
<<LOGO_ALT>> = Acme Inc.
<<HEADLINE_LINE_1>> = Organiza tu día
<<HEADLINE_LINE_2>> = sin esfuerzo
<<SUBTITLE>> = Registra tus tareas en franjas horarias y mantén el foco en lo importante.
<<STAT_1_VALUE>> = 50+ | <<STAT_1_LABEL>> = Categorías
<<STAT_2_VALUE>> = 10h | <<STAT_2_LABEL>> = Diarias
<<STAT_3_VALUE>> = ∞   | <<STAT_3_LABEL>> = Listas
<<BRAND_NAME>> = Acme Inc.
<<REDIRECT_AFTER_LOGIN>> = /tareas
<<PLACEHOLDER_EMAIL>> = tu@empresa.com
<<TEST_USERS>> = [{ email: 'admin@local', rol: 'Admin' }]
<<TEST_PASSWORD>> = Demo2026!
```

### Para un dashboard de ventas

```
<<APP_NAME>> = Sales Dashboard
<<HEADLINE_LINE_1>> = Cierra más
<<HEADLINE_LINE_2>> = en menos tiempo
<<SUBTITLE>> = Pipeline, métricas y forecasting en una sola pantalla.
<<STAT_1_VALUE>> = $2M+ | <<STAT_1_LABEL>> = Pipeline
<<STAT_2_VALUE>> = 87%  | <<STAT_2_LABEL>> = Conversión
<<STAT_3_VALUE>> = 24/7 | <<STAT_3_LABEL>> = Disponibilidad
...
```

## Paso 2 — Copiar y pegar

1. Copia el bloque entre `===PROMPT-START===` y `===PROMPT-END===`
2. Pégalo en Claude Code, Cursor, ChatGPT, o tu IA preferida
3. La IA generará el archivo completo `login/page.tsx` listo para usar

## Paso 3 — Personalizar tokens si tu marca no es INDRA

Si tu proyecto usa OTRA paleta corporativa (ej. Acme con primario verde):

```css
:root {
  --color-petroleum:   #16A34A;  /* Verde Acme */
  --color-deep-navy:   #052E16;  /* Verde oscuro Acme */
  --color-bg:          #F0FDF4;  /* Verde muy claro */
  /* resto igual */
}
```

El prompt **NO** necesita cambios — solo redefine los tokens en `globals.css` y el login adoptará la nueva paleta automáticamente.

---

## Variantes opcionales (puedes pedirlas al final del prompt)

| Variante | Cómo pedirla |
|----------|--------------|
| Con OAuth (Google/GitHub) | "Agrega botones de OAuth con Google y GitHub debajo del divider 'O continúa con'" |
| Con tema oscuro | "Agrega soporte de `prefers-color-scheme: dark` con tokens alternativos" |
| Sin panel izquierdo (centrado simple) | "Omite el panel izquierdo, centra el formulario en toda la pantalla con un max-width de 400px" |
| Con video de fondo en panel izquierdo | "Reemplaza los círculos decorativos por un `<video autoPlay muted loop>` cubriendo el panel izquierdo" |
| Sign up + Sign in tabs | "Agrega tabs en el panel derecho para alternar entre 'Iniciar sesión' y 'Crear cuenta'" |

---

**Generado siguiendo las prácticas de la skill `prompt-engineering-lab`**: role-based scaffolding, constraint-driven prompting, schema enforcement, acceptance criteria binarios, self-critique loop.
