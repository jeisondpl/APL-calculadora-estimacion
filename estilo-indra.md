Extraje la línea visual principal de la plantilla y la puedes traducir así a un frontend.

## Paleta de colores base

**Primarios**

* Azul petróleo principal: `#004254`
* Azul oscuro profundo: `#002532`
* Gris cálido base: `#AAAA9F`
* Gris oscuro secundario: `#646459`

**Acentos**

* Verde: `#44B757`
* Morado: `#8661F5`
* Naranja: `#E56813`

**Neutros**

* Blanco: `#FFFFFF`
* Fondo claro cálido: `#E3E2DA`
* Gris claro soporte: `#BCBBB5`

## Lectura de diseño

La plantilla maneja una estética **corporativa, sobria y tecnológica** con estas claves:

* Mucho contraste entre **fondos claros cálidos** y bloques en **azul petróleo oscuro**
* Uso de **líneas finas verticales y divisiones sutiles**
* Composición con bastante aire, márgenes amplios y bloques rectangulares
* Tipografía limpia y moderna
* Imágenes en estilo **industrial / tecnológico / arquitectura / data / global**
* Tarjetas y contenedores con bordes suaves, casi siempre discretos
* Acentos de color usados con moderación, no de forma dominante

## Tipografía

La plantilla usa como fuente principal:

* **ForFuture Sans**

Para frontend, si no la tienes disponible, puedes aproximarla con:

* `Inter`
* `Segoe UI`
* `Roboto`
* `Helvetica Neue`

## Cómo llevarlo a frontend

### 1. Tokens de diseño

```css
:root {
  --color-primary: #004254;
  --color-primary-dark: #002532;
  --color-secondary: #AAAA9F;
  --color-secondary-dark: #646459;

  --color-success: #44B757;
  --color-accent-purple: #8661F5;
  --color-accent-orange: #E56813;

  --color-bg: #E3E2DA;
  --color-surface: #FFFFFF;
  --color-border: #BCBBB5;
  --color-text: #002532;
  --color-text-soft: #646459;
}
```

### 2. Estilo visual recomendado

* **Background general:** `#E3E2DA`
* **Cards y módulos:** blanco o gris muy claro
* **Header / sidebar / hero:** `#004254` o `#002532`
* **Texto principal:** `#002532`
* **Botón primario:** `#004254`
* **Hover botón primario:** `#002532`
* **Botón secundario:** fondo claro con borde `#646459`
* **Estados positivos:** `#44B757`

### 3. Componentes

**Botones**

* Primario: fondo oscuro, texto blanco
* Secundario: fondo claro, borde fino, texto oscuro

**Cards**

* Fondo blanco
* Borde sutil `#BCBBB5`
* Radio suave: `10px` a `14px`
* Sombra muy ligera

**Sidebar**

* Fondo `#002532`
* Texto blanco o gris claro
* Item activo con detalle en `#44B757` o `#AAAA9F`

**Tablas**

* Encabezados oscuros
* Filas claras
* Bordes finos y discretos

## Estilo de interfaz ideal

Esta identidad funciona muy bien para:

* dashboards corporativos
* portales internos
* sistemas B2B
* paneles administrativos
* landings institucionales tecnológicas

No la usaría con un enfoque muy “startup vibrante” o muy cargado de gradientes, porque su fuerza está en lo **elegante, estructurado y serio**.

## Recomendación de sistema visual

Usa esta proporción:

* **70%** neutros claros
* **20%** azul petróleo y azul oscuro
* **10%** acentos verde, morado o naranja

Así mantienes el look corporativo sin saturar la interfaz.

## Propuesta rápida de tema para frontend

**Tema light**

* App background: `#E3E2DA`
* Surface: `#FFFFFF`
* Primary: `#004254`
* Primary dark: `#002532`
* Text: `#002532`
* Muted text: `#646459`
* Border: `#BCBBB5`

**Tema dark opcional**

* Background: `#002532`
* Surface: `#004254`
* Text: `#FFFFFF`
* Border: `#646459`
* Accent success: `#44B757`

## Dirección de diseño

El frontend debería verse:

* limpio
* corporativo
* premium
* técnico
* estable
* con jerarquía clara

Puedo convertir esta extracción en un **design system para React/Next.js** con:

* variables CSS
* tema para MUI o Tailwind
* estilos de botones, cards, tablas, sidebar y header.
