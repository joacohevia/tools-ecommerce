# Plan de Implementación: Modernización de la Interfaz

**Branch**: `002-ui-modernization` | **Fecha**: 2026-08-06 | **Spec**: [`spec.md`](./spec.md)

**Input**: Especificación del feature `specs/002-ui-modernization/spec.md`

**Referencia visual**: [`references/stitch/home.html`](../../references/stitch/home.html) (Google Stitch — solo inspiración, no copiar literal)

## Decisiones de identidad

- **Tema**: se adopta el **tema claro Material-3** de la referencia (`home.html#15-108`). Se abandona el dark actual.
- **Marca**: se mantiene "Herramientas Tandil" (logo actual, datos de contacto, textos). Solo cambia la piel visual.
- **Carrito**: sin ruta nueva. Solo se reestiliza el dropdown existente dentro del Navbar (cumple FR-007).
- **Imágenes**: NO usar las URLs de Google (`lh3.googleusercontent.com`). Reusar `src/assets/hero.png` y `public/herramientas-fondo*.jpg` para Portada/secciones. Las cards usan `productos.imagenes[]` reales.
- **Íconos**: mantener los SVG inline existentes (`card.jsx`, `footer.jsx`). No importar Material Symbols (evitar otra fuente de red).
- **Carruseles**: reemplazar `ui/carousel.jsx` (embla) por el patrón de la referencia `overflow-x-auto snap + hide-scrollbar` en Home. En Ofertas, grid estático.

## Principios del plan

1. **Priorizar clases utilitarias de Tailwind.** `index.css` solo para: estilos reutilizados muchas veces, casos que Tailwind no resuelve, variables globales y estilos base.
2. **El código de Google Stitch es solo referencia visual.** Analizar antes de reusar: ¿se puede con los componentes actuales?, ¿mantiene la arquitectura?, ¿aporta mejora real? Adaptar siempre al proyecto.
3. **Lenguaje visual único en toda la app.** Botones, inputs, selects, cards, badges, tablas, modales y formularios comparten las mismas clases base (definidas en Fase 0).

## Restricciones de la spec (no negociables)

- FR-001: conservar lógica de negocio, API, ruteo y gestión de estado intactos.
- FR-002: cards con dimensiones fijas — `card.jsx` ya tiene `w-[260px] h-[380px]`, mantener.
- FR-003: diseño responsive en desktop, tablet y mobile.
- FR-004: conservar nombres de componentes, estructura de archivos e imports.
- FR-005: sin dependencias nuevas de npm (fuentes vía Google Fonts es válido).
- FR-006: espaciado, tipografía, botones, bordes redondeados, sombras y transiciones hover consistentes.
- FR-007: mantener mismo flujo de navegación, rutas y Context API.

## Resumen

Modernizar la interfaz del e-commerce migrando del tema oscuro actual (Playfair Display + Inter, azul `#3b82f6`, fondo `#0b0f19`) al tema claro Material-3 de la referencia (Hanken Grotesk + Inter, verde `#476800`, fondo `#fcf9f8`). Solo se cambian estilos visuales: la lógica de negocio, rutas, API y estados permanecen intactos.

---

## Mapa de referencia por paso

| Paso | Componente/Archivo | Sección en `home.html` (líneas) |
|---|---|---|
| Fase 0 | Tokens de diseño | `#15-108` (tailwind.config + CSS) |
| 2 | Navbar + busq + carrito dropdown | `#132-184` |
| 3 | Footer | `#516-564` |
| 4 | Portada (Hero) | `#186-209` |
| 5 | Carrusel Más Vendidos | `#210-301` |
| 5 | Novedades | `#302-385` |
| 5 | Categorías | `#386-412` |
| 5 | Ofertas Especiales | `#413-514` |
| 6 | Cards de producto | `#226-301` y `#430-514` |

---

## Orden de implementación

### Fase 0 — Design tokens + clases compartidas

**Objetivo**: establecer los cimientos visuales antes de tocar cualquier componente.

**Referencia**: `home.html#15-108` (sección `tailwind.config` + bloque `<style>`)

#### 0.1 — Reescribir `src/index.css`

- Reemplazar contenido actual por el sistema de tokens del tema claro:
  - `@theme` (Tailwind v4) con la paleta Material-3 completa:

    | Token | Color |
    |---|---|
    | `primary` | `#476800` |
    | `primary-container` | `#97d700` |
    | `primary-fixed-dim` | `#99d907` |
    | `primary-fixed` | `#b4f734` |
    | `surface` | `#fcf9f8` |
    | `surface-container-lowest` | `#ffffff` |
    | `surface-container-low` | `#f6f3f2` |
    | `surface-container` | `#f0edec` |
    | `surface-container-high` | `#ebe7e7` |
    | `surface-container-highest` | `#e5e2e1` |
    | `surface-dim` | `#dcd9d9` |
    | `on-surface` | `#1c1b1b` |
    | `on-surface-variant` | `#424935` |
    | `on-primary` | `#ffffff` |
    | `on-primary-fixed` | `#131f00` |
    | `on-primary-container` | `#3d5900` |
    | `on-secondary` | `#ffffff` |
    | `on-secondary-fixed` | `#1b1b1c` |
    | `on-secondary-fixed-variant` | `#474746` |
    | `outline` | `#737a63` |
    | `outline-variant` | `#c2caaf` |
    | `error` | `#ba1a1a` |
    | `on-error` | `#ffffff` |
    | `error-container` | `#ffdad6` |
    | `inverse-surface` | `#313030` |
    | `inverse-on-surface` | `#f3f0ef` |
    | `surface-tint` | `#476800` |
    | `background` | `#fcf9f8` |
    | `on-background` | `#1c1b1b` |
    | `surface-bright` | `#fcf9f8` |

  - **Spacing**:
    - `stack-sm`: `8px`
    - `stack-md`: `16px`
    - `stack-lg`: `32px`
    - `gutter`: `24px`
    - `section-padding`: `80px`
    - `container-max`: `1280px`
    - `margin-desktop`: `48px`
    - `margin-mobile`: `16px`

  - **Radii**: `DEFAULT`: `2px` — `lg`: `4px` — `xl`: `8px` — `full`: `12px`

  - **Tipografía** (`@import` de Google Fonts):
    - `Hanken Grotesk` (headlines): weights 600, 700, 800
    - `Inter` (body/labels): weights 400, 500, 600
    - Escala de tamaños:
      - `label-bold`: 14px / 20px, weight 600, letter-spacing 0.05em (uppercase)
      - `label-sm`: 12px / 16px, weight 500
      - `body-md`: 16px / 24px, weight 400
      - `body-lg`: 18px / 28px, weight 400
      - `headline-md`: 24px / 32px, weight 600
      - `headline-lg`: 32px / 40px, weight 600, letter-spacing -0.01em
      - `headline-xl`: 48px / 56px, weight 700, letter-spacing -0.02em

  - **Estilos base**:
    ```css
    @layer base {
      body {
        background-color: theme('colors.surface');
        color: theme('colors.on-surface');
        font-family: 'Inter', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
    }
    ```

  - **Utilitarios**: `.hide-scrollbar` (ocultar barra de scroll en carruseles).
  - **Eliminar** todas las variables CSS dark (`--bg-dark`, `--bg-blue-dark`, `--text-primary`, `--text-secondary`, `--accent`) y las directivas de fuente actuales (Playfair Display). Quitar `background-attachment: fixed` y el gradiente oscuro.

- **⚠️ No tocar** las directivas `@import "tailwindcss"` ni los `@tailwind base/components/utilities`.

#### 0.2 — Actualizar `tailwind.config.js`

Mapear los tokens a nombres de clase usables en Tailwind:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#476800',
          container: '#97d700',
          'fixed-dim': '#99d907',
          fixed: '#b4f734',
        },
        surface: {
          DEFAULT: '#fcf9f8',
          'container-lowest': '#ffffff',
          'container-low': '#f6f3f2',
          container: '#f0edec',
          'container-high': '#ebe7e7',
          'container-highest': '#e5e2e1',
          dim: '#dcd9d9',
          bright: '#fcf9f8',
        },
        outline: {
          DEFAULT: '#737a63',
          variant: '#c2caaf',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
      },
      fontFamily: {
        headline: ['Hanken Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      spacing: {
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px',
        gutter: '24px',
        'section-padding': '80px',
        'container-max': '1280px',
        'margin-desktop': '48px',
        'margin-mobile': '16px',
      },
      borderRadius: {
        DEFAULT: '2px',
        lg: '4px',
        xl: '8px',
        full: '12px',
      },
    },
  },
};
```

#### 0.3 — Clases compartidas en `@layer components` (`index.css`)

Definir las clases base que todo componente usará. Esto garantiza FR-006 y el principio #3 (lenguaje visual único).

- **`.btn-primary`** — botón de acción principal (CTA):
  ```css
  .btn-primary {
    @apply bg-primary text-on-primary-fixed font-label-bold text-label-bold
           hover:bg-primary-fixed transition-colors active:scale-95 shadow-sm;
  }
  ```
  Variantes de altura: `.btn-primary.h-10` para cards, `.btn-primary.h-12` para hero.

- **`.btn-secondary`** — botón secundario (outline):
  ```css
  .btn-secondary {
    @apply bg-transparent border border-on-surface text-on-surface
           font-label-bold text-label-bold hover:bg-surface-container
           transition-colors active:scale-95;
  }
  ```

- **`.input`** — campos de formulario (text, email, password, number):
  ```css
  .input {
    @apply w-full px-4 py-2 rounded-md border border-outline-variant
           bg-on-surface/5 text-on-surface placeholder:text-on-surface-variant/70
           focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none
           font-body-md text-body-md transition-colors;
  }
  ```

- **`.select`** — desplegable de selección:
  ```css
  .select {
    @apply border border-outline-variant rounded bg-surface-container-lowest
           px-3 py-2 text-on-surface text-sm focus:border-primary
           focus:ring-1 focus:ring-primary outline-none cursor-pointer;
  }
  ```

- **`.badge`** — etiquetas/insignias:
  ```css
  .badge {
    @apply font-label-sm text-label-sm px-2 py-1 uppercase tracking-wider z-10;
  }
  .badge-oferta {
    @apply badge bg-error text-on-error;
  }
  .badge-descuento {
    @apply badge bg-primary text-on-primary-fixed;
  }
  .badge-rol {
    @apply px-2 py-0.5 rounded-full text-xs;
  }
  .badge-rol-admin {
    @apply badge-rol bg-primary/20 text-primary;
  }
  .badge-rol-cliente {
    @apply badge-rol bg-surface-container text-on-surface-variant;
  }
  ```

- **`.card-shell`** — contenedor base de card de producto:
  ```css
  .card-shell {
    @apply bg-surface-container-lowest border border-outline-variant p-6
           flex flex-col transition-all duration-300;
  }
  .card-shell:hover {
    box-shadow: 0px 4px 20px rgba(0,0,0,0.05);
  }
  ```

- **`.modal-overlay`** y **`.modal-panel`** — contenedores de modal:
  ```css
  .modal-overlay {
    @apply fixed inset-0 z-50 flex items-center justify-center
           bg-black/60 backdrop-blur-sm;
  }
  .modal-panel {
    @apply bg-surface-container-lowest border border-outline-variant
           rounded-xl p-6 shadow-2xl;
  }
  ```

- **`.table-admin`** — tabla de administración:
  ```css
  .table-admin {
    @apply w-full text-sm text-left border border-outline-variant rounded-lg overflow-hidden;
  }
  .table-admin thead {
    @apply bg-surface-container text-on-surface-variant text-xs uppercase
           border-b border-outline-variant;
  }
  .table-admin tbody tr {
    @apply border-b border-outline-variant/50 hover:bg-surface-container;
  }
  ```

**Definición de listo**: al compilar, un botón, input, badge o card se ve idéntico sin importar la página donde esté.

---

### 1 — Layout general

- `App.jsx`: cambiar wrapper `<div>` → layout `flex flex-col min-h-screen bg-surface`. Mover `Footer` al layout de App (hoy está duplicado dentro de `home.jsx` y `productos.jsx` y falta en otras páginas).
- `main.jsx`: sin cambios requeridos (BrowserRouter + StrictMode).
- `App.css`: verificar si se usa. Si está vacío o sin uso, eliminar el import de `App.jsx`.

---

### 2 — Navbar (`nav.jsx` + `busq.jsx`)

**Referencia**: `home.html#132-184`

**Header**:
- Contenedor `fixed top-0 z-50 h-[72px] bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-sm`.
- Padding `px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto`.
- Logo: `<img>` actual + nombre de marca en `font-headline text-headline-md`.

**Links de navegación** (desktop):
- `Inicio` (`/home`): activo si current route = /home → `text-primary` + `border-b-2 border-primary`.
- `Categorías`: dropdown con hover (mantener estructura `relative group`, reestilizar panel `bg-surface-container-lowest border-outline-variant`).
- `Productos` (`/productos`), `Contacto` (`/contacto`), `Admin` (condicional por rol — no tocar lógica): `text-on-surface-variant hover:text-primary`.

**Búsqueda** (`busq.jsx`):
- Ícono search con posicionamiento absoluto. `.input` en `max-w-xs`.
- Mantener lógica de dropdown de resultados + navegación.

**Menú hamburguesa** (nuevo, <768px):
- Ícono SVG hamburguesa/close. Al abrir: menú lateral o panel dropdown con los mismos links. No tocar las rutas de navegación.

**Dropdown de carrito** (reestilizar, sin nueva ruta):
- Panel `bg-surface-container-lowest border-outline-variant rounded-md shadow-lg p-4 max-w-sm`.
- Ícono con badge de conteo (`bg-error text-on-error rounded-full`).
- Items: imagen miniatura, nombre, marca, precio (con oferta tachada), controles `+/−`, Vaciar y Comprar.
- Clases `.btn-primary`/`.btn-secondary` para botones.

**Menú usuario** (reestilizar):
- Panel `bg-surface-container-lowest border-outline-variant`. Mantener lógica login/registro/logout/rol intacta.

---

### 3 — Footer (`footer.jsx`)

**Referencia**: `home.html#516-564`

- 4 columnas (`md:grid-cols-4`), fondo oscuro `bg-[#1b1b1c]` para contraste (como la referencia).
- Col 1: logo actual + slogan (`font-headline-lg text-primary-fixed`, body-md `text-on-secondary-fixed-variant`).
- Col 2: navegación (`font-label-bold text-on-secondary uppercase tracking-wider` para título, links con `text-on-secondary-fixed-variant hover:text-primary-fixed`).
- Col 3: horarios (datos reales del footer actual: L-V 8-18, Sáb 8-13, Dom cerrado). Ícono reloj SVG actual.
- Col 4: newsletter (`bg-surface/10 border-on-secondary-fixed-variant` para input, botón con `bg-primary-fixed`).
- Bottom bar: copyright + social icons (SVG actuales).
- Conservar datos reales: WhatsApp, teléfono, email, dirección, medios de pago (del footer actual).

---

### 4 — Portada (Hero)

**Referencia**: `home.html#186-209`

- Sección dentro de `home.jsx` (nuevo componente `portada.jsx` o inline). Único componente nuevo permitido (spec, suposiciones).
- `<section>` `relative h-[500px] md:h-[600px] bg-surface-container-low overflow-hidden`.
- Fondo: `<img>` con `src/assets/hero.png` o `public/herramientas-fondo.jpg`, `object-cover opacity-60 mix-blend-multiply grayscale`.
- Overlay gradiente: `absolute inset-0 bg-gradient-to-r from-surface via-surface/80 to-transparent`.
- Contenido `relative z-10`, centrado (`flex items-center text-center`):
  - Eyebrow: `font-label-bold text-label-bold text-primary uppercase tracking-wider`.
  - Título: `font-headline-xl text-headline-xl text-on-surface`.
  - Descripción: `font-body-lg text-body-lg text-on-surface-variant max-w-xl mx-auto`.
  - CTAs (2 botones):
    - `.btn-primary` → `Comprar Herramientas` (link a `/productos`).
    - `.btn-secondary` → `Ver Promociones` (link a `/productos?destacado=true`).

- **No usar** las imágenes de `lh3.googleusercontent.com`. Usar assets locales.

---

### 5 — Home (`home.jsx`)

Componer las secciones en orden: Portada → Más Vendidos → Categorías → Novedades → Ofertas.

#### 5.1 — Carruseles (`carrouselOfertas.jsx`, `carrouselVendidos.jsx`)

**Referencia**: `home.html#210-301` y `#413-514`

- Reemplazar `ui/carousel.jsx` (embla) por:
  - Contenedor `flex overflow-x-auto gap-gutter hide-scrollbar snap-x snap-mandatory`.
  - Cards con `snap-start flex-shrink-0 w-[280px]`.
  - Botones chevron prev/next: `.btn-secondary` circulares (`w-10 h-10`).
- Sección Más Vendidos: `py-section-padding bg-surface-container-low`. Header con `headline-lg` + subtítulo `body-md` + botones de navegación.
- Sección Ofertas: `py-section-padding bg-surface` (o surface-container-high con overlay imagen). Misma estructura de header + carrusel. En cards de oferta: badge "Oferta" (`badge-oferta`), precio tachado, cuotas, botón reveal on hover (`opacity-0 group-hover:opacity-100 translate-y-2`).
- Conservar `getProductos({ destacado: true })` y `getProductos({ mas_vendido: true })`.

#### 5.2 — Categorías (`seccionHerramientas.jsx`)

**Referencia**: `home.html#386-412`

- Rediseñar completamente como CTA central (no la grilla de cards actual):
  - Contenedor `relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg group`.
  - Fondo: `public/herramientas-fondo.jpg` con overlay `bg-black/50` + `group-hover:scale-105 transition-transform`.
  - Texto: `headline-xl text-on-primary text-center`.
  - Botones de categorías: `.btn-primary` + `rounded` linkeando a `/productos?categoria=slug`.
  - Conservar `getCategorias()` para generar botones dinámicamente.

#### 5.3 — Novedades (`seccionNov.jsx`)

**Referencia**: `home.html#302-385`

- Fondo con imagen overlay (usar `herramientas-fondo-2.jpg`), overlay `bg-black/70`.
- Contenido sobre fondo: `headline-lg text-white text-center`.
- Grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter`.
- Conservar `getProductos().slice(0, 6)`.

#### 5.4 — `seccionDescripcion.jsx`

- Placeholder vacío actual. Reestilizar mínimo o eliminar del home si no tiene contenido.

---

### 6 — Cards (`card.jsx`)

**Referencia**: `home.html#226-301` y `#430-514`

- Mantener dimensiones fijas `w-[260px] h-[380px]` (SC-002, ya cumple).
- Envolver en `.card-shell`.
- Imagen: `aspect-square bg-surface-container-low`, `object-contain w-3/4 h-3/4`, hover `scale-105`.
- Título: `line-clamp-2` (ajustar de 3 a 2 líneas para que no desborde los 380px de altura — la spec permite hasta 3, 2 es más seguro visualmente).
- Marca: `font-label-sm text-label-sm text-on-surface-variant uppercase`.
- Precio:
  - Si hay oferta: precio regular `text-on-surface-variant line-through` + precio efectivo `font-headline-md text-headline-md text-primary`.
  - Sin oferta: `font-headline-md text-headline-md text-on-surface`.
- Badges (Oferta, -15%, Destacado, NUEVO) con `.badge-oferta`, `.badge-descuento`, etc.
- Botón `.btn-primary` full width (`h-10`).
- En cards de Ofertas: reveal del botón on hover (`opacity-0 group-hover:opacity-100 translate-y-2`).
- **Admin**: conservar botones editar/eliminar (íconos PencilIcon/TrashIcon actuales) reestilizados con `bg-surface-container-lowest/90 border-outline-variant`.

---

### 7 — Productos (`productos.jsx` + `filtrado.jsx`)

- Breadcrumb: conservar estructura, aplicar tokens claros (`.text-on-surface-variant hover:text-on-surface`).
- Top bar: contador de resultados (`text-on-surface-variant text-sm`), botones admin con `.btn-primary` (quitar verde/azul/púrpura, unificar a primary), select de orden `.select`.
- `filtrado.jsx`:
  - Sidebar con fondo `bg-surface-container`, bordes `border-outline-variant`.
  - Checkboxes de marca/categoría: `accent-primary`.
  - Inputs de precio min/max: `.input` en `w-full`.
- Grilla: `grid-cols-2 sm:grid-cols-2 lg:grid-cols-3`, `justify-items-center`, gap uniforme.
- Empty state (`No se encontraron productos`): `text-on-surface-variant`, centrado.
- Loading/error states: reestilizar con tokens claros.
- Modales admin:
  - Crear `<Modal>` compartido (ver paso 11).
  - `ModalCategorias`/`ModalMarcas`: usar `.modal-overlay` + `.modal-panel`.
  - Lista de items: `bg-surface-container rounded` con acciones (✏️ editar, 🗑️ eliminar) reestilizadas.

---

### 8 — Producto Detalle (`cardDetail.jsx`)

- Breadcrumb: Inicio → Productos → Categoría → Nombre (mantener estructura). `.text-on-surface-variant` / `.text-on-surface`.
- Layout `flex flex-col md:flex-row gap-6`:
  - Thumbnails (columna izquierda en desktop, fila horizontal en mobile). Borde `border-primary` en selección.
  - Imagen principal: `bg-surface-container-low rounded-xl`, `object-contain`.
  - Info (columna derecha): `headline-lg`, marca `body-md`, precio `headline-xl text-primary` + tachado + "efectivo", stock, descripción en lista `list-disc space-y-2`.
  - CTAs: `.btn-primary` full-width Agregar al carrito.
- Responsive: <768px thumbnails en fila arriba, imagen principal, info abajo. Sin superposición.
- Conservar lógica `useParams`, `getProductoById`, `useCarrito`.

---

### 9 — Login / Registro (`login.jsx`, `registro.jsx`)

- Contenedor `min-h-screen flex items-center justify-center bg-surface px-4`.
- Card de formulario: `max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-xl`.
- `headline-md text-on-surface text-center`.
- Inputs: `.input` (reemplazar `bg-white/10 border-white/20 text-dark-text` por `.input`).
- Botón: `.btn-primary` full-width.
- Error: `bg-error-container border border-error text-on-error-container rounded-md p-3 text-sm` (reemplazar `bg-red-500/20`).
- Links: `text-primary hover:underline` (reemplazar `text-blue-400`).
- Conservar lógica `AuthContext` (login/signup, estados, navegación post-login, confirmación de correo).

---

### 10 — Panel de administración (`admin.jsx`)

- Contenedor `min-h-screen bg-surface py-8 px-4`.
- Título `headline-lg text-on-surface`.
- Input de búsqueda: `.input max-w-md`.
- Tabla: `.table-admin` con `.badge-rol-admin` / `.badge-rol-cliente`.
- Acciones edit/delete: SVG reestilizados con `text-on-surface-variant hover:text-primary` / `hover:text-error`.
- Loading/error/empty: tokens claros.
- Conservar lógica `getPerfiles`, `updatePerfilRol`, `deletePerfil`, `confirm`, `toast`.

---

### 11 — Formularios + Modal compartido

**Nuevo**: `src/components/ui/modal.jsx`

- Componente `<Modal onClose>` que renderiza `.modal-overlay` (cierra con click fuera o Escape) + `.modal-panel` (detiene propagación). Acepta `children`, `className`, `maxWidth`.
- Reemplazar los 5 overlays inline duplicados en `productos.jsx`:
  - Formulario de producto (crear/editar)
  - Modal categorías (lista / crear / editar)
  - Modal marcas (lista / crear / editar)
- `productForm.jsx`, `categForm.jsx`, `marcaForm.jsx`:
  - Reestilizar inputs/selects/textarea con `.input`/`.select`.
  - Botones: `.btn-primary` (Guardar) / `.btn-secondary` (Cancelar).
  - Labels: `font-label-bold text-label-bold text-on-surface mb-1`.
  - Upload de imagen: mantener flujo canvas → `uploadImagen` → URL (sin cambios lógicos), reestilizar preview y botón de subir.
- Mantener props `producto`/`categoria`/`marca`, `onSaved`, y toda la lógica de validación/creación/edición intacta.

---

### 12 — Contacto + alertas

- `contacto.jsx`: reestilizar formulario de contacto y datos de la empresa con tokens claros (`.input`, `.btn-primary`).
- `alert/toast.jsx`: reestilizar con `bg-surface-container-lowest border-outline-variant`. Colores semánticos:
  - Success: `bg-primary-container/20 border-primary text-on-primary-container`
  - Error: `bg-error-container/20 border-error text-error`
  - Info: `bg-surface-container-high border-outline-variant text-on-surface-variant`
- `alert/confirmDialog.jsx`: `.modal-overlay` + `.modal-panel`. Botones `.btn-primary` (confirmar) / `.btn-secondary` (cancelar).
- `alert/alert.jsx`: reestilizar con los mismos tokens.
- Mantener API: `toast.success()`, `toast.error()`, `toast.info()`, `toast.warning()`, `confirm()`, `alert()`.

---

### 13 — Ajustes responsive

- Verificar todos los breakpoints Tailwind por defecto.
- <768px: sin scroll horizontal (SC-001). Header hamburguesa, cards de igual ancho apiladas, botones hit-area ≥44px.
- `/producto/:id`: galería reflow correcto (thumbnails en fila arriba → imagen principal → info → CTA).
- `admin.jsx`: tabla con `overflow-x-auto` en mobile.
- Modales: `max-h-[90vh] overflow-y-auto` en mobile.

---

### 14 — Ajustes finales

- Limpiar clases remanentes en todo `src/`: `dark-*`, `bg-dark-blue`, `text-dark-text`, `text-dark-muted`, `border-white/10`, `border-white/20`, `bg-white/5`, `bg-white/10`, `bg-black`, `text-blue-400`, `bg-blue-600`, `hover:bg-blue-500`, `bg-red-600`, `bg-green-600`, `bg-purple-600`.
- Eliminar import de `App.css` si se vació.
- Recorrer botones, inputs, selects, cards, badges, tablas y modales verificando que usen las clases compartidas (`@layer components`).

---

### 15 — Verificación

- `npm run lint` sin errores.
- `npm run build` sin errores.
- Verificar acceptance scenarios contra la spec:
  - **US1 (SC-002)**: cards con dimensiones idénticas en `/home` y `/productos` (±2px). Hover con sombra sutil sin layout shift.
  - **US2 (SC-001)**: <768px sin scroll horizontal. Galería de `/producto/:id` reorganiza correctamente.
  - **US3**: header idéntico navegando `/home` → `/productos` → `/contacto` → `/producto/:id`.
  - **Casos borde**: título largo → truncar en 2-3 líneas. Imagen ancha → `object-contain` + aspect ratio.
- Lighthouse (SC-003): performance dentro del 10% de baseline.
- Skill `webapp-testing` (Playwright): capturas de pantalla y verificación funcional en los 3 breakpoints.

---

## Estructura de archivos esperada

```text
src/
├── index.css                     # [REWRITE] @theme tokens + @layer components (clases compartidas)
├── tailwind.config.js            # [MODIFIED] mapeo paleta/spacing/fuentes
├── App.jsx                       # [MODIFIED] fondo surface + Footer global
├── App.css                       # [ELIMINAR] si queda vacío
├── http.js                       # SIN CAMBIOS
├── components/
│   ├── nav.jsx                   # [MODIFIED] estilo claro + dropdown carrito + hamburguesa
│   ├── footer.jsx                # [MODIFIED] 4 columnas estilo referencia
│   ├── busq.jsx                  # [MODIFIED] input con tokens, dropdown conservado
│   ├── filtrado.jsx              # [MODIFIED] sidebar con tokens claros
│   ├── card.jsx                  # [MODIFIED] card-shell + badges, dims fijas 260×380
│   ├── ui/
│   │   ├── carousel.jsx          # [OBSOLETO] reemplazado por scroll-snap en Home (no borrar, por si hay otro uso)
│   │   └── modal.jsx             # [NEW] Modal compartido
│   ├── alert/
│   │   ├── toast.jsx             # [MODIFIED] tokens claros + colores semánticos
│   │   ├── confirmDialog.jsx     # [MODIFIED] modal-shell
│   │   └── alert.jsx             # [MODIFIED] tokens claros
│   ├── carrouseles/
│   │   ├── carrouselOfertas.jsx  # [MODIFIED] scroll-snap + chevrons
│   │   └── carrouselVendidos.jsx # [MODIFIED] scroll-snap + chevrons
│   ├── secciones/
│   │   ├── seccionHerramientas.jsx # [MODIFIED] CTA central con categorías
│   │   ├── seccionNov.jsx        # [MODIFIED] grid sobre fondo oscuro
│   │   └── seccionDescripcion.jsx# [MODIFIED] mínimo o eliminado del Home
│   ├── form/
│   │   ├── productForm.jsx       # [MODIFIED] .input/.btn + Modal shared
│   │   ├── categForm.jsx         # [MODIFIED] .input/.btn
│   │   └── marcaForm.jsx         # [MODIFIED] .input/.btn
│   └── pages/
│       ├── home.jsx              # [MODIFIED] compone Portada + secciones
│       ├── productos.jsx         # [MODIFIED] + Modal compartido
│       ├── cardDetail.jsx        # [MODIFIED] galería + info con tokens
│       ├── login.jsx             # [MODIFIED] card + .input + .btn-primary
│       ├── registro.jsx          # [MODIFIED] card + .input + .btn-primary
│       ├── admin.jsx             # [MODIFIED] .table-admin + .badge-rol
│       ├── contacto.jsx          # [MODIFIED] tokens claros
│       └── quienes-somos.jsx     # [NO TOCAR] sin ruta actual
```
