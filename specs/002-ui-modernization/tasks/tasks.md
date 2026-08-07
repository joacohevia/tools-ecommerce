# Tareas: Modernización de la Interfaz

**Input**: Documentos de diseño desde `specs/002-ui-modernization/`

**Prerrequisitos**: plan.md (requerido), spec.md (requerido para historias de usuario), research.md, data-model.md, contracts/

**Pruebas**: Las tareas de ejemplo incluyen pruebas. Las pruebas son OPCIONALES — inclúyalas solo si se solicitan explícitamente en la especificación del feature.

**Organización**: Las tareas están agrupadas por historia de usuario para permitir implementación y prueba independiente de cada historia.

## Formato: `[ID] [P?] [Story] Descripción`

- **[P]**: Puede ejecutarse en paralelo (archivos diferentes, sin dependencias)
- **[Story]**: A qué historia de usuario pertenece esta tarea (por ejemplo, US1, US2, US3)
- Incluya rutas de archivo exactas en las descripciones

## Convenciones de ruta

- **Proyecto único**: `src/`, `tests/` en la raíz del repositorio
- **Aplicación web**: `backend/src/`, `frontend/src/`
- **Móvil**: `api/src/`, `ios/src/` o `android/src/`
- Las rutas mostradas a continuación asumen un proyecto único — ajuste según la estructura de plan.md

---

## Fase 1: Configuración (Infraestructura Compartida)

**Propósito**: Inicialización del proyecto y estructura básica

- [x] T001 Crear estructura de proyecto según plan de implementación
- [x] T002 [P] Configurar herramientas de linting y formateo (ESLint, Prettier)

---

## Fase 2: Fundamentos (Prerrequisitos Bloqueantes)

**Propósito**: Infraestructura central que DEBE completarse antes de que cualquier historia de usuario pueda implementarse

**⚠️ CRÍTICO**: Ningún trabajo de historia de usuario puede comenzar hasta que se complete esta fase

- [x] T003 [P] Reescribir `src/index.css` con tokens de diseño del tema claro Material-3 (paleta, espaciado, tipografía, estilos base, utilitarios)
- [x] T004 [P] Actualizar `tailwind.config.js` con mapeo de tokens a clases Tailwind
- [x] T005 [P] Definir clases compartidas en `@layer components` en `src/index.css` (.btn-primary, .btn-secondary, .input, .select, .badge, .card-shell, .modal-overlay, .modal-panel, .table-admin)
- [x] T006 Eliminar variables CSS oscuras y directivas de fuente actuales de `src/index.css`
- [x] T007 Eliminar import de `App.css` si queda vacío

**Checkpoint**: Fundamentos listos — puede comenzar la implementación de historias de usuario en paralelo

---

## Fase 3: Historia de Usuario 1 — Refresco visual de la grilla de productos (Prioridad: P1) 🎯 MVP

**Objetivo**: Modernizar la apariencia de las cards de producto manteniendo dimensiones fijas y comportamiento consistente

**Prueba independiente**: Verificar que todas las cards en `/home` y `/productos` tengan ancho, alto, padding, escalado de imagen e interacción hover idénticos en todos los dispositivos

### Implementación para Historia de Usuario 1

- [x] T008 [P] [US1] Actualizar `src/components/card.jsx` con `.card-shell`, imagen con `aspect-square object-contain`, título con `line-clamp-2`, precio con formato oferta/regular, badges con clases compartidas, botón `.btn-primary` full-width, y hover con sombra sutil
- [x] T009 [P] [US1] Actualizar `src/components/carrouseles/carrouselOfertas.jsx` y `src/components/carrouseles/carrouselVendidos.jsx` con scroll-snap (`overflow-x-auto gap-gutter hide-scrollbar snap-x snap-mandatory`), cards con `snap-start flex-shrink-0 w-[280px]`, y botones chevron `.btn-secondary` circulares
- [x] T010 [US1] Actualizar `src/components/secciones/seccionNov.jsx` con fondo `herramientas-fondo-2.jpg` con overlay `bg-black/70`, texto `headline-lg text-white text-center`, y grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter`
- [x] T011 [US1] Actualizar `src/components/secciones/seccionHerramientas.jsx` con diseño CTA central (`relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg group`), fondo `herramientas-fondo.jpg` con overlay `bg-black/50`, texto `headline-xl text-on-primary text-center`, y botones de categorías `.btn-primary` linkeando a `/productos?categoria=slug`
- [x] T012 [US1] Actualizar `src/components/secciones/seccionDescripcion.jsx` con estilos mínimos o eliminar del home si no tiene contenido

**Checkpoint**: En este punto, la Historia de Usuario 1 debe estar completamente funcional y testeable de forma independiente

---

## Fase 4: Historia de Usuario 2 — Consistencia del layout responsive (Prioridad: P2)

**Objetivo**: Asegurar que la interfaz se adapte correctamente a pantallas móviles y tabletas sin scroll horizontal ni layout shifts

**Prueba independiente**: Redimensionar la ventana del navegador o usar emulación de dispositivos para verificar que el layout se adapta correctamente en breakpoints de tablet y mobile sin romper la alineación de componentes ni la funcionalidad

### Implementación para Historia de Usuario 2

- [x] T013 [P] [US2] Actualizar `src/App.jsx` con layout `flex flex-col min-h-screen bg-surface` y mover `Footer` al layout global
- [x] T014 [P] [US2] Actualizar `src/components/nav.jsx` con header `fixed top-0 z-50 h-[72px] bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shadow-sm`, padding `px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto`, logo con `font-headline text-headline-md`, links de navegación con estilos claros, menú hamburguesa para <768px, y dropdown de carrito reestilizado
- [x] T015 [US2] Actualizar `src/components/footer.jsx` con 4 columnas (`md:grid-cols-4`), fondo oscuro `bg-[#1b1b1c]`, contenido con tokens claros, y conservar datos reales (contacto, horarios, medios de pago)
- [x] T016 [US2] Actualizar `src/components/busq.jsx` con `.input` en `max-w-xs` y mantener lógica de dropdown
- [x] T017 [US2] Actualizar `src/components/pages/productos.jsx` con breadcrumb, top bar, y grilla `grid-cols-2 sm:grid-cols-2 lg:grid-cols-3` con `justify-items-center`
- [x] T018 [US2] Actualizar `src/components/filtrado.jsx` con sidebar `bg-surface-container`, bordes `border-outline-variant`, checkboxes con `accent-primary`, y inputs de precio con `.input`
- [x] T019 [US2] Actualizar `src/components/pages/cardDetail.jsx` con layout `flex flex-col md:flex-row gap-6`, thumbnails en fila horizontal en mobile, imagen principal `bg-surface-container-low rounded-xl`, info con estilos claros, y CTAs `.btn-primary`

**Checkpoint**: En este punto, las Historias de Usuario 1 y 2 deben funcionar de forma independiente

---

## Fase 5: Historia de Usuario 3 — Consistencia del header y la navegación (Prioridad: P3)

**Objetivo**: Asegurar que el header y la navegación mantengan estilo, espaciado y estados interactivos consistentes en todas las páginas

**Prueba independiente**: Navegar entre home, productos, contacto y detalle de producto y verificar que el estilo del header, el espaciado y los elementos interactivos se mantengan visualmente consistentes

### Implementación para Historia de Usuario 3

- [x] T020 [P] [US3] Actualizar `src/components/pages/home.jsx` para componer Portada → Más Vendidos → Categorías → Novedades → Ofertas, usando los componentes actualizados
- [x] T021 [P] [US3] Crear `src/components/pages/portada.jsx` con sección `relative h-[500px] md:h-[600px] bg-surface-container-low overflow-hidden`, fondo `src/assets/hero.png` con `object-cover opacity-60 mix-blend-multiply grayscale`, overlay gradiente, contenido centrado con eybrow, título, descripción y CTAs `.btn-primary`/`.btn-secondary`
- [x] T022 [US3] Actualizar `src/components/pages/login.jsx` y `src/components/pages/registro.jsx` con contenedor `min-h-screen flex items-center justify-center bg-surface`, card `max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-xl`, inputs con `.input`, y botón `.btn-primary`
- [x] T023 [US3] Actualizar `src/components/pages/admin.jsx` con contenedor `min-h-screen bg-surface py-8 px-4`, título `headline-lg text-on-surface`, input de búsqueda con `.input`, tabla `.table-admin`, y acciones edit/delete con estilos claros
- [x] T024 [US3] Actualizar `src/components/pages/contacto.jsx` con formulario y datos de la empresa usando tokens claros
- [x] T025 [US3] Reestilizar `src/components/alert/toast.jsx`, `src/components/alert/confirmDialog.jsx`, y `src/components/alert/alert.jsx` con tokens claros y colores semánticos

**Checkpoint**: Todas las historias de usuario deben ser funcionalmente independientes

---

## Fase 6: Ajustes Finales y Verificación

**Propósito**: Mejoras que afectan múltiples historias de usuario

- [x] T026 [P] Limpiar clases remanentes en todo `src/`: `dark-*`, `bg-dark-blue`, `text-dark-text`, `text-dark-muted`, `border-white/10`, `border-white/20`, `bg-white/5`, `bg-white/10`, `bg-black`, `text-blue-400`, `bg-blue-600`, `hover:bg-blue-500`, `bg-red-600`, `bg-green-600`, `bg-purple-600`
- [x] T027 [P] Recorrer botones, inputs, selects, cards, badges, tablas y modales verificando que usen las clases compartidas (`@layer components`)
- [x] T028 [P] Verificar acceptance scenarios contra la spec: cards con dimensiones idénticas, sin scroll horizontal en mobile, header idéntico en todas las páginas, títulos truncados, imágenes escaladas
- [x] T029 [P] Ejecutar `npm run lint` sin errores
- [x] T030 [P] Ejecutar `npm run build` sin errores
- [ ] T031 [P] Ejecutar verificación con skill `webapp-testing` (Playwright) para capturas de pantalla y verificación funcional en los 3 breakpoints

---

## Dependencias y Orden de Ejecución

### Dependencias de Fase

- **Configuración (Fase 1)**: Sin dependencias — puede comenzar inmediatamente
- **Fundamentos (Fase 2)**: Depende de la finalización de Configuración — BLOQUEA todas las historias de usuario
- **Historias de Usuario (Fase 3+)**: Todas dependen de la finalización de la Fase 2
  - Las historias de usuario pueden proceder en paralelo (si hay capacidad de equipo)
  - O secuencialmente en orden de prioridad (P1 → P2 → P3)
- **Ajustes Finales (Fase 6)**: Depende de que todas las historias de usuario deseadas estén completas

### Dependencias de Historia de Usuario

- **Historia de Usuario 1 (P1)**: Puede comenzar después de la Fase 2 — Sin dependencias en otras historias
- **Historia de Usuario 2 (P2)**: Puede comenzar después de la Fase 2 — Puede integrarse con US1 pero debe ser testeable de forma independiente
- **Historia de Usuario 3 (P3)**: Puede comenzar después de la Fase 2 — Puede integrarse con US1/US2 pero debe ser testeable de forma independiente

### Dentro de Cada Historia de Usuario

- Implementación antes de integración
- Historia completa antes de pasar a la siguiente prioridad

### Oportunidades de Paralelismo

- Todas las tareas de Configuración marcadas con [P] pueden ejecutarse en paralelo
- Todas las tareas de Fundamentos marcadas con [P] pueden ejecutarse en paralelo (dentro de la Fase 2)
- Una vez completada la Fase 2, todas las historias de usuario pueden comenzar en paralelo (si permite la capacidad del equipo)
- Todas las pruebas para una historia de usuario marcadas con [P] pueden ejecutarse en paralelo
- Diferentes historias de usuario pueden trabajarse en paralelo por diferentes miembros del equipo

---

## Ejemplo de Paralelismo: Historia de Usuario 1

```bash
# Lanzar todas las tareas de implementación para Historia de Usuario 1 juntas:
Task: "Actualizar src/components/card.jsx con .card-shell, imagen, título, precio, badges, botón, hover"
Task: "Actualizar src/components/carrouseles/carrouselOfertas.jsx y carrouselVendidos.jsx con scroll-snap, cards, botones chevron"
Task: "Actualizar src/components/secciones/seccionNov.jsx con fondo, texto, grid"
Task: "Actualizar src/components/secciones/seccionHerramientas.jsx con diseño CTA central, fondo, texto, botones"
Task: "Actualizar src/components/secciones/seccionDescripcion.jsx con estilos mínimos o eliminar"
```

---

## Estrategia de Implementación

### MVP Primero (Solo Historia de Usuario 1)

1. Completar Fase 1: Configuración
2. Completar Fase 2: Fundamentos (CRÍTICO — bloquea todas las historias)
3. Completar Fase 3: Historia de Usuario 1
4. **DETENERSE y VALIDAR**: Probar Historia de Usuario 1 de forma independiente
5. Desplegar/demostrar si está listo

### Entrega Incremental

1. Completar Configuración + Fundamentos → Fundamentos listos
2. Agregar Historia de Usuario 1 → Probar de forma independiente → Desplegar/Demostrar (¡MVP!)
3. Agregar Historia de Usuario 2 → Probar de forma independiente → Desplegar/Demostrar
4. Agregar Historia de Usuario 3 → Probar de forma independiente → Desplegar/Demostrar
5. Cada historia agrega valor sin romper historias anteriores

### Estrategia de Equipo Paralelo

Con múltiples desarrolladores:

1. El equipo completa Configuración + Fundamentos juntos
2. Una vez completados los Fundamentos:
   - Desarrollador A: Historia de Usuario 1
   - Desarrollador B: Historia de Usuario 2
   - Desarrollador C: Historia de Usuario 3
3. Las historias se completan e integran de forma independiente

---

## Notas

- Las tareas marcadas con [P] = archivos diferentes, sin dependencias
- La etiqueta [Story] mapea la tarea a una historia de usuario específica para trazabilidad
- Cada historia de usuario debe ser completada e testeada de forma independiente
- Verificar que las pruebas fallen antes de implementar
- Confirmar después de cada tarea o grupo lógico
- Detenerse en cualquier checkpoint para validar la historia de forma independiente
- Evitar: tareas vagas, conflictos en el mismo archivo, dependencias cruzadas que rompan la independencia