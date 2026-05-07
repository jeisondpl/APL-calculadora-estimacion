---
name: indra-corporate-ui
description: Applies INDRA corporate UIs in two documented variants: (1) APL Calculadora — warm beige page background, petroleum/deep-navy, Inter, cards with radius/shadow; (2) Indraweb (intranet profile) — white/off-white surfaces, header #004254, nav/teal #03657C, amber #FBBB21 primary CTA border, link blue #007BFF, NeoSansPro/NoeDisplay/Helvetica, flat radii, spacing scale from img/sistema-diseno-indraweb.html. Includes PowerPoint template editorial patterns. Use for APL estimación, Indraweb-style portals, indraweb.net parity, corporate dashboards, or when the user references sistema-diseno-indraweb.html.
---

# INDRA corporate UI (design system skill)

## Instructions

1. **Source of truth (choose variant):**
   - **APL Calculadora (default for this repo):** Use the **Tokens** and **Tailwind** sections below — they match [`src/styles/globals.css`](../../../src/styles/globals.css) and [`tailwind.config.ts`](../../../tailwind.config.ts). Do not use `--color-green`; use `--color-success`.
   - **Indraweb (intranet / perfil profesional):** Follow **[Variante Indraweb](#variante-indraweb-imgsistema-diseno-indrawebhtml)** and [`reference.md`](reference.md) — extracted from [`img/sistema-diseno-indraweb.html`](../../../img/sistema-diseno-indraweb.html) (source noted in file: indraweb.net). **Do not overwrite** APL tokens in this project unless the user explicitly asks to migrate the whole app to Indraweb.

2. **Install tokens in CSS:** For the **APL** variant, copy the entire `:root` block from the **Tokens** section below into the global stylesheet. For the **Indraweb** variant, use the proposed `:root` from section 6 of [`img/sistema-diseno-indraweb.html`](../../../img/sistema-diseno-indraweb.html) (reproduced in [reference.md](reference.md)) instead of the APL palette. For Tailwind v4 with `@import "tailwindcss";`, keep this import at the top. For Tailwind v3, use `@tailwind base` / `components` / `utilities` and place `:root` after `@tailwind base` or in a layer that applies to the document.

3. **Install Tailwind theme extension:** For **APL**, merge the `theme.extend` block from the **Tailwind** section below. For **Indraweb**, extend theme with at least `teal`/`indraweb-teal` `#03657C`, `amber`/`indraweb-amber` `#FBBB21`, `link` `#007BFF`, neutrals from the HTML, and optional `fontFamily` for display/heading/body stacks — then point `content` at all JSX/TSX paths.

4. **Keep shadows in sync (APL variant):** `--shadow-card` and `--shadow-card-hover` in `:root` must match `theme.extend.boxShadow.card` and `boxShadow['card-hover']`. Indraweb spec is **flat** (no card shadows by default); skip or neutralize shadows when implementing that variant.

5. **Body and chrome:** **APL:** `font-family: var(--font-sans)`, `background-color: var(--color-bg)`, `color: var(--color-text)`, smoothing as in `globals.css`. **Indraweb:** typically `background #FFFFFF`, body `color #212529`, `font-family` Helvetica/Inter stack; header/nav/footer follow the Indraweb section.

6. **Component patterns (APL Calculadora — default):**
   - **Surfaces:** Cards and modals use `backgroundColor: var(--color-surface)`, `borderColor: var(--color-border)`, `rounded-card` (12px).
   - **Primary actions:** Primary buttons use `var(--color-petroleum)` background; hover can deepen toward `var(--color-deep-navy)` where appropriate.
   - **Sidebar / dark nav:** Background `var(--color-deep-navy)`; inactive links `var(--color-warm-gray)`; active item `var(--color-petroleum)` with white text; optional active dot `var(--color-success)`.
   - **Tables:** Header row `var(--color-petroleum)`; header text white at ~85% opacity; body zebra with subtle warm tint on alternate rows; row hover `bg-neutral-warm` (from Tailwind `neutral.warm`).
   - **Inputs:** Surface background, `var(--color-border)` border, focus ring/border toward `var(--color-petroleum)`; labels and hints `var(--color-text-soft)`; placeholders `var(--color-warm-gray)`; errors text `#C0392B`.
   - **Modals:** Backdrop `rgba(0, 37, 50, 0.55)` with light blur; panel matches card surface; title/subtitle same hierarchy as `CardHeader` (title `var(--color-text)`, subtitle `var(--color-text-soft)`). Use `z-index: var(--z-modal)` on the overlay stack.
   - **Badges / KPI accents:** Use the semantic rgba backgrounds and text colors documented in `reference.md` for status badges; summary KPIs can use top border accent in `var(--color-petroleum)`, `var(--color-success)`, `var(--color-accent-purple)`, or `var(--color-accent-orange)`.

   **Indraweb:** For header, nav L1/L2, profile card, footer two-tier, primary/secondary buttons, and data labels, use the **Variante Indraweb** section (not the bullets above).

7. **Scrollbar (optional but on-brand):** Thin track using `var(--color-bg)`, thumb `var(--color-border)` rounding 3px, hover thumb `var(--color-warm-gray)` — see reference implementation in the repo’s `globals.css`.

8. **Identity checklist:**
   - ~70% light neutrals / warm background, ~20% deep blues (petroleum / navy), ~10% accents.
   - High contrast type; no playful gradients; accents only for CTAs, status, and highlights.
   - Generous spacing; subtle dividers; corporate B2B dashboard tone.

9. **Out of scope for this skill:** App routes, auth, domain logic, corporate logo assets. Use placeholders where logos are required.

10. **PowerPoint template alignment (`img/Powerpoint.pdf`):** When the product should feel like the corporate deck—not only colors—map slide patterns to UI as in the **Plantilla PowerPoint** section below.

11. **Indraweb HTML spec (`img/sistema-diseno-indraweb.html`):** When the user asks for **Indraweb**, **indraweb.net**, intranet header/nav, perfil profesional, or parity with that HTML reference, apply the **Indraweb variant** (teal nav, amber CTA border, flat layout). Open the file in the workspace for full specimens; the skill summarizes the contract below.

## Variante Indraweb (`img/sistema-diseno-indraweb.html`)

Static reference captured from **Indraweb** (per file: indraweb.net, perfil profesional). This is a **different product language** than APL Calculadora: mostly **white / `#F8F8F8` surfaces**, **flat** components (radius `0` except secondary button and some inputs at `4px`), and **amber (`#FBBB21`)** as the loud CTA accent—not the green/purple/orange KPI accents of APL.

### Colores clave (Indraweb)

| Nombre en doc | Hex | Rol |
| --- | --- | --- |
| Deep Teal | `#004254` | Header top bar, footer bottom, strong brand text |
| Teal | `#03657C` | Main nav bar, section titles (NoeDisplay), labels, focus border on inputs |
| Amber | `#FBBB21` | Primary “Editar” CTA: **4px solid** border (fill transparent or filled per table in HTML), badges “Profesionales” |
| Blue | `#007BFF` | Links, some H1-style breadcrumbs |
| Body text | `#212529` | Cuerpo (Helvetica) — not the same as APL `--color-text` (`#002532`) |
| Neutros | `#333` / `#666` / `#868689` / `#999` | Jerarquía secundaria, placeholders |
| Surfaces | `#FFFFFF`, `#F8F8F8` | Página y footer superior, dropdowns |
| Bordes | `#DEDFE0`, `#E5E5E5`, `#EAEAEA` | Inputs, divisores |

**Puente con APL:** `#004254` coincide con **petroleum** APL. `#03657C` es un teal adicional (no está en el `:root` APL actual); añadirlo solo en proyectos/vistas Indraweb (p. ej. `--color-teal: #03657C` o token de tema Tailwind `teal-indraweb`).

### Tipografía (Indraweb)

| Familia | Uso |
| --- | --- |
| **NeoSansPro** | Logo wordmark, nav L1 (18px regular, white on teal), profile name (26px bold), dropdown group titles |
| **NoeDisplay** | H2 sección 23px / H3 20px, color `#03657C` |
| **Helvetica / Arial** | Cuerpo 16px/24px line-height, formularios, botones, data label/value 12px |

Web: si no hay licencia de NeoSansPro/NoeDisplay, usar **Inter** como sustituto manteniendo pesos y tamaños del HTML.

### Layout y espaciado

- Escala **4px**: 4, 8, 12, 16, 24, 32, 40, 48, 64 (`--space-*` propuestos en sección 6 del HTML).
- **Header** alto documentado **108px** (padding vertical generoso); **nav** **50px**.
- Contenedor referencia **max-width 1200px**, padding lateral **24px** / columnas datos **0 15px** según tabla del HTML.
- **Grid:** documentación menciona Bootstrap `col-*` para splits tipo perfil 50/50.

### Componentes distintivos (mapeo rápido)

- **Header:** barra `#004254`, búsqueda transparente con **solo** `border-bottom` blanco semitransparente, iconos blancos.
- **Nav L1:** fondo `#03657C`, links 18px blancos, hover `rgba(255,255,255,0.1)`.
- **Dropdown L2:** fondo `#F8F8F8`, títulos grupo `#333` NeoSansPro 16px medium, links `#004254` 14px.
- **Botón primario tipo “Editar”:** texto `#004254`, borde **`4px solid #FBBB21`**, radius **0**, padding ~`8px 20px` (ver tabla en HTML).
- **Botón secundario:** borde `1px solid #03657C`, texto `#03657C`, **radius 4px**, 13px bold.
- **Inputs:** borde `1px solid #DEDFE0`, focus `border-color: #03657C` (en APL se usa petroleum; aquí priorizar teal si es variante Indraweb).
- **Footer:** franja superior `#F8F8F8` (meta / tickers), inferior `#004254`, links `#E5E5E5` 11px.

### Accesibilidad y reglas del HTML

- Contraste: texto blanco sobre `#004254` / `#03657C` OK; sobre **amber** usar texto **`#004254`**, no blanco.
- **Flat design:** sin sombras de caja en componentes “nativos” Indraweb del HTML (contrasta con cards APL con `shadow-card`; no mezclar sin intención).
- CTA primario: reservar borde amber grueso a la acción principal de edición, como en la especificación.

### Tokens CSS propuestos en el HTML

El archivo incluye un bloque `:root` completo (sección 6) con `--color-primary`, `--color-accent`, `--font-display`, `--space-*`, `--header-height`, etc. Para implementación, copiar desde el HTML o desde la tabla condensada en [`reference.md`](reference.md).

## Plantilla PowerPoint corporativa (`img/Powerpoint.pdf`)

The PDF is the official Indra presentation template (50 slides): typography notice, confidentiality boilerplate, composition examples, tables, KPIs, process layouts, and footer instructions. **Hex colors are not embedded as text in the PDF**; keep using the CSS tokens in this skill. Use the template for **structure, hierarchy, and tone**.

### Tipografía

- The deck states that the **corporate Indra typeface** must be installed for correct rendering (“nueva tipografía corporativa”). Brand guidelines often specify **ForFuture Sans** for print/PPT; **on the web**, keep `var(--font-sans)` as **Inter** (plus system fallbacks) unless the project has licensed webfont files and `@font-face` rules—do not assume PPT fonts are web-licensed.

### Jerarquía y composición (traducción a pantallas web)

| Patrón en plantilla | Traducción UI |
| ------------------- | ------------- |
| Título + subtítulo de diapositiva | `PageHeader` (título `text-xl`, subtítulo `text-sm`, colores token). |
| “Key message” / un solo mensaje dominante | Una línea destacada encima del contenido (`text-base`–`lg`, `font-semibold`, color `var(--color-text)` o `var(--color-petroleum)`); el resto secundario. |
| Heading + SUB-HEADING + cuerpo + bullets 2.º/3.º nivel | `Card` + `CardHeader`; párrafos `text-sm`/`text-base`; listas con primer nivel sin viñeta opcional y subniveles con `text-soft` o `pl-4`. |
| “Make every word count” / frases concisas | Copy corto en dashboards; evitar párrafos largos en cards. |
| “Source: xxx” bajo bloques | Pie de gráfico o nota bajo tabla: `text-xs`, `var(--color-text-soft)`. |
| Agenda numerada (01…10) | Pasos de wizard o secciones: números en `var(--color-petroleum)` o `deep-navy`, labels en `text-soft`. |
| Tabla con filas “Encabezado” + fila **Total** | Tabla tipo `Table`: cabecera petroleum; última fila total con `font-semibold` y/o fondo `rgba(227,226,218,0.35)`. |
| Tarjetas KPI (título + cifra grande + descripción corta) | Grid de `SummaryCard` (borde superior acento). |
| “El Reto / La Solución / El Impacto” | Tres columnas en desktop: tres `Card` o una fila `grid-cols-3` con divisores `border-border`. |
| Variaciones “process” / chevrons / 3–5 pasos | Stepper horizontal o timeline discreto; colores de marca, sin adornos genéricos “startup”. |
| “Tech for the future” | Opcional: claim secundario bajo marca (`text-xs` uppercase tracking-wide, `text-soft`). |
| Pie “Pie de página • Edítalo según tus necesidades” | Barra inferior de app: `text-xs`, `var(--color-warm-gray)` o `text-soft`, borde superior `var(--color-border)`; texto configurable. **No** pegar el bloque legal completo de confidencialidad del PDF en UI salvo requisito legal explícito del producto. |

### Identidad verbal breve

- Slides mezclan ES/EN según plantilla; para **APL interna** priorizar **español** coherente con la app de referencia.
- Categorías de ejemplo (Defensa, Tecnologías de la información, Espacio, Tráfico Aéreo) son **placeholders** de negocio: sustituir por dominio real.

## Tokens (`:root`)

```css
:root {
  /* Primarios */
  --color-petroleum:   #004254;
  --color-deep-navy:   #002532;
  --color-warm-gray:   #AAAA9F;
  --color-dark-gray:   #646459;

  /* Acentos */
  --color-success:     #44B757;
  --color-accent-purple: #8661F5;
  --color-accent-orange: #E56813;

  /* Neutros */
  --color-bg:          #E3E2DA;
  --color-surface:     #FFFFFF;
  --color-border:      #BCBBB5;

  /* Semánticos */
  --color-text:        #002532;
  --color-text-soft:   #646459;
  --color-text-invert: #FFFFFF;

  /* Tipografía */
  --font-sans: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;

  /* z-index layers */
  --z-dropdown:       100;
  --z-sticky:         200;
  --z-fixed:          300;
  --z-modal-backdrop: 400;
  --z-modal:          500;
  --z-toast:          800;

  /* Sombras (keep equal to tailwind theme.extend.boxShadow) */
  --shadow-card:       0 1px 4px 0 rgba(0, 0, 0, 0.08);
  --shadow-card-hover: 0 4px 16px 0 rgba(0, 36, 50, 0.12);
}
```

## Tailwind (`theme.extend`)

```ts
// Merge into tailwind.config.ts — adjust `content` globs to the project
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
      card: '0 1px 4px 0 rgba(0,0,0,0.08)',
      'card-hover': '0 4px 16px 0 rgba(0,36,50,0.12)',
    },
  },
},
```

## Anti-patterns

- Neon gradients, glassmorphism overload, or “consumer app” candy colors.
- Replacing the warm page background with flat pure gray or stark white full viewport without intent.
- Inventing new primary blues instead of petroleum / deep navy.
- Drift between CSS `--shadow-*` and Tailwind `shadow-card` values.
- Dense walls of text without title/subtitle/key-message hierarchy (contradicts the corporate deck guidance).
- Embedding PPT-only assets (full-slide backgrounds as heavy images) instead of rebuilding layout with tokens and components.
- Mixing **Indraweb** (white page, teal nav, amber CTA, flat, `#212529` body) and **APL** (warm `#E3E2DA` page, navy sidebar, petroleum fill buttons, card radius/shadow) in the same screen **without** explicit user direction.

## More detail

See [reference.md](reference.md) for badge variants, role chip colors, optional stack versions, Tailwind v3 notes, **Indraweb** condensed tokens/tables, and the expanded **Plantilla PowerPoint** checklist.
