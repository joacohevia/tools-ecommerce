<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Reason: MINOR — Added Principle X (Responsive & Mobile-First).

Modified principles: None
Added sections:
  - Principle X. Responsive & Mobile-First

Removed sections: None

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check is generic, no changes needed
  ✅ .specify/templates/spec-template.md — requirements/scenarios generic, no changes needed
  ✅ .specify/templates/tasks-template.md — task categorization generic, no changes needed
  ✅ .specify/templates/checklist-template.md — no constitution references, no changes needed

Follow-up TODOs: None — all placeholders resolved.
-->

# Herramientas-Tandil Constitution

## Core Principles

### I. Frontend HTTP Abstraction

Toda comunicación del frontend con el backend DEBE pasar exclusivamente por `src/http.js`.
Ningún componente React, hook, utilidad ni página puede llamar a `fetch`, `XMLHttpRequest`,
`axios` o al cliente `@supabase/supabase-js` de forma directa. Las funciones en `http.js`
encapsulan toda petición HTTP y retornan promesas con datos tipados.

**Razón**: Un único punto de acceso facilita cambios de API, manejo centralizado de errores,
reintentos y futura migración de la capa de datos sin tocar componentes individuales.

### II. Backend REST API

El backend expone exclusivamente endpoints REST bajo el prefijo `/api/*` usando Express 5
(ES Modules). Las queries a la base de datos usan `@supabase/supabase-js` (anon key) y los
uploads de archivos usan `supabase.storage`. No se permite SQL raw ni acceso directo a la
base de datos desde el frontend.

**Razón**: Separación estricta de responsabilidades. El backend es el único que interactúa
con Supabase; el frontend solo consume la API REST.

### III. Image Processing Pipeline

Las imágenes de productos DEBEN seguir el flujo de procesamiento establecido:

1. El frontend comprime la imagen con canvas (max 800px de lado mayor).
2. `POST /api/upload` recibe el archivo via `multipart/form-data`.
3. El backend procesa con `multer` (recepción) → `sharp` (redimension a 800px, conversión
   a WebP con calidad 75%, ~50-150 KB final).
4. El resultado se sube al bucket `productos` de Supabase Storage.
5. Se devuelve la URL pública al frontend, que la almacena en `productos.imagenes[]`.

No se DEBE saltar la compresión ni subir formatos o tamaños distintos sin autorización
explícita.

**Razón**: Optimización de ancho de banda, consistencia visual (todas las imágenes tienen
el mismo tamaño máximo) y performance de carga en la tienda.

### IV. Server-Side Validation

Toda validación y sanitización de datos DEBE ocurrir en el servidor. Los datos recibidos del
cliente se consideran no confiables por defecto. Cada endpoint del backend DEBE validar tipos,
rangos, slugs, integridad referencial y reglas de negocio antes de procesar la petición.

**Razón**: Seguridad e integridad de datos. El frontend puede validar como UX, pero la
validación definitiva es responsabilidad exclusiva del servidor.

### V. React Component Conventions

Los componentes React DEBEN seguir estas reglas:

- Nombres de archivo en lowercase (`nav.jsx`, `card.jsx`, `filtrado.jsx`).
- Separar presentación de lógica de datos: los componentes renderizan, las funciones en
  `http.js` obtienen/envían datos.
- Seguir el patrón `loading | error | data` en todo componente que haga fetch.
- Usar exclusivamente Tailwind utility classes para estilos nuevos.
- El tema visual se define en `index.css` mediante variables CSS (`--bg-dark`,
  `--bg-blue-dark`, `--text-primary`, `--text-secondary`, `--accent`).

**Razón**: Consistencia en todo el codebase, predictibilidad para nuevos desarrolladores
y separación clara de responsabilidades.

### VI. Explicit Data States

Todo componente que consuma datos asincrónicos DEBE manejar explícitamente los estados:

- **loading**: Indicador visual mientras la petición está en curso (spinner, skeleton, etc.).
- **error**: Mensaje descriptivo del error, sin crashear el componente.
- **data**: Renderizado normal de los datos obtenidos.
- **empty** (cuando aplica): Mensaje para listas vacías (ej. "No se encontraron productos").

**Razón**: Evita pantallas en blanco, mejora la experiencia de usuario y facilita el
debugging al tener estados explícitos y predecibles.

### VII. Routing Conventions

El enrutamiento DEBE usar `react-router-dom` v7 con los siguientes patrones:

- `BrowserRouter` montado en `main.jsx`.
- `Routes` y `Route` definidos en `App.jsx`.
- Navegación mediante `Link` (declarativa) y `useNavigate` (programática).
- Parámetros de query con `useSearchParams`.
- Las rutas definidas son: `/home`, `/productos`, `/producto/:id`, `/contacto`, `/login`,
  `/registro`.

**Razón**: API de routing estandarizada en todo el proyecto. El uso consistente de hooks
de react-router-dom evita recargas de página y mantiene la experiencia SPA.

### VIII. Filtering & URL Synchronization

El patrón de filtrado en el catálogo (`/productos`) DEBE implementarse con:

- `useState` para los filtros activos (marca, categoría, rango de precio, orden).
- `useMemo` para derivar datos filtrados/ordenados (evitar recálculos innecesarios).
- `useSearchParams` para sincronizar filtros con la URL (ej. `?categoria=herramientas`),
  permitiendo deep-linking y navegación hacia atrás.

**Razón**: Performance (useMemo evita re-renders costosos), compartibilidad de URLs
filtradas y correcto comportamiento del historial del navegador.

### IX. Documentation

Las funciones exportadas y los helpers con lógica compleja DEBEN incluir JSDoc con:

- `@param` para cada parámetro (nombre y tipo).
- `@returns` para el valor de retorno.
- Descripción concisa del propósito y comportamiento.

Los comentarios en el código DEBEN explicar el **por qué** (decisiones, workarounds,
reglas de negocio), no el **qué** (el código ya muestra qué hace). Los nombres de
variables, funciones y archivos DEBEN ser explícitos y descriptivos.

**Razón**: Código autodocumentado reduce la necesidad de comentarios superfluos.
JSDoc permite generar referencias y mejora el intellisense en editores.

### X. Responsive & Mobile-First

Todos los componentes React del frontend DEBEN ser responsive y soportar dispositivos
móviles desde su implementación inicial. La interfaz DEBE seguir un enfoque mobile-first,
adaptándose correctamente a al menos tres breakpoints:

- **Móvil** (por defecto, < 640px): layouts en columna única, touch targets >= 44px,
  navegación accesible con pulgares.
- **Tablet** (sm: 640px, md: 768px): layouts en 2 columnas donde aplique, sidebars
  colapsables.
- **Escritorio** (lg: 1024px, xl: 1280px): layouts en múltiples columnas, sidebars
  visibles, aprovechamiento del espacio horizontal.

Reglas no negociables:

- Todo componente nuevo DEBE probarse en los tres breakpoints antes de considerarse
  terminado.
- Las clases responsive de Tailwind (`sm:`, `md:`, `lg:`, `xl:`) DEBEN usarse para
  adaptar layout, espaciado, tipografía y visibilidad.
- No se DEBEN crear componentes exclusivos para desktop ni versiones separadas por
  dispositivo. El mismo componente DEBE adaptarse via CSS.
- Si un diseño no puede adaptarse razonablemente a un breakpoint, la excepción DEBE
  justificarse y documentarse en el plan de implementación correspondiente.

**Razón**: La tienda será utilizada por clientes desde dispositivos móviles como canal
principal de compra. Un enfoque mobile-first garantiza que la experiencia de compra sea
fluida en cualquier dispositivo, reduce el mantenimiento de variantes por plataforma y
fuerza decisiones de diseño que priorizan lo esencial.

## Technology & Testing Standards

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + Vite 8 (JSX, Tailwind CSS v4) |
| Backend | Node.js + Express 5 (ES Modules, puerto 3000) |
| Database | Supabase PostgreSQL (6 tablas) |
| Storage | Supabase Storage (bucket `productos`) |
| Package manager | npm |

### API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/productos` | GET | Listar (filtros: categoria, marca, destacado, mas_vendido) |
| `/api/productos/:id` | GET | Producto individual |
| `/api/productos` | POST | Crear producto |
| `/api/productos/:id` | PUT | Actualizar producto |
| `/api/productos/:id` | DELETE | Eliminar producto |
| `/api/categorias` | GET | Listar categorías |
| `/api/marcas` | GET | Listar marcas |
| `/api/upload` | POST | Subir imagen (multipart/form-data) |

### Testing

- **Framework**: Vitest con workspaces (frontend + backend en paralelo).
- **Comandos**:
  - `npm test` — modo watch (ambos proyectos).
  - `npm run test:run` — todos los tests una vez (CI).
  - `npm run test:frontend` — solo tests del frontend.
  - `npm run test:backend` — solo tests del backend.
  - `npm run test:coverage` — tests + reporte HTML de cobertura.
- Los tests del frontend usan `@testing-library/react` + `jsdom` + `msw` para mock de API.
- Los tests del backend usan `supertest` para testing HTTP.
- Los tests E2E usan Playwright (`npm run test:e2e`).

### Code Quality

- **ESLint** configurado en raíz (`eslint.config.js`). Ejecutar `npm run lint` antes de commits.
- Nombres de archivo: lowercase para componentes (`nav.jsx`, `card.jsx`).
- Código legible con nombres explícitos. Comentar el "por qué", no el "qué".
- Sin trailing whitespace, sin console.log en producción.

## Governance

Esta constitución es la referencia suprema para decisiones de arquitectura y código en el
proyecto Herramientas-Tandil. Cualquier desviación DEBE justificarse explícitamente en el
plan de implementación (plan.md → Constitution Check).

### Amendment Procedure

1. Proponer el cambio con justificación documentada.
2. Revisar impacto en todos los artefactos (templates, AGENTS.md, README.md, código).
3. Actualizar la constitución, incrementar versión según semver y registrar la fecha de
   modificación.
4. Sincronizar templates y documentación dependiente.
5. La constitución es un documento vivo: se perfecciona con cada iteración del proyecto.

### Versioning Policy

La versión de la constitución sigue Semantic Versioning:

- **MAJOR**: Eliminación o redefinición de principios (cambio incompatible).
- **MINOR**: Nuevo principio, sección o expansión material de guías existentes.
- **PATCH**: Correcciones, mejoras de redacción, ajustes no semánticos.

### Compliance Review

- Todo PR o feature plan DEBE incluir un Constitution Check que verifique el cumplimiento
  de los principios aquí definidos.
- Los planes de implementación (plan.md) incorporan una sección `Constitution Check` como
  gate obligatorio.
- La complejidad que viole algún principio DEBE justificarse en el plan con el motivo y
  por qué la alternativa más simple fue rechazada.

**Version**: 1.1.0 | **Ratified**: 2026-07-26 | **Last Amended**: 2026-07-28
