# INDRA corporate UI — reference

Companion to [SKILL.md](SKILL.md). Values below mirror the reference codebase unless noted. **Two variants:** APL (this repo’s `globals.css`) and **Indraweb** ([`img/sistema-diseno-indraweb.html`](../../../img/sistema-diseno-indraweb.html)).

## Stack (reference project)

| Layer        | Typical choice                          |
| ------------ | --------------------------------------- |
| Framework    | Next.js (App Router)                    |
| UI           | React                                   |
| Styles       | Tailwind CSS v4 (`@import "tailwindcss"`) + `tailwind.config.ts` |
| Forms        | react-hook-form + Zod (optional)        |

For **Tailwind v3**, replace the v4 CSS import with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Keep the same `:root` tokens in a file imported after `@tailwind base` (or inside `@layer base`).

## Brand palette (quick lookup)

| Role            | Token / key              | Hex       |
| --------------- | ------------------------ | --------- |
| Primary brand   | `--color-petroleum`      | `#004254` |
| Dark / text     | `--color-deep-navy`      | `#002532` |
| Muted UI        | `--color-warm-gray`      | `#AAAA9F` |
| Soft text       | `--color-dark-gray` / `--color-text-soft` | `#646459` |
| Page background | `--color-bg`             | `#E3E2DA` |
| Surface         | `--color-surface`        | `#FFFFFF` |
| Border          | `--color-border`         | `#BCBBB5` |
| Success accent  | `--color-success`        | `#44B757` |
| Purple accent   | `--color-accent-purple`  | `#8661F5` |
| Orange accent   | `--color-accent-orange`  | `#E56813` |

Tailwind classes for extended colors include `bg-petroleum`, `text-deep-navy`, `bg-neutral-warm`, `text-accent-green`, etc. (`accent.green` in config maps to utilities like `bg-accent-green` in Tailwind v3/v4). Prefer CSS variables in `style={{}}` when matching the reference components exactly.

## Badge variants (status chips)

| Variant | Background           | Text color   |
| ------- | -------------------- | ------------ |
| success | `rgba(68,183,87,0.12)`  | `#2D8A3E` |
| warning | `rgba(229,104,19,0.12)` | `#B85210` |
| info    | `rgba(134,97,245,0.12)` | `#6B45D4` |
| neutral | `rgba(170,170,159,0.2)`   | `var(--color-dark-gray)` |
| danger  | `rgba(192,57,43,0.12)`    | `#C0392B` |

Use `rounded-full text-xs font-medium px-2 py-0.5`.

## Role badge colors (user / admin chips)

Used for role labels and avatars in the reference app:

| Role key        | Hex       |
| --------------- | --------- |
| `SUPERUSUARIO`  | `#F59E0B` |
| `PRODUCT_OWNER` | `#3B82F6` |
| `DESARROLLADOR` | `#004254` (petroleum) |
| `QA`            | `#10B981` |

Background for the pill can be the hex with alpha (e.g. `${hex}18`).

## KPI / summary cards

- Container: `rounded-card border p-5`, surface + border tokens.
- Top accent bar: `borderTop: 3px solid` with one of:
  - `var(--color-petroleum)` (default)
  - `var(--color-success)`
  - `var(--color-accent-purple)`
  - `var(--color-accent-orange)`
- Label: `text-xs font-medium uppercase tracking-wider`, color `var(--color-text-soft)`.
- Value: `text-2xl font-bold`, color equals accent.

## Table body (zebra + hover)

- Alternate row background: `idx % 2 === 1` → `rgba(227, 226, 218, 0.3)`; even → `var(--color-surface)`.
- Row hover: Tailwind `hover:bg-neutral-warm` (requires `neutral.warm` in `tailwind.config`).

## Modal / z-index

- Overlay: `z-index: var(--z-modal)` (inline style is reliable across Tailwind versions).
- If using a utility class `z-modal`, define it in CSS (e.g. `@utility z-modal { z-index: var(--z-modal); }` in Tailwind v4) or use `z-[var(--z-modal)]`.

## Charts (optional — activity / progress)

When building Recharts or similar, common status colors in this product family:

| Estado      | Stroke / fill | Subtle fill              |
| ----------- | ------------- | ------------------------ |
| Completada  | `#10B981`     | `rgba(16,185,129,0.12)`  |
| En curso    | `#D97706`     | `rgba(245,158,11,0.12)`  |
| Planificada | `#2563EB`     | `rgba(59,130,246,0.12)`  |
| Pendiente   | `#9CA3AF`     | `rgba(156,163,175,0.15)` |

These are **semantic chart colors** and may differ slightly from strict brand accents; use brand tokens for chrome and these for data clarity when appropriate.

## Page title hierarchy (reference)

| Component   | Title element | Classes / styles |
| ----------- | ------------- | ---------------- |
| `PageHeader`| `h1`          | `text-xl font-semibold`, `var(--color-text)`; subtitle `text-sm`, `var(--color-text-soft)`; `mb-6` on wrapper |
| `CardHeader`| `h2`          | `text-base font-semibold` + same subtitle pattern; `mb-4` on wrapper |
| `Topbar`    | `h2` (optional) | `text-sm font-semibold`, `var(--color-text)` on warm bar `var(--color-bg)` |

## Scrollbar (WebKit)

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--color-bg); }
::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-warm-gray); }
```

## Indraweb (`img/sistema-diseno-indraweb.html`)

Spec estática extraída de **indraweb.net** (perfil profesional; fecha en el HTML: 04/05/2026). Úsala cuando el usuario pida paridad con Indraweb, no como reemplazo silencioso de APL.

### Paleta (resumen)

| Token en HTML | Hex | Uso |
| --- | --- | --- |
| `--color-primary-dark` | `#004254` | Header, footer bottom (= petroleum APL) |
| `--color-primary` | `#03657C` | Nav, títulos sección, labels, focus input |
| `--color-accent` | `#FBBB21` | CTA borde grueso, badges “Profesionales” |
| `--color-link` | `#007BFF` | Links, algunos títulos contexto |
| `--color-text` | `#212529` | Cuerpo |
| `--color-text-secondary` | `#666666` | Secundario |
| `--color-text-muted` | `#999999` | Desactivado / footer meta |
| `--color-text-subdued` | `#868689` | Placeholders |
| `--color-text-sub2` | `#333333` | Títulos grupo dropdown |
| `--color-surface` / `--color-surface-alt` | `#FFFFFF` / `#F8F8F8` | Página, dropdown, footer top |
| `--color-border` / `--color-border-light` / `--color-divider` | `#DEDFE0` / `#E5E5E5` / `#EAEAEA` | Inputs, divisores |

### Botones (tabla del HTML)

| Variante | Background | Texto | Borde | Radius | Padding | Fuente |
| --- | --- | --- | --- | --- | --- | --- |
| Primario (“Editar”) | `transparent` | `#004254` | `4px solid #FBBB21` | `0` | `8px 12px` | Helvetica 16px 400 |
| Secundario | `transparent` | `#03657C` | `1px solid #03657C` | `4px` | `7px 10px` | Helvetica 13px 700 |
| Link | `transparent` | `#007BFF` | — | `0` | `0` | Helvetica 16px 400 |

Badge ejemplo: fondo `#FBBB21`, texto `#03657C`, 12px bold Helvetica; badge “Activo” invertido teal/blanco en el HTML de muestra.

### Radios (del HTML)

| Componente | Radius |
| --- | --- |
| Header, nav | `0` |
| Primario amber | `0` |
| Secundario | `4px` |
| Inputs | `0` en doc (también muestra `border-radius: 4px` en swatches; unificar en implementación con una sola regla por tipo de campo) |
| Tarjetas / contenedores | `0` (flat) |

### Espaciado y layout (del HTML)

| Nombre | px |
| --- | --- |
| xs … 5xl | 4, 8, 12, 16, 24, 32, 40, 48, 64 |
| Header height | 108 |
| Nav bar height | 50 |
| Content padding | `0 15px` |
| Nav L1 link padding | `12px 20px` |
| Dropdown padding (doc) | `26px 0 55px` |
| Wrapper max-width | 1200px, padding 40px 24px |

### `:root` propuesto (sección 6 del HTML)

Copiar literalmente desde [`img/sistema-diseno-indraweb.html`](../../../img/sistema-diseno-indraweb.html) el bloque `<pre><code>:root { ... }</code></pre>` (incluye `--font-display`, `--font-heading`, `--font-body`, tamaños `--font-size-*`, `--space-*`, `--header-height`, `--nav-height`, `--container-pad`, bordes y radios). Ese bloque es la fuente canónica para tokens Indraweb.

### Reglas de accesibilidad (sección 7 del HTML)

- Texto sobre amber: usar **`#004254`**, no blanco (ratio documentado ~6.2:1).
- Blanco sobre `#004254` y `#03657C`: ratios documentados ~10.3:1 y ~7.8:1.
- Incluir siempre fallbacks `Helvetica, Arial` y `Georgia, serif` si se declaran NeoSansPro / NoeDisplay.

## Plantilla PowerPoint corporativa (`img/Powerpoint.pdf`)

Texto extraído de la plantilla oficial (Indra, 50 diapositivas). Sirve para **composición y contenido**, no para colores literales (no vienen como hex en el PDF).

### Contenido relevante por tipo de slide

| Tema | Ejemplo en plantilla | Notas para UI |
| ---- | -------------------- | ------------- |
| Portada / aviso tipográfico | Slide 1: instalar tipografía corporativa | Web: Inter + fallbacks salvo fuente corporativa con licencia web. |
| Confidencialidad | Slide 2 (texto largo) | Legal interno; no volcar en footer de app sin criterio legal. |
| Agenda numerada | Slides 3–6: secciones 01…10 con subpuntos | Wizard o anclas de sección con numeración petroleum. |
| Idea resumen | Slide 6 | Hero o callout de una frase antes del detalle. |
| Diapositiva base + bullets | Slide 7–8: “Título estándar”, bullets por bloques temáticos | Listas agrupadas con título de grupo (`font-medium`, `text-text`). |
| Organigrama / tarjetas nombre | Slide 11 | Grid de personas: cards compactas, foto/avatar circular, rol en `text-soft`. |
| Tabla con totales | Slide 12: “Titulo 1…4”, “Total” | Última fila destacada; cabecera oscura como `Table`. |
| Tagline | Slide 14: “Tech for the future” | Strapline opcional bajo logo. |
| KPI + mapa / regiones | Slides 15–16 | KPIs en `SummaryCard` + mapa o leyenda secundaria. |
| Key message + jerarquía EN | Slide 17–18 | Un mensaje clave; heading / sub-heading / niveles de bullet. |
| Proceso (chevron, fases, pasos) | Slides 19–26 | Stepper o timeline; numeración clara. |
| KPI sector vertical | Slides 27–30 | Título + subtítulo + grid de métricas con cifra grande. |
| Narrativa 3 columnas | Slide 31: El Reto / La Solución / El Impacto | Tres cards o columnas con mismo peso visual. |
| Donut / porcentajes | Slide 33 | Gráficos con leyenda `text-sm`; porcentajes como etiqueta principal. |
| Pie y numeración | Slides 45–50 | Instrucciones de edición de pie en PPT → en web, barra inferior configurable. |

### Pie de página (plantilla)

Texto por defecto en la plantilla: `Pie de página • Edítalo según tus necesidades` (separador medio punto `•`). En aplicaciones: misma cadencia tipográfica (`text-xs`, tracking normal, color `var(--color-text-soft)`), alineado a izquierda o centrado según layout.

### Atribución de datos

Patrón repetido: `Source: xxx` al pie de bloques de argumentación. En web: `text-xs text-soft` o estilo equivalente con tokens, sin cursivas llamativas.
