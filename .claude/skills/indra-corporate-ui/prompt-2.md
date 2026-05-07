# 📋 Análisis de Diseño Web — Centro de Recursos GitHub Copilot | Indra Group
> **URL:** https://urban-adventure-k518p77.pages.github.io/  
> **Fecha de análisis:** 07/05/2026  
> **Framework:** Docusaurus (ifm CSS) + CSS Modules personalizados  
> **Viewport de referencia:** 1400 × 843 px  

---

## 1. RESUMEN EJECUTIVO

El sitio es una **landing page de producto** construida sobre Docusaurus, con una capa de CSS Modules personalizada que sobreescribe los estilos base del framework. El diseño es oscuro/naval (dark-navy), profesional y tech-oriented, con una paleta de dos tonos principales (azul marino profundo y azul eléctrico) sobre fondos gris-verdoso claro para las secciones internas. La tipografía principal es **DM Sans**, el layout utiliza un sistema de grilla CSS Grid y Flexbox sin columnas Bootstrap, con un contenedor máximo de **1100–1140 px**.

**Secciones identificadas (de arriba a abajo):**
1. Header / Navbar fijo
2. Hero — gradient oscuro con grid-scan decorativo
3. Features — 4 tarjetas oscuras (grid 4 col)
4. Project Resources — 2 col grid (tarjetas blancas)
5. Extensions — 3 col grid (tarjetas translúcidas sobre fondo oscuro)
6. Quick Start 3 pasos — 3 col grid (tarjetas blancas)
7. Tech Pills — lista horizontal de tecnologías
8. CTA "¿Listo para empezar?" — fondo oscuro
9. Newsletter CTA — fondo azul-petróleo
10. Footer — fondo oscuro, centrado

---

## FASE 1: ANÁLISIS DE COLORES

### 1.1 Paleta Primaria

| Nombre | HEX | RGB | HSL | Uso |
|--------|-----|-----|-----|-----|
| Navy Dark (principal) | `#0D2535` | `rgb(13, 37, 53)` | `hsl(204, 61%, 13%)` | Hero bg, Header, Footer, CTA sections, Feature Cards |
| Navy Darker | `#0A1E2C` | `rgb(10, 30, 44)` | `hsl(205, 63%, 11%)` | Gradiente final del Hero |
| Primary Blue | `#3578E5` | `rgb(53, 120, 229)` | `hsl(217, 77%, 55%)` | Links, iconos, botones (Docusaurus primary) |
| Dark Text | `#1C1E21` | `rgb(28, 30, 33)` | `hsl(216, 8%, 12%)` | Texto cuerpo en fondos claros |

### 1.2 Paleta Secundaria

| Nombre | HEX | RGB | HSL | Uso |
|--------|-----|-----|-----|-----|
| Section BG (gris-verde) | `#E5E9E6` | `rgb(229, 233, 230)` | `hsl(135, 8%, 91%)` | Sections "features" y "projectRes" |
| White | `#FFFFFF` | `rgb(255, 255, 255)` | `hsl(0, 0%, 100%)` | Navbar, tarjetas resCard, texto sobre oscuro |
| Petrol Blue | `#1A4960` | `rgb(26, 73, 96)` | `hsl(203, 57%, 24%)` | Sección Newsletter CTA |
| Feature Card Visual Gradient Start | `#1A5C78` | `rgb(26, 92, 120)` | `hsl(200, 64%, 29%)` | Zona visual de featureCard |

### 1.3 Paleta de Acento

| Nombre | HEX | RGB | HSL | Uso |
|--------|-----|-----|-----|-----|
| Accent Cyan | `#7EC8F0` | `rgb(126, 200, 240)` | `hsl(201, 80%, 72%)` | Tags de extensiones (extCardTag) |
| Blue Primary Shades | | | | |
| → Dark | `#306CCE` | — | — | Hover links |
| → Darker | `#2D66C3` | — | — | Active links |
| → Darkest | `#2554A0` | — | — | Pressed states |
| → Light | `#538CE9` | — | — | Hover highlights |
| → Lighter | `#72A1ED` | — | — | Subtle accents |
| → Lightest | `#9ABCF2` | — | — | Very subtle accents |

### 1.4 Colores con Opacidad

| Token | Valor | Uso |
|-------|-------|-----|
| White 80% | `rgba(255,255,255,0.80)` | Nav links |
| White 75% | `rgba(255,255,255,0.75)` | CTA subtítulos |
| White 60% | `rgba(255,255,255,0.60)` | Hero title accent, badge text |
| White 12% | `rgba(255,255,255,0.12)` | Extension card backgrounds |
| White 85% | `rgba(255,255,255,0.85)` | Feature card icon color |
| Border nav | `rgba(255,255,255,0.08)` | Borde inferior del header sobre hero |
| Shadow light | `rgba(0,0,0,0.10)` | `--ifm-global-shadow-lw` |
| Shadow medium | `rgba(0,0,0,0.20)` | `--ifm-global-shadow-md` |

### 1.5 Gradientes

```css
/* Hero background */
background-image: linear-gradient(150deg, rgb(13, 37, 53) 0px, rgb(10, 30, 44) 100%);

/* Feature card visual zone */
background-image: linear-gradient(145deg, rgb(26, 92, 120) 0%, rgb(13, 37, 53) 100%);
```

### 1.6 Variables CSS (Docusaurus Custom Properties)

```css
:root {
  --ifm-color-primary:           #3578E5;
  --ifm-color-primary-dark:      #306CCE;
  --ifm-color-primary-darker:    #2D66C3;
  --ifm-color-primary-darkest:   #2554A0;
  --ifm-color-primary-light:     #538CE9;
  --ifm-color-primary-lighter:   #72A1ED;
  --ifm-color-primary-lightest:  #9ABCF2;
  --ifm-color-secondary:         #EBEDF0;
  --ifm-color-success:           #00A400;
  --ifm-color-info:              #54C7EC;
  --ifm-color-warning:           #FFBA00;
  --ifm-color-danger:            #FA383E;
  --ifm-background-color:        transparent;
  --ifm-font-color-base:         #1C1E21;
  --ifm-navbar-background-color: #FFFFFF;
  --ifm-footer-background-color: #F5F6F7; /* sobreescrito por CSS Module */
  --ifm-global-radius:           0.4rem;
  --ifm-global-shadow-lw:        0 1px 2px 0 rgba(0,0,0,0.10);
  --ifm-global-shadow-md:        0 5px 40px rgba(0,0,0,0.20);
}
```

---

## FASE 2: CATÁLOGO TIPOGRÁFICO

### 2.1 Familias de Fuente

| Contexto | Font Family | Fallback Stack |
|----------|------------|----------------|
| **DM Sans** (UI principal) | `"DM Sans"` | `system-ui, -apple-system, sans-serif` |
| Sistema (headings hero) | `system-ui` | `-apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif` |
| Body fallback Docusaurus | `system-ui` | `-apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif, BlinkMacSystemFont, Helvetica, Arial` |
| Emoji | N/A | `"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"` |

> **Nota:** DM Sans es una fuente de Google Fonts, aplicada vía CSS Module en todos los elementos custom del landing page. Los headings del hero (H1) usan system-ui por herencia.

### 2.2 Escala Tipográfica

| Elemento | Selector | Tamaño | Peso | Line-Height | Letter-Spacing | Color |
|----------|----------|--------|------|------------|----------------|-------|
| H1 Hero Title | `.heroTitle_qg2I` | `60.8px` | `700` | `66.88px (1.1)` | `-1.216px (-0.02em)` | `#FFFFFF` |
| H1 Hero Accent | `.heroTitleAccent_D_mc` | `60.8px` | `700` | `66.88px` | `-1.216px` | `rgba(255,255,255,0.6)` |
| H2 Section Title | `.sectionTitle_Ut5p` | `40px` | `700` | `50px (1.25)` | `-0.8px (-0.02em)` | `#0D2535` |
| H2 CTA Title | `.ctaBandTitle_VZOK` | `32px` | `700` | `40px (1.25)` | — | `#FFFFFF` |
| H3 Feature Title | `.featureCardTitle_KCMt` | `15.2px (0.95rem)` | `600` | `19px` | `-0.152px` | `#FFFFFF` |
| H3 Res Card Title | `.resCardTitle_qAuk` | `17.6px (1.1rem)` | `700` | `~25px` | — | `#0D2535` |
| H3 Ext Card Name | `.extCardName_AEyo` | `17.6px` | `700` | `~25px` | — | `#FFFFFF` |
| H3 Step Title | `.stepTitle_v8aQ` | ~`18px` | `700` | — | — | `#0D2535` |
| Body base | `body, p` | `16px (100%)` | `400` | `26.4px (1.65)` | `normal` | `#1C1E21` |
| Hero Tagline | `.heroTagline_QIlK` | `18.4px` | `400` | `~30px` | — | `rgba(255,255,255,0.85)` |
| Section Subtitle | `.sectionSubtitle_AZuW` | `17.6px` | `400` | `~30px` | — | `rgba(13,37,53,0.6)` |
| Feature Card Desc | `.featureCardDesc_VUJb` | `14px` | `400` | `~22px` | — | `rgba(255,255,255,0.65)` |
| CTA Subtitle | `.ctaBandSubtitle_eQTt` | `15.2px (0.95rem)` | `300` | `25.08px` | — | `rgba(255,255,255,0.75)` |
| Nav Link | `.navLink_aQaq` | `14.4px (0.9rem)` | `500` | `26.4px` | — | `rgba(255,255,255,0.8)` |
| Hero Badge | `.heroBadge_Z6oq` | `12px` | `500` | `~18px` | `0.72px (0.06em)` | `rgba(255,255,255,0.6)` |
| Card Tag | `.extCardTag_OuhW` | `10.4px (0.65rem)` | `600` | — | `1.248px (0.12em)` | `#7EC8F0` |
| Res Card Tag | `.resCardTag_gNzI` | `10.4px` | `600` | — | `1.248px` | `#3578E5` |
| Tech Pill Label | `.techsLabel_v9Ig` | `11.2px` | `500` | — | `0.896px` | text-muted |
| Feature Card CTA | `.featureCardCta_PGyM` | `13.6px (0.85rem)` | `500` | — | — | `rgba(255,255,255,0.5)` |
| Step Number | `.stepNum_dTvv` | `56px` | `800` | — | — | `rgba(229,233,230,0.9)` |
| Footer copyright | `.footerCopy_H8P7` | `13.6px` | `400` | — | — | `rgba(255,255,255,0.5)` |

### 2.3 Text-Transform detectado

| Selector | Valor |
|----------|-------|
| `.extCardTag_OuhW` | `uppercase` |
| `.resCardTag_gNzI` | `uppercase` |
| `.techsLabel_v9Ig` | `uppercase` |
| `.heroBadge_Z6oq` | `uppercase` (deducido por letter-spacing) |
| Tags de extensiones | `uppercase` |

---

## FASE 3: SISTEMA DE ESPACIADOS

### 3.1 Variables de Espaciado Base

```css
--ifm-navbar-height:              70px;
--ifm-container-width:            1140px;  /* Docusaurus default */
--ifm-spacing-horizontal:         (heredado, ~1rem)
--ifm-spacing-vertical:           (heredado, ~1rem)
```

### 3.2 Contenedor Custom

```css
.container_bfhl {
  max-width: 1100px;
  padding: 0 32px;           /* padding horizontal */
  margin: 0 auto;            /* centrado */
  display: flex;
  gap: 24px;
}
```

### 3.3 Espaciados por Sección (padding vertical)

| Sección / Componente | Padding Top | Padding Bottom | Notas |
|----------------------|------------|----------------|-------|
| Hero `.hero_aEcG` | `100px` | `120px` | Asimétrico |
| Features `.features_cAfv` | `88px` | `88px` | Simétrico |
| Project Resources `.projectRes_eovn` | `88px` | `88px` | |
| Extensions `.extensions_khKh` | `88px` | `88px` | |
| Quick Start `.quickStart_s7sE` | `88px` | `88px` | |
| CTA Start `.ctaStart_CgO9` | `80px` | `80px` | |
| Newsletter `.ctaNewsletter_uZoh` | `80px` | `80px` | |
| Footer `.footer_odxa` | `48px` | `48px` | |
| Section Header (margin-bottom) | — | `56px` | `.sectionHeader_Gahl` mb |

### 3.4 Espaciados Internos de Componentes

| Componente | Padding | Gap / Margin notas |
|------------|---------|-------------------|
| Feature Card `.featureCard_Jbd_` | `0` | Interno separado en visual + body |
| Feature Card Visual `.featureCardVisual_tWLq` | `0` | `140px` alto, flex centrado |
| Feature Card Body `.featureCardBody_ZCO8` | `20px 24px` | — |
| Resource Card `.resCard_DGmc` | `32px 28px` | gap `24px` |
| Extension Card `.extCard_EktA` | `32px 28px` | gap `20px` |
| Step Card `.stepCard_aHS3` | `32px 28px` | — |
| CTA Inner flex | `0 32px` | max-width `1100px`, gap `48px` |
| Nav (header inner) | `0 32px` | gap `24px` |

### 3.5 Sistema de Grillas (Grid Gaps)

| Grid | Gap | Columnas |
|------|-----|----------|
| `.featuresGrid_cNCB` | `4px` | 4 col × 256px |
| `.projectResGrid_hZy9` | `4px` | 2 col × 516px |
| `.extGrid_yDz4` | `4px` | 3 columnas (auto) |
| `.stepsGrid_wonY` | `4px` | 3 columnas |

> **Patrón de espaciado:** El sistema no usa múltiplos de 4px/8px puros. Los gaps de grilla son consistentemente `4px` (mínimo visual). Los paddings internos siguen: `20px`, `24px`, `28px`, `32px`, `48px`, `56px`, `80px`, `88px`, `100px`, `120px`.

---

## FASE 4: EFECTOS VISUALES

### 4.1 Sombras

```css
/* Docusaurus globals */
--ifm-global-shadow-lw: 0 1px 2px 0 rgba(0,0,0,0.10);
--ifm-global-shadow-md: 0 5px 40px rgba(0,0,0,0.20);

/* No se detectaron box-shadows custom en cards del landing */
/* Los cards usan separación visual por color de fondo, no por sombra */
```

### 4.2 Bordes y Radios

| Componente | border-radius | border |
|------------|--------------|--------|
| Docusaurus global | `0.4rem (≈6.4px)` | — |
| Feature Cards `.featureCard_Jbd_` | `0px` | ninguno |
| Resource Cards `.resCard_DGmc` | `0px` | ninguno |
| Extension Cards `.extCard_EktA` | `0px` | ninguno |
| Step Cards `.stepCard_aHS3` | `0px` | ninguno |
| Tech Pills `.techPill_QoIV` | `~999px` (pill completo) | `1px solid rgba(13,37,53,0.15)` |
| Outline CTA button `.outlineBtnWrap_AHvB` | `0px` | `1px solid rgba(255,255,255,0.3)` |
| Primary CTA `.ctaPrimary_pouF` | `0px` | ninguno |
| Nav CTA `.navCta_H3CV` | `0px` | ninguno |
| Header bottom border | — | `1px solid rgba(255,255,255,0.08)` |

### 4.3 Transiciones y Animaciones

| Elemento | Propiedad | Duración | Timing |
|----------|-----------|----------|--------|
| `.ctaPrimary_pouF` (CTA primario) | `clip-path`, `transform` | `0.35s`, `0.2s` | ease |
| `.navCta_H3CV` (Nav CTA) | `clip-path`, `opacity` | `0.3s`, `0.15s` | ease |
| `.featureCard_Jbd_` (Feature cards) | `transform` | `0.25s` | ease |
| Imágenes `img` | `all` | inherited | ease |
| `.heroDecoration_qnf4` | posición absolute, `1405px × 602px` | — | decorativo estático |

**Efecto Clip-path en botones CTA:**
El botón primario usa `clip-path` para un efecto de "wipe" animado en hover. El botón secundario (outline) usa un wrapper con borde y un inner que cambia en hover.

```css
/* Patrón CTA botón primario */
.ctaPrimary_pouF {
  transition: clip-path 0.35s, transform 0.2s;
  padding: 14px 32px;
  background: #FFFFFF;
  color: #0D2535;
  font-weight: 600;
  font-size: 15.2px;
  cursor: pointer;
}

/* Patrón nav CTA */
.navCta_H3CV {
  transition: clip-path 0.3s, opacity 0.15s;
}

/* Feature cards — hover lift */
.featureCard_Jbd_ {
  transition: transform 0.25s;
  /* hover: translateY(-4px) estimated */
}
```

### 4.4 Estados Interactivos

```css
/* Links del navbar */
.navLink_aQaq:hover  { color: var(--ifm-color-primary); }

/* Feature card hover */
.featureCard_Jbd_:hover { transform: translateY(-4px); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled */
}
```

---

## FASE 5: RECURSOS GRÁFICOS

### 5.1 Imágenes Identificadas

| Recurso | Ruta | Formato | Dimensiones Renderizadas | Uso |
|---------|------|---------|--------------------------|-----|
| Logo header (navbar) | `/img/indragroup-menu-header.png` | PNG | `104 × 38 px` | Navbar logo |
| Logo footer | `/img/indragroup-logo-header.png` | PNG | `104 × 32 px` | Footer logo |
| GitHub Copilot icon | `/img/github-copilot-seeklogo-dark.svg` | SVG | `20 × 20 px` | Hero badge |

### 5.2 Iconos SVG Inline

El sitio usa **SVGs inline** (no sprite sheet ni icon font) para los iconos funcionales:

| Icono | Dimensiones | Contexto | Color |
|-------|------------|---------|-------|
| Feature icons (4×) | `52 × 52 px` | Feature card visual zone | `rgba(255,255,255,0.85)` |
| Resource card icons | `~28–32 px` | Resource card izquierda | `#0D2535` |
| Extension card icons | `~28–32 px` | Extension card | `rgba(255,255,255,0.85)` |
| Step icons / números | N/A | Números `01`, `02`, `03` | `rgba(229,233,230,0.9)` |
| Nav menu toggle | — | Mobile hamburger | `#000000` |

**Feature card icons detectados (SVG inline):**
1. ⚡ Rayo (Quick Start)
2. 📖 Libro abierto (Guías y Recursos)
3. ✅ Check circle (Formaciones Oficiales)
4. 🖥️ Monitor (Agentes y Skills)

### 5.3 Fondo Decorativo Hero