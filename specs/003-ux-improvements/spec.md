# Feature Specification: Mejoras de Experiencia de Usuario

**Feature Branch**: `003-ux-improvements`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Mejorar la experiencia de usuario del e-commerce tanto en Desktop como en Mobile corrigiendo problemas de navegación, responsive, validaciones visuales y pequeñas inconsistencias de la interfaz."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Navegación mejorada y breadcrumb consistente (Priority: P1)

Como cliente que navega el catálogo, quiero que la navegación sea fluida e intuitiva: al hacer clic en cualquier link del sitio la página debe hacer scroll hacia arriba, al cerrar sesión debo volver al inicio, al hacer clic en "Productos" en el nav deben limpiarse los filtros anteriores, y el breadcrumb debe estar presente en todas las páginas para orientarme.

**Why this priority**: Son comportamientos base de navegación que impactan cada interacción del usuario. Sin ellos la experiencia se siente rota o inconsistente.

**Independent Test**: Navegar entre páginas verificando scroll-to-top, logout redirect, breadcrumb y reseteo de filtros.

**Acceptance Scenarios**:

1. **Given** que el usuario está en cualquier página con scroll, **When** hace clic en "Inicio" o cualquier link del nav que redirige a otra página, **Then** la nueva página se muestra desde arriba (scroll en posición 0).
2. **Given** que el usuario tiene sesión iniciada, **When** cierra sesión, **Then** es redirigido a `/home`.
3. **Given** que el usuario aplicó filtros en `/productos`, **When** hace clic en "Productos" en el nav, **Then** la página se recarga sin filtros aplicados.
4. **Given** que el usuario navega a `/contacto`, **When** la página carga, **Then** se muestra un breadcrumb funcional: "Inicio > Contacto".
5. **Given** que el usuario navega a `/producto/:id`, **When** la página carga, **Then** se muestra un breadcrumb funcional: "Inicio > Productos > [Categoría] > [Nombre del producto]".

---

### User Story 2 — Menú hamburguesa mobile (Priority: P1)

Como usuario mobile, quiero un menú hamburguesa ubicado debajo del logo que contenga las mismas opciones que el nav de escritorio, incluyendo categorías desplegables hacia abajo, para poder navegar el sitio completo desde mi teléfono.

**Why this priority**: Sin menú hamburguesa funcional, los usuarios mobile no pueden acceder a todas las secciones del sitio, bloqueando la navegación completa.

**Independent Test**: Abrir el sitio en viewport mobile (< 768px), tocar el ícono hamburguesa y verificar que todas las opciones del nav desktop están presentes y las categorías se despliegan correctamente.

**Acceptance Scenarios**:

1. **Given** que el usuario está en mobile (< 768px), **When** la página carga, **Then** se muestra un ícono de menú hamburguesa debajo del logo, en la parte superior izquierda.
2. **Given** que el usuario toca el ícono hamburguesa, **When** el menú se abre, **Then** muestra las mismas opciones que el nav desktop: Inicio, Categorías (desplegable), Productos, Contacto, y Admin (si corresponde).
3. **Given** que el usuario toca "Categorías" en el menú hamburguesa, **When** se expande, **Then** las subcategorías se despliegan hacia abajo con una animación suave.
4. **Given** que el usuario selecciona una opción del menú, **When** navega a la página, **Then** el menú se cierra automáticamente.
5. **Given** que el usuario está en desktop (≥ 768px), **When** ve el header, **Then** el nav horizontal se muestra normalmente y el ícono hamburguesa no está visible.

---

### User Story 3 — Filtros mobile como panel emergente (Priority: P2)

Como usuario mobile que busca productos, quiero acceder a los filtros desde un botón dedicado que despliegue un panel desde abajo, en lugar de tener los filtros siempre visibles ocupando espacio en pantalla.

**Why this priority**: En mobile el espacio es limitado. Mostrar los filtros siempre visibles compite con la grilla de productos y fuerza scroll innecesario.

**Independent Test**: Abrir `/productos` en viewport mobile (< 768px), verificar que el panel de filtros no se muestra inicialmente, tocar el botón "Filtros", verificar que emerge desde abajo, seleccionar filtros, cerrar con la X y verificar que se aplican.

**Acceptance Scenarios**:

1. **Given** que el usuario está en `/productos` en mobile, **When** la página carga, **Then** el panel de filtrado NO se muestra; en su lugar hay un botón "Filtros" debajo del selector "Ordenar por".
2. **Given** que el usuario toca el botón "Filtros", **When** se abre, **Then** el panel de filtrado emerge desde la parte inferior de la pantalla cubriendo parcialmente la grilla.
3. **Given** que el panel de filtros está abierto, **When** el usuario selecciona marcas, categorías o rangos de precio, **Then** los cambios se reflejan visualmente en el panel.
4. **Given** que el panel de filtros está abierto, **When** el usuario toca la X en la esquina superior izquierda del panel, **Then** el panel se cierra y los filtros seleccionados se aplican a la grilla de productos.
5. **Given** que el usuario está en desktop (≥ 768px), **When** ve `/productos`, **Then** el panel de filtros se muestra como sidebar lateral normalmente (comportamiento actual sin cambios).

---

### User Story 4 — Botones de admin visibles y hover en cards (Priority: P2)

Como administrador quiero ver los botones de Editar y Eliminar claramente en cada card. Como cliente quiero que las cards tengan una animación sutil al pasar el cursor para indicar que son interactivas.

**Why this priority**: Los botones de admin son críticos para la gestión. El hover en cards mejora la percepción de interactividad y profesionalismo del catálogo.

**Independent Test**: Iniciar sesión como admin y verificar botones visibles. Como cliente, pasar el cursor sobre cualquier card y verificar la animación de escala.

**Acceptance Scenarios**:

1. **Given** que un admin está autenticado, **When** navega a `/productos` o `/home`, **Then** cada card muestra los botones de Editar (lápiz) y Eliminar (tacho) visibles en la esquina superior derecha.
2. **Given** que un usuario sin rol admin navega, **When** ve cualquier card, **Then** los botones de Editar y Eliminar no se muestran.
3. **Given** que un admin hace clic en Editar, **When** se ejecuta, **Then** se abre el formulario de edición con los datos cargados.
4. **Given** que un admin hace clic en Eliminar y confirma, **When** se completa, **Then** el producto se elimina del catálogo.
5. **Given** que cualquier usuario pasa el cursor sobre una card, **When** el mouse entra en el área de la card, **Then** la card aplica una animación `transition-transform hover:scale-105` con una transición suave, sin desplazar elementos adyacentes.

---

### User Story 5 — Toggle de visibilidad de contraseña (Priority: P2)

Como usuario que inicia sesión o se registra, quiero poder ver la contraseña que estoy escribiendo mediante un ícono de ojo en el campo de contraseña, para evitar errores de tipeo.

**Why this priority**: Reduce fricción en login/registro y errores de contraseña, que son una causa común de abandono y tickets de soporte.

**Independent Test**: Ir a `/login` o `/registro`, escribir en el campo de contraseña, tocar el ícono de ojo y verificar que el texto se vuelve visible/oculto alternadamente.

**Acceptance Scenarios**:

1. **Given** que el usuario está en `/login` o `/registro`, **When** ve el campo de contraseña, **Then** se muestra un ícono de ojo (tachado/abierto) dentro o al lado del input.
2. **Given** que el usuario escribe su contraseña (texto oculto por defecto), **When** toca el ícono de ojo, **Then** la contraseña se muestra en texto plano y el ícono cambia a "ojo abierto".
3. **Given** que la contraseña está visible, **When** el usuario toca el ícono nuevamente, **Then** la contraseña vuelve a ocultarse y el ícono cambia a "ojo tachado".
4. **Given** que el usuario cambia entre login y registro, **When** llega a la otra página, **Then** el toggle de contraseña funciona de manera idéntica en ambas.

---

### User Story 6 — Animación en botón "Agregar al carrito" (Priority: P3)

Como cliente quiero recibir una confirmación visual al presionar "Agregar al carrito" para tener certeza de que el producto se agregó correctamente.

**Why this priority**: Mejora la percepción de respuesta del sistema. No es bloqueante pero suma calidad percibida.

**Independent Test**: Hacer clic en "Agregar al carrito" y verificar animación de confirmación de ~1 segundo.

**Acceptance Scenarios**:

1. **Given** que el usuario está en cualquier página con cards, **When** hace clic en "Agregar al carrito", **Then** el botón muestra una animación de confirmación visual durante ~1 segundo.
2. **Given** que el usuario hace clic repetidamente, **When** presiona el botón varias veces, **Then** cada clic produce la animación sin estados rotos.
3. **Given** que el usuario está en mobile, **When** toca "Agregar al carrito", **Then** la animación es visible y no afecta el layout de la card.

---

### User Story 7 — Botón flotante de WhatsApp (Priority: P3)

Como cliente quiero un acceso rápido a WhatsApp para hacer consultas sobre productos, visible como un ícono flotante en la esquina inferior izquierda.

**Why this priority**: Facilita el contacto directo con la empresa, canal de ventas complementario. No reemplaza ninguna funcionalidad core.

**Independent Test**: Verificar que el ícono de WhatsApp aparece en `/home` y `/productos`, flotante abajo a la izquierda. Al hacer clic redirige a WhatsApp.

**Acceptance Scenarios**:

1. **Given** que el usuario está en `/home` o `/productos`, **When** la página carga, **Then** se muestra un ícono de WhatsApp flotante en la esquina inferior izquierda, por encima del contenido.
2. **Given** que el usuario hace clic en el ícono, **When** se ejecuta la acción, **Then** se abre WhatsApp Web o la app en el número de teléfono configurado.
3. **Given** que el usuario hace scroll, **When** la página se desplaza, **Then** el ícono permanece fijo en su posición (posición fixed/sticky).
4. **Given** que el usuario está en mobile, **When** ve el ícono, **Then** no interfiere con otros elementos interactivos ni tapa contenido importante.

---

### User Story 8 — Selects responsive y formularios mobile (Priority: P3)

Como usuario mobile quiero que los selectores ("Ordenar por", selects del formulario de producto) sean fáciles de usar en pantalla táctil, con opciones legibles y tamaño adecuado.

**Why this priority**: Afecta la usabilidad de funciones clave (ordenar catálogo, agregar/editar productos). Sin esto la experiencia mobile en formularios es deficiente.

**Independent Test**: Verificar el selector "Ordenar por" en mobile y los selects del formulario "Agregar producto" en mobile. Las opciones deben ser legibles y fáciles de tocar.

**Acceptance Scenarios**:

1. **Given** que el usuario está en `/productos` en mobile, **When** ve el selector "Ordenar por", **Then** el texto y las opciones son completamente visibles sin recortes ni necesidad de zoom.
2. **Given** que un admin está en el formulario "Agregar producto" en mobile, **When** abre un select (categoría, marca), **Then** las opciones se muestran en un formato adecuado para mobile (nativo o personalizado), con texto legible y área táctil suficiente.
3. **Given** que el usuario cambia el tamaño de viewport, **When** pasa de desktop a mobile, **Then** todos los selects se adaptan correctamente sin desbordar sus contenedores.

---

### Edge Cases

- ¿Qué pasa si un admin elimina un producto mientras otro lo está editando? → El sistema muestra un mensaje de error adecuado (producto ya no existe).
- ¿Qué pasa si el breadcrumb de una categoría eliminada se intenta mostrar? → Se omite la categoría o se muestra texto genérico.
- ¿Qué pasa si el menú hamburguesa se abre y el usuario rota el dispositivo? → El menú debe cerrarse o adaptarse al nuevo viewport.
- ¿Qué pasa si se hace clic en "Agregar al carrito" sin conexión? → El botón mantiene su comportamiento; el error de red lo maneja el flujo existente del carrito.
- ¿Qué pasa si el número de WhatsApp no está configurado aún? → El botón no debe mostrarse hasta que se configure el número.
- ¿Qué pasa si el panel de filtros se abre y el usuario cambia a desktop (≥ 768px)? → El panel debe comportarse como sidebar lateral, no como bottom sheet.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE hacer scroll hacia arriba (posición 0) al navegar a cualquier página mediante links del nav, breadcrumb o footer.
- **FR-002**: El sistema DEBE redirigir al usuario a `/home` al cerrar sesión.
- **FR-003**: El sistema DEBE limpiar todos los filtros aplicados y recargar la página al hacer clic en "Productos" en la barra de navegación.
- **FR-004**: El sistema DEBE mostrar un breadcrumb funcional en `/contacto` ("Inicio > Contacto").
- **FR-005**: El sistema DEBE mostrar un breadcrumb funcional en `/producto/:id` ("Inicio > Productos > [Categoría] > [Producto]").
- **FR-006**: El sistema DEBE mostrar un menú hamburguesa funcional en viewports < 768px, ubicado debajo del logo, con las mismas opciones que el nav desktop.
- **FR-007**: El menú hamburguesa DEBE incluir un desplegable de categorías que se expanda/colapse hacia abajo.
- **FR-008**: En mobile (< 768px), el panel de filtrado en `/productos` DEBE reemplazarse por un botón "Filtros" debajo del selector "Ordenar por" que abra un panel emergente desde la parte inferior.
- **FR-009**: El panel de filtros mobile DEBE cerrarse y aplicar los filtros seleccionados al tocar una X en la esquina superior izquierda.
- **FR-010**: En desktop (≥ 768px), el panel de filtrado DEBE mostrarse como sidebar lateral (comportamiento actual sin cambios).
- **FR-011**: Los botones de Editar y Eliminar DEBEN ser visibles para usuarios con rol "admin" en todas las cards de producto, sin solaparse con otros elementos.
- **FR-012**: Las cards de producto DEBEN aplicar una animación CSS `transition-transform hover:scale-105` al pasar el cursor, sin desplazar elementos adyacentes.
- **FR-013**: Los campos de contraseña en `/login` y `/registro` DEBEN incluir un ícono de ojo que alterne la visibilidad del texto entre oculto y visible.
- **FR-014**: El botón "Agregar al carrito" DEBE mostrar una animación de confirmación visual de ~1 segundo al ser presionado, sin afectar el layout de la card.
- **FR-015**: El sistema DEBE mostrar un ícono flotante de WhatsApp en la esquina inferior izquierda en las páginas `/home` y `/productos`, que redirija a un número de teléfono configurable.
- **FR-016**: El ícono de WhatsApp NO DEBE mostrarse si el número de teléfono no está configurado.
- **FR-017**: Los selectores "Ordenar por" y los selects del formulario "Agregar producto" DEBEN ser responsive, con opciones legibles y usables en mobile.
- **FR-018**: El sistema DEBE mantener toda la funcionalidad existente (carrito, login, registro, admin CRUD, filtros, búsqueda) sin alteraciones ni regresiones.

### Key Entities

- **Header de Navegación**: Barra superior del sitio con logo, búsqueda, carrito, menú usuario y nav. En mobile incluye menú hamburguesa debajo del logo.
- **Menú Hamburguesa**: Panel desplegable mobile con las mismas opciones que el nav desktop: Inicio, Categorías (con sub-desplegable), Productos, Contacto, Admin (condicional).
- **Breadcrumb**: Navegación jerárquica indicando la ubicación actual del usuario con enlaces a niveles superiores.
- **Panel de Filtros Mobile**: Bottom sheet que reemplaza al sidebar de filtros en mobile, accionado por botón "Filtros" y cerrado con X.
- **Botón WhatsApp**: Elemento flotante fijo en esquina inferior izquierda, visible solo si el número está configurado.
- **Toggle de Contraseña**: Ícono ojo dentro del input de contraseña que alterna visibilidad del texto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100% de las navegaciones entre páginas del sitio posicionan el scroll en la parte superior (scrollY = 0) al cargar.
- **SC-002**: El breadcrumb es visible y funcional en el 100% de las páginas: Home, Productos, Contacto, Detalle de Producto.
- **SC-003**: El menú hamburguesa contiene el 100% de las opciones del nav desktop y las categorías se despliegan correctamente en mobile.
- **SC-004**: Los administradores identifican y usan los botones de Editar y Eliminar en menos de 3 segundos en cada card.
- **SC-005**: El 100% de los clics en "Agregar al carrito" producen una animación visible sin errores de layout.
- **SC-006**: El toggle de contraseña funciona correctamente en login y registro, alternando visibilidad en cada clic.
- **SC-007**: El panel de filtros mobile se abre y cierra en menos de 300ms con animación fluida.
- **SC-008**: Ninguna funcionalidad existente (navegación, filtros, búsqueda, carrito, login, admin CRUD) se rompe con estos cambios.

## Assumptions

- Todos los cambios se aplican sobre el tema claro Material-3 (spec 002-ui-modernization).
- El número de WhatsApp será configurable (hardcodeado en una variable o constante, sin backend).
- Los breadcrumbs de Contacto y Detalle de Producto no existen actualmente y deben crearse.
- El menú hamburguesa es nuevo; no existe implementación previa en mobile.
- La animación de "Agregar al carrito" y el hover de cards son puramente CSS, sin librerías externas.
- El toggle de contraseña usa un input tipo password/text nativo de HTML.
- El botón de WhatsApp usa el protocolo `https://wa.me/` para la redirección.
- Los breakpoints responsive usan los valores por defecto de Tailwind CSS (sm: 640px, md: 768px, lg: 1024px).
