# Feature Specification: Administracion desde el Catalogo

**Feature Branch**: `001-admin-panel`

**Created**: 2026-07-26

**Status**: Draft

**Input**: User description: "Centralizar todas las tareas de administracion (productos, categorias y marcas) directamente desde la pagina /productos, evitando depender de una pantalla administrativa separada para esas operaciones."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestion de Productos desde el Catalogo (Priority: P1)

Un administrador autenticado puede crear, editar y eliminar productos directamente desde la pagina `/productos`, sin necesidad de una pantalla administrativa separada. Las cards de producto muestran controles de edicion y eliminacion exclusivamente para el admin.

**Why this priority**: Los productos son el contenido principal de la tienda. Sin capacidad de gestionarlos el negocio no puede operar. Centralizar la administracion en `/productos` simplifica el flujo de trabajo del admin.

**Independent Test**: Login como admin → redirigido a `/productos` → las cards muestran iconos de editar/eliminar → crear producto con boton "Agregar producto" → editarlo desde la card → eliminarlo desde la card → un cliente normal no ve ningun control.

**Acceptance Scenarios**:

1. **Given** un admin autenticado, **When** inicia sesion, **Then** el sistema lo redirige automaticamente a `/productos`.

2. **Given** un admin en `/productos`, **When** observa las cards de productos, **Then** cada card muestra un icono de lapiz (editar) y un icono de basurero (eliminar). Los usuarios con rol cliente no deben ver estos iconos.

3. **Given** un admin en `/productos`, **When** hace clic en el icono de lapiz de una card, **Then** se abre el formulario `productForm.jsx` precargado con los datos del producto. Al guardar, la card se actualiza sin recargar la pagina y se muestra un toast de exito o error.

4. **Given** un admin en `/productos`, **When** hace clic en el icono de basurero de una card y confirma en el dialogo, **Then** el producto se elimina, la card desaparece del catalogo y se muestra un toast. Si cancela, no ocurre nada.

5. **Given** un admin en `/productos`, **When** hace clic en "Agregar producto", **Then** se abre `productForm.jsx` en modo creacion. Al guardar, el nuevo producto aparece en el catalogo sin recargar.

6. **Given** un admin con el formulario de producto abierto, **When** deja campos obligatorios vacios y presiona guardar, **Then** el sistema muestra un mensaje de error descriptivo y no guarda.

7. **Given** un admin que intenta editar un producto que fue eliminado por otro admin mientras tenia el formulario abierto, **When** guarda, **Then** recibe un mensaje de error indicando que el producto ya no existe.

---

### User Story 2 - Gestion de Categorias desde el Catalogo (Priority: P1)

Un administrador puede crear, editar y eliminar categorias directamente desde la pagina `/productos` usando el formulario reutilizable `categForm.jsx`.

**Why this priority**: Las categorias son esenciales para organizar productos. Sin capacidad de gestionarlas no se pueden clasificar nuevos productos.

**Independent Test**: Admin en `/productos` → clic en "Agregar categoria" → crear categoria → editarla → intentar eliminar una con productos (debe fallar con 409) → eliminar una sin productos (debe funcionar).

**Acceptance Scenarios**:

1. **Given** un admin en `/productos`, **When** hace clic en "Agregar categoria", **Then** se abre `categForm.jsx` en modo creacion. Al guardar, se muestra toast de exito.

2. **Given** un admin en `/productos` con `categForm.jsx` abierto en modo edicion de una categoria existente, **When** modifica el nombre y guarda, **Then** la categoria se actualiza y se muestra toast.

3. **Given** un admin, **When** intenta eliminar una categoria que tiene productos asociados, **Then** el backend retorna 409 y el sistema muestra un mensaje de error explicativo. La edicion de categorias con productos SI esta permitida.

4. **Given** un admin, **When** elimina una categoria sin productos, **Then** la operacion se completa exitosamente con confirmacion y toast.

---

### User Story 3 - Gestion de Marcas desde el Catalogo (Priority: P1)

Un administrador puede crear, editar y eliminar marcas directamente desde `/productos` usando `marcaForm.jsx`.

**Why this priority**: Mismo nivel de criticidad que categorias — son datos de referencia para productos.

**Independent Test**: Admin en `/productos` → clic en "Agregar marca" → crear marca → editar nombre → eliminar sin productos (OK) → intentar eliminar con productos (409).

**Acceptance Scenarios**:

1. **Given** un admin en `/productos`, **When** hace clic en "Agregar marca", **Then** se abre `marcaForm.jsx` en modo creacion.

2. **Given** un admin en `/productos`, **When** edita una marca existente desde `marcaForm.jsx`, **Then** se actualiza correctamente.

3. **Given** un admin, **When** intenta eliminar una marca con productos asociados, **Then** el backend retorna 409 y se muestra toast de error.

4. **Given** un admin, **When** elimina una marca sin productos, **Then** se elimina con confirmacion y toast.

---

### User Story 4 - Administracion de Usuarios (Priority: P2)

Un administrador puede ver, buscar, modificar roles y eliminar usuarios desde una vista administrativa. La vista de usuarios es la unica responsabilidad de `admin.jsx`.

**Why this priority**: La gestion de usuarios es importante pero no bloquea la operacion basica de productos, categorias y marcas.

**Independent Test**: Admin navega a vista de usuarios → ve lista → busca por nombre → cambia rol de un usuario → intenta eliminar su propia cuenta (debe fallar) → elimina otro usuario (con confirmacion).

**Acceptance Scenarios**:

1. **Given** un admin en la vista de usuarios, **When** carga la pagina, **Then** ve una lista de todos los perfiles con nombre, apellido, email, DNI, rol y fecha.

2. **Given** la lista de usuarios, **When** el admin escribe en un campo de busqueda, **Then** la lista se filtra por nombre o apellido.

3. **Given** un usuario en la lista, **When** el admin cambia su rol (ej. de cliente a admin), **Then** el cambio se persiste y se muestra toast de exito.

4. **Given** un admin, **When** intenta eliminar su propia cuenta, **Then** el sistema rechaza la operacion con un mensaje de error claro.

5. **Given** un admin, **When** elimina la cuenta de otro usuario, **Then** requiere confirmacion via dialogo y al confirmar se elimina con toast.

6. **Given** un usuario con rol admin, **When** se le quitan los privilegios, **Then** pasa a rol "cliente" y ya no puede acceder a funciones administrativas.

---

### User Story 5 - Proteccion y Autorizacion (Priority: P1)

Todas las operaciones administrativas (CRUD de productos, categorias, marcas, usuarios) validan en el backend que el usuario tenga rol "admin". No es suficiente ocultar botones en la interfaz.

**Why this priority**: La seguridad es critica. Sin validacion del lado del servidor cualquier usuario podria manipular datos.

**Independent Test**: Un cliente autenticado intenta llamar a `POST /api/productos` manualmente (sin boton visible) → recibe 403. Un admin realiza las mismas operaciones → 200/201.

**Acceptance Scenarios**:

1. **Given** un usuario con rol cliente, **When** intenta ejecutar cualquier operacion CRUD de admin via API, **Then** el backend retorna 403.

2. **Given** un visitante sin sesion, **When** intenta acceder a endpoints administrativos, **Then** recibe 401.

3. **Given** un admin, **When** cierra sesion, **Then** es redirigido a `/home` y ya no puede realizar operaciones administrativas.

---

### Edge Cases

- Producto eliminado por otro admin mientras el formulario de edicion esta abierto → error al guardar.
- Doble clic en "Guardar" → boton deshabilitado durante el submit evita envios duplicados.
- Doble eliminacion → confirm dialog previene; si el producto ya fue eliminado, el segundo intento retorna 404 manejado con toast.
- Cancelacion del formulario → no se modifica ningun dato.
- Cancelacion del dialogo de confirmacion → no se ejecuta la eliminacion.
- Errores de red durante guardado → toast de error, el formulario permanece abierto con los datos.
- Slug duplicado al crear/editar → error descriptivo del backend mostrado via toast.
- Admin intenta eliminar su propia cuenta → rechazado con mensaje claro.

## Requirements *(mandatory)*

### Functional Requirements

**Productos:**
- **FR-001**: Al iniciar sesion con rol admin, el sistema DEBE redirigir automaticamente a `/productos`.
- **FR-002**: Las cards de producto en `/productos` DEBEN mostrar iconos de editar y eliminar solo para usuarios con `perfil.rol === 'admin'`.
- **FR-003**: Al hacer clic en editar, el sistema DEBE abrir `src/components/form/productForm.jsx` precargado con los datos del producto.
- **FR-004**: Al hacer clic en eliminar, el sistema DEBE mostrar el dialogo de confirmacion existente y ejecutar `deleteProducto()` si se confirma.
- **FR-005**: El boton "Agregar producto" DEBE estar visible solo para admin en `/productos` y abrir `productForm.jsx` en modo creacion.

**Categorias y Marcas:**
- **FR-006**: Los botones "Agregar categoria" y "Agregar marca" DEBEN estar visibles solo para admin en `/productos`.
- **FR-007**: "Agregar categoria" DEBE abrir `categForm.jsx` en modo creacion.
- **FR-008**: "Agregar marca" DEBE abrir `marcaForm.jsx` en modo creacion.
- **FR-009**: `categForm.jsx` DEBE ser reutilizable para creacion y edicion mediante props.
- **FR-010**: `marcaForm.jsx` DEBE ser reutilizable para creacion y edicion mediante props.
- **FR-011**: `productForm.jsx` DEBE ser reutilizable para creacion y edicion mediante props.
- **FR-012**: El backend DEBE rechazar eliminacion de categoria con productos asociados (409).
- **FR-013**: El backend DEBE rechazar eliminacion de marca con productos asociados (409).

**Usuarios:**
- **FR-014**: Debe existir una vista de administracion de usuarios (en `admin.jsx` o similar) con listado, busqueda, cambio de rol y eliminacion.
- **FR-015**: El admin DEBE poder buscar usuarios por nombre o apellido.
- **FR-016**: El admin DEBE poder cambiar el rol de cualquier usuario (admin ↔ cliente).
- **FR-017**: El admin NO DEBE poder eliminar su propia cuenta.
- **FR-018**: La eliminacion de usuarios DEBE requerir confirmacion via dialogo.

**Formularios:**
- **FR-019**: Todos los formularios (productForm, categForm, marcaForm) DEBEN manejar modo creacion y modo edicion mediante props.
- **FR-020**: No DEBEN existir formularios duplicados para crear y editar una misma entidad.
- **FR-021**: Los formularios DEBEN validar campos obligatorios en frontend y backend.
- **FR-022**: El boton de guardar DEBE deshabilitarse durante el submit para evitar doble envio.
- **FR-023**: Al cancelar un formulario, NO se debe modificar ningun dato.

**Autorizacion:**
- **FR-024**: Todo endpoint CRUD administrativo DEBE usar los middlewares `auth` y `adminOnly`.
- **FR-025**: No es suficiente ocultar botones en la UI; el backend DEBE rechazar peticiones no autorizadas con 401/403.

**Notificaciones:**
- **FR-026**: Toda operacion de creacion, edicion o eliminacion DEBE mostrar toast de exito o error.
- **FR-027**: Las eliminaciones DEBEN requerir confirmacion via `useConfirm()`.
- **FR-028**: La vista de usuarios y el catalogo DEBEN actualizarse sin recargar la pagina tras cada operacion.

### Key Entities

- **Producto**: id, nombre, slug, descripcion, precio, precio_oferta, stock, categoria_id, marca_id, destacado, mas_vendido, imagenes. Gestionado con productForm.jsx.
- **Categoria**: id, nombre, slug. Restriccion: no se elimina si tiene productos asociados. Gestionado con categForm.jsx.
- **Marca**: id, nombre. Restriccion: no se elimina si tiene productos asociados. Gestionado con marcaForm.jsx.
- **Perfil**: id, user_id, nombre, apellido, dni, rol. Gestionado desde la vista de usuarios.
- **Pedido**: id, perfil_id, estado, total, nota, created_at. Visualizacion en vista de usuarios (opcional).
- **PedidoItem**: pedido_id, producto_id, cantidad, precio_unitario, subtotal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un administrador puede crear un producto completo (con imagen) en menos de 2 minutos.
- **SC-002**: El 100% de las eliminaciones de categorias o marcas con productos asociados son rechazadas con mensaje claro.
- **SC-003**: El catalogo de productos se actualiza sin recarga de pagina tras cualquier operacion CRUD.
- **SC-004**: Usuarios sin rol admin no pueden ejecutar operaciones administrativas bajo ninguna circunstancia (0% de accesos no autorizados).
- **SC-005**: El doble clic en Guardar no genera productos duplicados ni errores (submit deshabilitado).
- **SC-006**: Un admin puede buscar y modificar el rol de un usuario en menos de 15 segundos.

## Assumptions

- El sistema de autenticacion (`useAuth`, login/logout) y el contexto de usuario ya estan implementados con distincion de rol admin/cliente.
- Los endpoints REST CRUD para productos, categorias y marcas ya existen y estan protegidos con `auth` + `adminOnly`.
- Los middlewares `auth` y `adminOnly` en `backend/server.js` ya estan operativos.
- Los contextos `ToastContext` (useToast) y `ConfirmContext` (useConfirm) ya estan implementados y disponibles globalmente.
- Los archivos `productForm.jsx`, `categForm.jsx` y `marcaForm.jsx` en `src/components/form/` seran implementados como componentes reutilizables con props para modo creacion/edicion.
- `admin.jsx` NO contendra logica CRUD de productos/categorias/marcas — solo vistas administrativas como usuarios y pedidos.
- Las imagenes de productos se procesan mediante el flujo existente (canvas + multer + sharp + Supabase Storage).
- El catalogo comparte el layout general (nav + contenido) con el resto de la tienda.
