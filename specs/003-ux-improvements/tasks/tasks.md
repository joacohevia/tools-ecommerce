# Tareas: Mejoras de Experiencia de Usuario

**Input**: Documentos de diseño desde `specs/003-ux-improvements/`

**Prerrequisitos**: plan.md (requerido), spec.md (requerido para historias de usuario)

**Pruebas**: Los tests son requeridos — la spec pide verificaciones funcionales y el usuario solicitó tests en `tests/frontend/`.

**Organización**: Las tareas están agrupadas por historia de usuario para permitir implementación y prueba independiente de cada historia.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos diferentes, sin dependencias)
- **[Story]**: A qué historia de usuario pertenece esta tarea (US1, US2, ..., US8)
- Incluya rutas de archivo exactas en las descripciones

## Convenciones de ruta

- **Frontend**: `src/` para componentes, `tests/frontend/` para tests
- **Sin cambios en backend** — esta feature es 100% frontend

---

## Fase 1: Configuración (Infraestructura Compartida)

**Propósito**: Inicialización de proyecto y estructura básica

- [x] T001 Leer plan de implementación en `specs/003-ux-improvements/plan/plan.md` y spec en `specs/003-ux-improvements/spec.md` para entender el alcance completo
- [x] T002 [P] Verificar que `npm run dev` y `npm run build` funcionan sin errores en el estado actual
- [x] T003 [P] Verificar que `npm run lint` y `npm run test:run` pasan en el estado actual (baseline)

---

## Fase 2: Fundamentos (Prerrequisitos Bloqueantes)

**Propósito**: Clases CSS compartidas y hook de scroll-to-top que todas las historias necesitan

**⚠️ CRÍTICO**: Ningún trabajo de historia de usuario puede comenzar hasta que se complete esta fase

- [x] T004 [P] Agregar clase `.card-hover` en `src/index.css` (`transition-transform duration-200 hover:scale-105`)
- [x] T005 [P] Reutilizar/agregar animación slide-up en `src/index.css` (ya existía `.animate-slide-in`; agregado `.animate-slide-left` para menú mobile)
- [x] T006 [P] Agregar clase `.whatsapp-float` en `src/index.css` (botón flotante WhatsApp)
- [x] T007 Verificar `ScrollToTop` en `src/App.jsx` (ya existía `src/components/ui/scrollToTop.jsx` integrado)

**Checkpoint**: Fundamentos listos — puede comenzar la implementación de historias de usuario en paralelo

---

## Fase 3: Historia de Usuario 1 — Navegación mejorada y breadcrumb (Prioridad: P1) 🎯 MVP

**Objetivo**: Scroll-to-top al navegar, logout redirige a /home, nav "Productos" limpia filtros, breadcrumb en Contacto y Detalle de Producto

**Prueba independiente**: Navegar entre páginas verificando que el scroll se posiciona arriba. Cerrar sesión y verificar redirect a /home. Clickear "Productos" y verificar recarga sin filtros. Ver breadcrumb en /contacto y /producto/:id.

### Tests para Historia de Usuario 1

- [x] T008 [P] [US1] Crear `tests/frontend/components/nav.test.jsx` y `tests/frontend/components/cardDetail.test.jsx` — Tests: links correctos, click en Productos dispara recarga, logout redirige a /home, breadcrumb funcional en Detalle

### Implementación para Historia de Usuario 1

- [x] T009 [US1] Verificar scroll-to-top: `ScrollToTop` ya estaba integrado en `src/App.jsx`
- [x] T010 [US1] Implementar logout redirect: en `src/components/nav.jsx`, en el handler de logout después de `signOut()`, se ejecuta `navigate('/home')`
- [x] T011 [US1] Implementar reseteo de filtros en nav: en `src/components/nav.jsx`, el botón de "Productos" usa `window.location.href = '/productos'` para recarga completa
- [x] T012 [US1] Breadcrumb en `src/components/pages/contacto.jsx` ya existía y se mantiene funcional
- [x] T013 [US1] Corregir breadcrumb en `src/components/pages/cardDetail.jsx`: links a `/productos` y `/productos?categoria=<slug>` con datos reales del producto

**Checkpoint**: US1 completamente funcional y testeable de forma independiente

---

## Fase 4: Historia de Usuario 2 — Menú hamburguesa mobile (Prioridad: P1)

**Objetivo**: Menú hamburguesa debajo del logo en mobile (< 768px) con todas las opciones del nav desktop y categorías desplegables

**Prueba independiente**: Abrir sitio en viewport mobile (< 768px), verificar que aparece ícono hamburguesa, tocar y verificar links y categorías desplegables.

### Tests para Historia de Usuario 2

- [x] T014 [P] [US2] Agregar tests de menú hamburguesa en `tests/frontend/components/nav.test.jsx` — Tests: hamburguesa presente, contiene todos los links del nav desktop, categorías expandibles, navegación cierra el panel

### Implementación para Historia de Usuario 2

- [x] T015 [US2] Agregar ícono hamburguesa SVG en `src/components/nav.jsx`: visible en mobile (`md:hidden`), en la segunda fila del header
- [x] T016 [US2] Ocultar nav horizontal en mobile: en `src/components/nav.jsx`, `hidden md:flex` en la barra de links de navegación
- [x] T017 [US2] Implementar panel del menú hamburguesa en `src/components/nav.jsx`: overlay + panel lateral deslizable con `.animate-slide-left`
- [x] T018 [US2] Agregar links al menú: Inicio, Productos, Contacto, Admin (condicional)
- [x] T019 [US2] Implementar categorías desplegables en el menú: botón "Categorías" con estado `mobileCatsOpen`, sub-lista con transición `max-height`
- [x] T020 [US2] Cerrar menú al navegar: cada Link/button del menú cierra el panel; botón X en esquina superior derecha

**Checkpoint**: US2 completamente funcional y testeable de forma independiente. US1 + US2 = navegación completa.

---

## Fase 5: Historia de Usuario 3 — Filtros mobile como panel emergente (Prioridad: P2)

**Objetivo**: En mobile, reemplazar sidebar de filtros por botón "Filtros" que abre bottom sheet. En desktop, sidebar lateral sin cambios.

**Prueba independiente**: Ir a `/productos` en mobile, verificar que no hay sidebar, tocar "Filtros", verificar que emerge desde abajo, seleccionar filtros, cerrar con X, verificar que se aplican.

### Tests para Historia de Usuario 3

- [x] T021 [P] [US3] Crear `tests/frontend/components/filtrado.test.jsx` — Tests: renderiza marcas, categorías, precios; checkboxes funcionan; colapsar/expandir secciones

### Implementación para Historia de Usuario 3

- [x] T022 [US3] En `src/components/pages/productos.jsx`, agregar estado `showFilters` (boolean, default false)
- [x] T023 [US3] Condicionar renderizado del sidebar: en mobile (`<md`), ocultar `<Filtrado />` del layout y mostrar botón "Filtros" con clase `btn-secondary text-sm` debajo del selector "Ordenar por"
- [x] T024 [US3] Implementar bottom sheet: cuando `showFilters` es true, renderizar overlay `fixed inset-0 z-40 bg-black/50` + panel `fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest rounded-t-xl max-h-[80vh] overflow-y-auto p-5 animate-slide-up`
- [x] T025 [US3] Agregar botón X en esquina superior izquierda del panel (`absolute top-3 left-3`) que setea `showFilters(false)` y aplica los filtros
- [x] T026 [US3] Verificar que en desktop (≥ 768px) el sidebar de filtros se muestra normalmente (`md:flex` o similar) y el botón "Filtros" NO se muestra

**Checkpoint**: US3 completamente funcional y testeable de forma independiente

---

## Fase 6: Historia de Usuario 4 — Admin buttons visibles + hover en cards (Prioridad: P2)

**Objetivo**: Botones Editar/Eliminar visibles para admin en todas las cards. Hover con `scale-105` en todas las cards para todos los usuarios.

**Prueba independiente**: Loguearse como admin y verificar botones en cada card. Pasar cursor sobre cualquier card y verificar animación hover.

### Tests para Historia de Usuario 4

- [x] T027 [P] [US4] Actualizar `tests/frontend/components/card.test.jsx` — Tests: botones admin visibles con mock admin, no visibles sin admin, card tiene clase `.card-hover`

### Implementación para Historia de Usuario 4

- [x] T028 [US4] En `src/components/card.jsx`, revisar z-index y fondo de botones admin (`z-20`, `bg-surface-container-lowest/90`) para garantizar visibilidad sobre la imagen en mobile (cards de 155px)
- [x] T029 [US4] En `src/components/card.jsx`, agregar clase `.card-hover` al `<Link>` raíz. Verificar que `overflow-hidden` está presente para que el scale no desborde bordes

**Checkpoint**: US4 completamente funcional y testeable de forma independiente

---

## Fase 7: Historia de Usuario 5 — Toggle visibilidad de contraseña (Prioridad: P2)

**Objetivo**: Ícono de ojo en campos de contraseña de login y registro que alterna visibilidad del texto.

**Prueba independiente**: Ir a `/login` y `/registro`, escribir contraseña, tocar ícono ojo, verificar que el texto se muestra/oculta y el ícono cambia.

### Tests para Historia de Usuario 5

- [x] T030 [P] [US5] Crear `tests/frontend/components/login.test.jsx` — Tests: input tipo password por defecto, toggle cambia a tipo text, ícono ojo cambia al alternar
- [x] T031 [P] [US5] Crear `tests/frontend/components/registro.test.jsx` — Tests: mismo comportamiento de toggle que login

### Implementación para Historia de Usuario 5

- [x] T032 [P] [US5] Agregar toggle de contraseña en `src/components/pages/login.jsx`: estado `showPassword`, input alterna `type={showPassword ? 'text' : 'password'}`, ícono SVG ojo dentro del input (posicionado `absolute right-3`), wrapper `relative` en el contenedor del input
- [x] T033 [P] [US5] Agregar toggle de contraseña en `src/components/pages/registro.jsx`: misma implementación que login (reutilizar patrón, no duplicar lógica; considerar extraer a componente `PasswordInput` si es viable)

**Checkpoint**: US5 completamente funcional y testeable de forma independiente

---

## Fase 8: Historia de Usuario 6 — Animación "Agregar al carrito" (Prioridad: P3)

**Objetivo**: Animación de confirmación (~1s) al clickear "Agregar al carrito" en cualquier card.

**Prueba independiente**: Clickear "Agregar al carrito" en cualquier card, verificar cambio de texto a "Agregado ✓" y color por ~1s, luego revierte.

### Tests para Historia de Usuario 6

- [ ] T034 [P] [US6] Agregar tests de animación en `tests/frontend/components/card.test.jsx` — Tests: botón cambia texto a "Agregado ✓" al clickear, color cambia, revierte después de timeout

### Implementación para Historia de Usuario 6

- [ ] T035 [US6] En `src/components/card.jsx`, agregar estado local `added` (boolean, false). Al clickear: `setAdded(true)` → `agregarAlCarrito(...)` → `setTimeout(() => setAdded(false), 1000)`
- [ ] T036 [US6] Aplicar clases condicionales al botón: cuando `added`, aplicar `bg-primary-container text-on-primary-container` y texto "Agregado ✓"; cuando no, comportamiento normal. Transición `transition-all duration-300` para suavizar el cambio de color

**Checkpoint**: US6 completamente funcional y testeable de forma independiente

---

## Fase 9: Historia de Usuario 7 — Botón flotante WhatsApp (Prioridad: P3)

**Objetivo**: Ícono flotante de WhatsApp en esquina inferior derecha en Home, Contacto y Productos, redirigiendo a número configurable.

**Prueba independiente**: Verificar que aparece en `/home`, `/contacto` y `/productos`. Si número vacío, no aparece. Si configurado, link a `wa.me/<numero>`.

### Tests para Historia de Usuario 7

- [ ] T037 [P] [US7] Crear `tests/frontend/components/whatsappButton.test.jsx` — Tests: no renderiza si número vacío, renderiza link `wa.me/` con número configurado, tiene clases de posición fixed

### Implementación para Historia de Usuario 7

- [ ] T038 [US7] Crear `src/components/whatsappButton.jsx`: constante `WHATSAPP_NUMBER` (vacía por defecto, configurable). Si número vacío → `return null`. Renderiza `<a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" rel="noopener noreferrer">` con `.whatsapp-float` + SVG de WhatsApp verde
- [ ] T039 [US7] Integrar `<WhatsAppButton />` en `src/components/pages/home.jsx` y `src/components/pages/productos.jsx`

**Checkpoint**: US7 completamente funcional y testeable de forma independiente

---

## Fase 10: Historia de Usuario 8 — Selects responsive y formularios mobile (Prioridad: P3)

**Objetivo**: "Ordenar por", opciones del menu hamburguesa para mobile y selects de "Agregar producto" adaptados para mobile con opciones legibles y touch-friendly.

**Prueba independiente**: Verificar selector "Ordenar por" en mobile y selects del formulario "Agregar producto" en mobile. Sin recortes ni necesidad de zoom.

### Tests para Historia de Usuario 8

- [ ] T040 [P] [US8] Agregar tests de selects responsive en `tests/frontend/components/productos.test.jsx` si no existe, o en tests existentes — verificar que el select "Ordenar por" no desborda en viewport mobile

### Implementación para Historia de Usuario 8

- [ ] T041 [US8] En `src/components/pages/productos.jsx`, verificar selector "Ordenar por": agregar `w-full sm:w-auto` y `text-base` en mobile para evitar zoom de iOS
- [ ] T042 [US8] En `src/components/form/productForm.jsx`, verificar selects de categoría y marca: `w-full`, `text-base` (16px) en mobile, `py-2` para touch target ≥ 44px
- [ ] T043 [US8] En `src/components/nav.jsx`, el submenú expandible de "Categorías" del menú hamburguesa mobile (líneas 373-391) debe tener el mismo tratamiento visual que los dropdowns desktop: fondo `bg-surface-container-lowest`, borde completo `border border-outline-variant`, `rounded-md`, y `shadow-lg`.

**Checkpoint**: US8 completamente funcional y testeable de forma independiente

---

## Fase 11: Ajustes Finales y Verificación

**Propósito**: Mejoras que afectan múltiples historias y verificación global

- [ ] T043 [P] Ejecutar `npm run lint` y corregir todos los errores introducidos
- [ ] T044 [P] Ejecutar `npm run build` y verificar build sin errores
- [ ] T045 Ejecutar `npm run test:run` y verificar que todos los tests pasan (existentes + nuevos)
- [ ] T046 [P] Verificar SC-001: navegar entre todas las páginas → scrollY = 0 en cada carga
- [ ] T047 [P] Verificar SC-002: breadcrumb visible en Home, Productos, Contacto, Detalle de Producto
- [ ] T048 [P] Verificar SC-003: menú hamburguesa contiene 100% de opciones del nav desktop en mobile
- [ ] T049 [P] Verificar SC-004: admin buttons visibles en cada card con sesión admin
- [ ] T050 [P] Verificar SC-005: 100% de clics en "Agregar al carrito" producen animación
- [ ] T051 [P] Verificar SC-006: toggle contraseña alterna visibilidad en login y registro
- [ ] T052 [P] Verificar SC-007: bottom sheet de filtros abre/cierra en < 300ms con animación fluida
- [ ] T053 [P] Verificar SC-008: funcionalidad existente sin regresiones (carrito, búsqueda, admin CRUD, filtros, login, registro)
- [ ] T054 [P] Ejecutar verificación con skill `webapp-testing` (Playwright) para capturas de pantalla en los 3 breakpoints (desktop, tablet, mobile)

---

## Dependencias y Orden de Ejecución

### Dependencias de Fase

- **Configuración (Fase 1)**: Sin dependencias — puede comenzar inmediatamente
- **Fundamentos (Fase 2)**: Depende de Fase 1 — BLOQUEA todas las historias de usuario
- **Historias de Usuario (Fase 3+)**: Todas dependen de Fase 2
  - US1 (P1) y US2 (P1): pueden ejecutarse en paralelo
  - US3, US4, US5 (P2): pueden ejecutarse en paralelo entre sí y con P1
  - US6, US7, US8 (P3): pueden ejecutarse en paralelo entre sí y con cualquier otra
- **Ajustes Finales (Fase 11)**: Depende de que todas las historias estén completas

### Dependencias de Historia de Usuario

- **US1 (P1)**: Solo Fase 2 — Independiente de otras historias
- **US2 (P1)**: Solo Fase 2 — Independiente. Toca `nav.jsx`, coordinar con US1 que también toca `nav.jsx`
- **US3 (P2)**: Solo Fase 2 — Independiente
- **US4 (P2)**: Solo Fase 2 — Independiente
- **US5 (P2)**: Solo Fase 2 — Independiente
- **US6 (P3)**: Solo Fase 2 — Independiente
- **US7 (P3)**: Solo Fase 2 — Independiente
- **US8 (P3)**: Solo Fase 2 — Independiente

### Dentro de Cada Historia de Usuario

- Tests primero (TDD) → Implementación
- Historia completa antes de pasar a la siguiente prioridad

### Oportunidades de Paralelismo

- T004, T005, T006, T007: CSS compartido + ScrollToTop (Fase 2)
- T008, T014, T021, T027, T030, T031, T034, T037, T040: Todos los tests (diferentes archivos)
- T032, T033: Login y Registro (misma lógica, archivos diferentes)
- US1-US8: Todas las historias pueden trabajarse en paralelo por diferentes desarrolladores

---

## Ejemplo de Paralelismo: Fase 2 (Fundamentos)

```bash
# Lanzar todas las tareas de Fundamentos juntas:
Task: "Agregar .card-hover en src/index.css"
Task: "Agregar .animate-slide-up en src/index.css"
Task: "Agregar .whatsapp-float en src/index.css"
Task: "Crear ScrollToTop en src/App.jsx"
```

---

## Estrategia de Implementación

### MVP Primero (Solo US1 + US2 — Prioridad P1)

1. Completar Fase 1: Configuración
2. Completar Fase 2: Fundamentos (CRÍTICO — bloquea todas las historias)
3. Completar Fase 3: US1 — Navegación mejorada
4. Completar Fase 4: US2 — Menú hamburguesa
5. **DETENERSE y VALIDAR**: Probar US1 y US2 de forma independiente
6. Desplegar/demostrar si está listo

### Entrega Incremental

1. Fundamentos → Base lista
2. US1 + US2 → Navegación completa (¡MVP!)
3. US3 + US4 + US5 → Filtros mobile + cards + contraseña
4. US6 + US7 + US8 → Animaciones + WhatsApp + selects
5. Fase 11 → Verificación global

### Estrategia de Equipo Paralelo

Con múltiples desarrolladores:

1. Equipo completa Fase 1 + Fase 2 juntos
2. Una vez completados los Fundamentos:
   - Dev A: US1 + US2 (mismo archivo `nav.jsx`)
   - Dev B: US3 + US4 (filtros + cards)
   - Dev C: US5 (login/registro)
   - Dev D: US6 + US7 + US8 (animaciones + WhatsApp + selects)
3. Cada dev escribe tests antes de implementar
4. Historias se integran de forma independiente

---

## Notas

- Las tareas marcadas con [P] = archivos diferentes, sin dependencias
- La etiqueta [Story] mapea la tarea a una historia de usuario específica para trazabilidad
- Cada historia de usuario debe ser completada y testeada de forma independiente
- US1 y US2 comparten `nav.jsx` — coordinar cambios o ejecutar secuencialmente
- Tests se escriben primero (TDD) dentro de cada fase de historia
- Los tests usan `renderWithProviders` de `tests/helpers.jsx` y siguen el patrón de `tests/frontend/components/card.test.jsx`
- `whatsappButton.jsx` es el único componente nuevo; todo lo demás modifica componentes existentes
- Sin nuevas dependencias npm
- Sin cambios en backend
- Verificar con `npm run lint`, `npm run build`, `npm run test:run` después de cada fase
