# Plan de Implementación: Mejoras de Experiencia de Usuario

**Branch**: `003-ux-improvements` | **Fecha**: 2026-08-07 | **Spec**: [`../spec.md`](../spec.md)

**Input**: Feature specification from `specs/003-ux-improvements/spec.md`

## Resumen

Mejorar la experiencia de usuario del e-commerce corrigiendo problemas de navegación (scroll-to-top, logout redirect, breadcrumb faltante, reseteo de filtros), implementando menú hamburguesa mobile, panel de filtros como bottom sheet, toggle de visibilidad de contraseña, botón flotante de WhatsApp, animaciones en cards (hover + "Agregar al carrito"), y mejoras responsive en selects y formularios. Todos los cambios son puramente frontend: visuales y de UX, sin modificar backend ni lógica de negocio.

## Technical Context

**Language/Version**: JavaScript JSX (React 19)
**Primary Dependencies**: React 19, react-router-dom v7, Tailwind CSS v4
**Storage**: N/A (sin cambios en datos)
**Testing**: Vitest + @testing-library/react + jsdom (tests en `tests/frontend/`)
**Target Platform**: Web SPA (desktop + mobile)
**Project Type**: Frontend-only enhancements
**Performance Goals**: Animaciones CSS sin impacto en rendimiento (< 50ms frame budget)
**Constraints**: Sin nuevas dependencias npm, sin cambios en backend, sin modificar lógica de negocio (FR-018)

## Constitution Check

| Principle | Status | Evidence |
|---|---|---|
| I. Frontend HTTP Abstraction | ✅ PASS | Sin nuevas llamadas HTTP. WhatsApp usa protocolo `https://wa.me/` externo, no API interna. |
| II. Backend REST API | ⚠️ N/A | Sin cambios en backend. |
| III. Image Processing Pipeline | ⚠️ N/A | Sin cambios en imágenes. |
| IV. Server-Side Validation | ⚠️ N/A | Sin cambios en validación. |
| V. React Component Conventions | ✅ PASS | Cambios en componentes existentes (nav.jsx, card.jsx, login.jsx, registro.jsx, contacto.jsx, cardDetail.jsx, productos.jsx, filtrado.jsx). Nombres lowercase. Tailwind utility classes. |
| VI. Explicit Data States | ✅ PASS | Sin nuevos fetches. Estados existentes se conservan. |
| VII. Routing Conventions | ✅ PASS | Sin nuevas rutas. Link y useNavigate existentes. scroll-to-top vía useEffect + useLocation. |
| VIII. Filtering & URL Sync | ✅ PASS | Reseteo de filtros al clickear "Productos" en nav. Bottom sheet mantiene estado de filtros mobile. |
| IX. Documentation | ✅ PASS | JSDoc en componentes nuevos (WhatsAppButton) y funciones exportadas. |
| X. Responsive & Mobile-First | ✅ PASS | **Feature completa de responsive**. Menú hamburguesa mobile, bottom sheet filtros, selects responsive. Diseño mobile-first en los 3 breakpoints. |

**Gate result**: PASS — 0 violations.

## Project Structure

### Source Code Changes

```text
src/
├── index.css                           # [MODIFIED] Animación add-to-cart, hover card
├── App.jsx                             # [MODIFIED] Scroll-to-top en navegación, Footer global
├── components/
│   ├── nav.jsx                         # [MODIFIED] Menú hamburguesa mobile, scroll-to-top, reseteo filtros, logout redirect
│   ├── card.jsx                        # [MODIFIED] Admin buttons visible, hover scale-105, animación add-to-cart
│   ├── filtrado.jsx                    # [MODIFIED] Modo mobile (bottom sheet) + desktop (sidebar)
│   ├── busq.jsx                        # [MODIFIED] (si requiere ajustes responsive)
│   ├── whatsappButton.jsx              # [NEW] Botón flotante WhatsApp
│   └── pages/
│       ├── home.jsx                    # [MODIFIED] Integrar WhatsAppButton
│       ├── productos.jsx               # [MODIFIED] Botón "Filtros" mobile, WhatsAppButton, breadcrumb
│       ├── cardDetail.jsx             # [MODIFIED] Breadcrumb funcional
│       ├── contacto.jsx                # [MODIFIED] Breadcrumb
│       ├── login.jsx                   # [MODIFIED] Toggle visibilidad contraseña
│       └── registro.jsx                # [MODIFIED] Toggle visibilidad contraseña
│   └── form/
│       └── productForm.jsx            # [MODIFIED] Selects responsive

tests/
└── frontend/
    └── components/
        ├── card.test.jsx               # [MODIFIED] Tests admin buttons visible, hover, animación
        ├── nav.test.jsx                # [NEW] Tests menú hamburguesa, scroll-to-top, logout redirect
        ├── filtrado.test.jsx           # [NEW] Tests bottom sheet mobile vs sidebar desktop
        ├── whatsappButton.test.jsx     # [NEW] Tests renderizado condicional, link wa.me
        ├── login.test.jsx              # [NEW] Tests toggle contraseña
        └── registro.test.jsx           # [NEW] Tests toggle contraseña
```

---

## Fase 0 — Design Tokens & Shared CSS

### 0.1 — Nuevas utilidades en `index.css`

Agregar en `@layer components`:

- **`.card-hover`**: `transition-transform duration-200 hover:scale-105` para cards.
- **`.btn-add-to-cart`**: Animación de confirmación. Al agregar `added` class: cambio de color a `bg-primary-container`, texto "Agregado ✓" por 1s, luego revierte.
- **`.whatsapp-float`**: Botón flotante fixed bottom-left con sombra, `z-50`.

### 0.2 — Tamaños responsive en `@theme`

Si es necesario, agregar spacing para touch targets mobile (44px mínimo).

---

## Fase 1 — US1: Navegación mejorada y breadcrumb (P1)

### 1.1 — Scroll-to-top en navegación (`App.jsx`)

Agregar `ScrollToTop` wrapper component que use `useLocation` + `useEffect` para hacer `window.scrollTo(0, 0)` en cada cambio de ruta.

### 1.2 — Logout redirect (`nav.jsx`)

En el handler de logout dentro de `nav.jsx`, después de llamar a `signOut()`, ejecutar `navigate('/home')`.

### 1.3 — Nav "Productos" limpia filtros (`nav.jsx`)

El Link a `/productos` debe resetear filtros. Opciones:
- **A**: Agregar `key` al componente Productos que cambie al navegar vía nav (force remount).
- **B**: En `productos.jsx`, detectar navegación sin `?categoria=` y resetear filtros.
- **C**: Usar `navigate('/productos', { replace: true })` + window.location.reload().

→ Se elige **opción C** por simplicidad: `onClick` en el Link/button de "Productos" ejecuta `window.location.href = '/productos'` (recarga completa, limpia estado).

### 1.4 — Breadcrumb en Contacto (`contacto.jsx`)

Agregar breadcrumb al inicio del contenido:
```jsx
<nav className="text-sm text-on-surface-variant mb-6">
  <ol className="flex items-center gap-1.5">
    <li><Link to="/home" className="hover:text-on-surface">Inicio</Link></li>
    <li>/</li>
    <li className="text-on-surface font-medium">Contacto</li>
  </ol>
</nav>
```

### 1.5 — Breadcrumb en Detalle de Producto (`cardDetail.jsx`)

Ya existe parcialmente. Verificar que incluya la categoría y el nombre real del producto.

---

## Fase 2 — US2: Menú hamburguesa mobile (P1)

### 2.1 — Ícono hamburguesa (`nav.jsx`)

En viewports < 768px, mostrar ícono SVG hamburguesa debajo del logo. Ocultar nav horizontal (`hidden md:flex`).

### 2.2 — Panel del menú (`nav.jsx`)

Al clickear hamburguesa, mostrar panel `fixed` deslizable desde la izquierda con:
- Links: Inicio, Productos, Contacto, Admin (si corresponde)
- Categorías: botón expandible que muestra sub-lista hacia abajo con transición

### 2.3 — Categorías desplegables (`nav.jsx`)

Reutilizar `getCategorias()` (o pasar como prop). Al tocar "Categorías", expandir/colapsar sub-lista con animación `max-height` + `overflow-hidden transition-all`.

### 2.4 — Cerrar menú al navegar (`nav.jsx`)

Al clickear cualquier link del menú, cerrar el panel y navegar.

---

## Fase 3 — US3: Filtros mobile como panel emergente (P2)

### 3.1 — Botón "Filtros" (`productos.jsx`)

En mobile (< 768px), reemplazar sidebar de filtros por un botón:
```jsx
<button className="btn-secondary text-sm" onClick={() => setShowFilters(true)}>
  Filtros
</button>
```
Ubicado debajo del selector "Ordenar por".

### 3.2 — Panel bottom sheet (`productos.jsx` o `filtrado.jsx`)

Al abrirse, renderizar un overlay semi-transparente + panel que desliza desde abajo:
```jsx
{showFilters && (
  <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowFilters(false)}>
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest rounded-t-xl max-h-[80vh] overflow-y-auto p-5 animate-slide-up" onClick={e => e.stopPropagation()}>
      <button className="absolute top-3 left-3 text-on-surface" onClick={() => setShowFilters(false)}>✕</button>
      <Filtrado ... />
    </div>
  </div>
)}
```

### 3.3 — Animación slide-up (`index.css`)

```css
@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up { animation: slide-up 0.3s ease-out; }
```

### 3.4 — Desktop sidebar sin cambios

En ≥ 768px, el filtrado se muestra como sidebar lateral (comportamiento actual).

---

## Fase 4 — US4: Admin buttons visibles + hover en cards (P2)

### 4.1 — Botones admin visibles (`card.jsx`)

Revisar que los botones de Editar/Eliminar tengan `z-20` o mayor y un fondo sólido (`bg-surface-container-lowest/90`) para ser visibles sobre la imagen. Verificar que `absolute top-3 right-3` no se solapen con otros elementos.

### 4.2 — Hover scale en cards (`card.jsx`)

Agregar clase `.card-hover` al `<Link>` raíz:
```jsx
className="card-shell ... transition-transform duration-200 hover:scale-105"
```
Asegurar que la card tenga `overflow-hidden` para que el scale no desborde bordes redondeados.

---

## Fase 5 — US5: Toggle visibilidad de contraseña (P2)

### 5.1 — Hook o estado local (`login.jsx`, `registro.jsx`)

Agregar estado `showPassword` (boolean). El input alterna `type={showPassword ? 'text' : 'password'}`.

### 5.2 — Ícono ojo

SVG inline dentro del input (posicionado absolute right-3). Dos variantes: ojo abierto y ojo tachado. Click → toggle `showPassword`.

```jsx
<div className="relative">
  <input type={showPassword ? 'text' : 'password'} className="input pr-10" ... />
  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>
```

---

## Fase 6 — US6: Animación "Agregar al carrito" (P3)

### 6.1 — Estado de feedback (`card.jsx`)

Agregar estado local `added` (boolean, false por defecto). Al clickear:
1. Set `added = true`
2. `setTimeout(() => setAdded(false), 1000)`
3. Llamar `agregarAlCarrito` normalmente

### 6.2 — Clases CSS condicionales (`card.jsx`)

```jsx
<button className={`btn-primary btn-primary-sm mt-auto w-full py-1 sm:py-2 ... transition-all duration-300 ${
  added ? 'bg-primary-container text-on-primary-container' : ''
}`}>
  {added ? 'Agregado ✓' : 'Agregar al carrito'}
</button>
```

---

## Fase 7 — US7: Botón flotante WhatsApp (P3)

### 7.1 — Componente `whatsappButton.jsx` (NUEVO)

```jsx
const WHATSAPP_NUMBER = ''; // Configurable

export default function WhatsAppButton() {
  if (!WHATSAPP_NUMBER) return null;
  return (
    <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer"
       className="whatsapp-float fixed bottom-6 left-6 z-50 bg-[#25D366] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
      <WhatsAppIcon />
    </a>
  );
}
```

### 7.2 — Integrar en Home y Productos

Agregar `<WhatsAppButton />` en `home.jsx` y `productos.jsx` (o en `App.jsx` junto al Footer para que aparezca en todas las páginas; verificar que no moleste en login/registro).

---

## Fase 8 — US8: Selects responsive y formularios mobile (P3)

### 8.1 — "Ordenar por" responsive (`productos.jsx`)

Verificar que el `<select>` no desborde en mobile. Si es necesario, agregar `max-w-full` o `w-full sm:w-auto`.

### 8.2 — Selects en formulario de producto (`productForm.jsx`)

Los `<select>` de categoría y marca deben ser `w-full` en mobile y tener `text-base` (16px) para evitar zoom automático en iOS al hacer focus.

---

## Fase 9 — Testing

### 9.1 — Tests de componentes

| Test file | Qué prueba |
|---|---|
| `card.test.jsx` | Admin buttons visibles (con mock AuthContext admin), hover class presente, animación add-to-cart, toggle de texto "Agregado ✓" |
| `nav.test.jsx` | Menú hamburguesa visible en mobile, links correctos, logout redirect, click "Productos" recarga |
| `filtrado.test.jsx` | Bottom sheet en mobile vs sidebar en desktop, botón "Filtros" visible solo en mobile |
| `whatsappButton.test.jsx` | No renderiza si número vacío, renderiza link wa.me si configurado |
| `login.test.jsx` | Toggle contraseña alterna visibilidad, ícono ojo cambia |
| `registro.test.jsx` | Toggle contraseña (misma lógica que login) |

### 9.2 — Ejecución

```sh
npm run test:run        # Todos los tests
npm run lint            # ESLint
npm run build           # Verificar build
```

---

## Fase 10 — Verificación

- **SC-001**: Navegar entre páginas → scrollY = 0 en todas.
- **SC-002**: Breadcrumb visible en Home, Productos, Contacto, Detalle.
- **SC-003**: Menú hamburguesa mobile con 100% de opciones del nav desktop.
- **SC-004**: Admin buttons visibles e identificables en < 3s.
- **SC-005**: 100% de clics en "Agregar al carrito" producen animación.
- **SC-006**: Toggle contraseña alterna en ambos formularios.
- **SC-007**: Bottom sheet abre/cierra en < 300ms.
- **SC-008**: Sin regresiones en funcionalidad existente.
- `npm run lint` sin errores.
- `npm run build` sin errores.
- `npm run test:run` todos los tests pasan.
