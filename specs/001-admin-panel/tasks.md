# Tasks: Administracion desde el Catalogo

**Input**: Design documents from `specs/001-admin-panel/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md

**Tests**: No test tasks included. Tests can be added later via a separate task phase if needed.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)

## Path Conventions

- **Backend**: `backend/server.js` (monolith)
- **Frontend forms**: `src/components/form/`
- **Frontend pages**: `src/components/pages/`
- **Frontend components**: `src/components/`

---

## Phase 1: Setup

**Purpose**: Verificar que el proyecto base compila y los tests existentes pasan.

- [x] T001 Verificar que `npm run build` compila sin errores
- [x] T002 Verificar que `npm test -- --run` pasa los tests existentes

**Checkpoint**: Proyecto base funcional

---

## Phase 2: Foundational — Backend + Infraestructura compartida

**Purpose**: Validaciones de backend, endpoints de usuarios, y funciones http.js necesarias para todas las historias.

**⚠️ CRITICAL**: Sin esta fase, ninguna historia de usuario puede completarse.

### Backend — Validaciones y Endpoints de Usuarios

- [x] T003 Agregar validacion en DELETE /api/categorias/:id en backend/server.js: antes del delete, consultar si hay productos con `categoria_id = :id`; si count > 0 → 409 Conflict con mensaje descriptivo
- [x] T004 Agregar validacion en DELETE /api/marcas/:id en backend/server.js: antes del delete, consultar si hay productos con `marca_id = :id`; si count > 0 → 409 Conflict con mensaje descriptivo
- [x] T005 Agregar PUT /api/perfiles/:id en backend/server.js: auth + adminOnly, body `{ rol }`, validar que rol sea "admin" o "cliente", impedir cambiar el propio rol (403)
- [x] T006 Agregar DELETE /api/perfiles/:id en backend/server.js: auth + adminOnly, impedir eliminar la propia cuenta (403: "No puedes eliminar tu propia cuenta")

### Frontend — http.js

- [x] T007 [P] Agregar `updatePerfilRol(id, rol)` en src/http.js — PUT /api/perfiles/:id con auth headers, parsea body de error
- [x] T008 [P] Agregar `deletePerfil(id)` en src/http.js — DELETE /api/perfiles/:id con auth headers, parsea body de error

### Frontend — Redireccion de Admin al Login

- [x] T009 Modificar redireccion post-login en src/components/pages/login.jsx: si `perfil.rol === 'admin'`, redirigir a `/productos` en vez de `/home`

**Checkpoint**: Backend listo, http.js con funciones de usuarios, admin redirigido a /productos

---

## Phase 3: User Story 1 — Gestion de Productos desde el Catalogo (Priority: P1)

**Goal**: Admin puede crear, editar y eliminar productos desde `/productos`. Las cards muestran iconos de admin. Formulario reutilizable.

**Independent Test**: Login admin → /productos → cards con iconos → crear producto → editar desde card → eliminar desde card. Cliente no ve nada.

### Formulario de Producto (Reutilizable)

- [x] T010 [US1] Implementar src/components/form/productForm.jsx: campos nombre, slug, descripcion, precio, precio_oferta, stock, selects categoria/marca (carga via getCategorias/getMarcas), checkboxes destacado/mas_vendido, upload imagen con canvas + uploadImagen(), validacion frontend, boton deshabilitado durante submit, estados loading/error/submitting
- [x] T011 [US1] Agregar soporte de edicion en productForm.jsx: prop opcional `producto` → precarga campos → llama updateProducto; sin prop → llama createProducto. Props: `producto?`, `onSaved?`, `onCancel?`

### Integracion en /productos

- [x] T012 [US1] Agregar boton "Agregar producto" en src/components/pages/productos.jsx visible solo si `perfil.rol === 'admin'`. Al hacer clic, abre productForm.jsx en modo creacion dentro de un modal (overlay + panel centrado). Al guardar o cancelar, cierra modal y refresca lista de productos.
- [x] T013 [US1] Conectar icono de lapiz en src/components/card.jsx con productForm en modo edicion: al hacer clic abre el mismo modal de productForm precargado con los datos del producto, refresca catalogo al guardar
- [x] T014 [US1] Verificar icono de basurero en card.jsx: confirm dialog → deleteProducto() → toast → refrescar catalogo (funcionalidad ya existente, solo verificar que sigue funcionando)

**Checkpoint**: Admin crea/edita/elimina productos desde /productos, forms reutilizables, cliente no ve nada

---

## Phase 4: User Story 2 — Gestion de Categorias (Priority: P1)

**Goal**: Admin puede crear, editar y eliminar categorias desde botones en `/productos`.

**Independent Test**: Clic en "Agregar categoria" → crear → editar (abrir de nuevo) → eliminar sin productos (OK) → intentar eliminar con productos (409).

### Formulario de Categoria (Reutilizable)

- [x] T015 [P] [US2] Implementar src/components/form/categForm.jsx: campos nombre y slug, validacion frontend, boton deshabilitado durante submit, prop opcional `categoria` para modo edicion, props `categoria?`, `onSaved?`, `onCancel?`
- [x] T016 [US2] Agregar boton "Agregar categoria" en productos.jsx visible solo para admin. Al hacer clic, abre modal con categForm en modo creacion. Al guardar/cerrar, cierra modal y refresca
- [x] T017 [US2] Agregar capacidad de editar/eliminar categorias desde una tabla/listado accesible en el mismo modal o en una vista complementaria. Eliminar usa confirm dialog y muestra toast con error 409 si tiene productos

**Checkpoint**: Admin gestiona categorias desde /productos, validacion 409

---

## Phase 5: User Story 3 — Gestion de Marcas (Priority: P1)

**Goal**: Admin puede crear, editar y eliminar marcas desde botones en `/productos`.

**Independent Test**: Clic en "Agregar marca" → crear → editar → eliminar sin productos → intentar eliminar con productos (409).

### Formulario de Marca (Reutilizable)

- [x] T018 [P] [US3] Implementar src/components/form/marcaForm.jsx: campo nombre, validacion frontend, boton deshabilitado durante submit, prop opcional `marca` para modo edicion, props `marca?`, `onSaved?`, `onCancel?`
- [x] T019 [US3] Agregar boton "Agregar marca" en productos.jsx visible solo para admin. Al hacer clic, abre modal con marcaForm en modo creacion
- [x] T020 [US3] Agregar capacidad de editar/eliminar marcas desde tabla/listado en modal complementario. Eliminar usa confirm dialog y muestra toast con error 409 si tiene productos

**Checkpoint**: Admin gestiona marcas desde /productos, validacion 409

---

## Phase 6: User Story 4 — Administracion de Usuarios (Priority: P2)

**Goal**: Admin ve lista de usuarios, busca, cambia roles, y elimina (excepto su propia cuenta). Esto reside en admin.jsx o vista separada.

**Independent Test**: Admin ve usuarios → busca por nombre → cambia rol → intenta eliminarse a si mismo (falla) → elimina otro (OK).

### Vista de Usuarios

- [x] T021 [US4] Crear/actualizar src/components/pages/admin.jsx como vista exclusiva de usuarios: fetch lista via getPerfiles(), tabla con columnas nombre, apellido, DNI, rol, fecha, estados loading/error/data/empty
- [x] T022 [US4] Agregar campo de busqueda en admin.jsx: input de texto que filtra la lista de perfiles por nombre o apellido (filtrado client-side)
- [x] T023 [US4] Agregar cambio de rol en admin.jsx: dropdown o boton toggle por usuario que llama a updatePerfilRol(id, nuevoRol) con confirm dialog, toast exito/error. No permitir cambiar el propio rol
- [x] T024 [US4] Agregar eliminacion de usuario en admin.jsx: boton eliminar por fila con confirm dialog → deletePerfil(id) → toast → refrescar lista. Si es la propia cuenta, mostrar error y no eliminar
- [x] T025 [US4] Agregar Route /admin en src/App.jsx con proteccion: solo accesible si `perfil.rol === 'admin'`, si no redirige a /home
- [x] T026 [US4] Agregar enlace "Admin" en src/components/nav.jsx visible solo si `perfil.rol === 'admin'`, navegando a `/admin`

**Checkpoint**: Vista de usuarios funcional con busqueda, cambio de rol, eliminacion

---

## Phase 7: User Story 5 — Proteccion y Autorizacion (Priority: P1)

**Goal**: Verificar que todos los endpoints administrativos usan `auth` + `adminOnly`. Validar que usuarios sin permisos reciben 401/403.

**Independent Test**: Cliente llama POST /api/productos manualmente → 403. Visitante sin sesion → 401.

### Verificacion y Refuerzo

- [x] T027 [US5] Auditar backend/server.js: verificar que POST/PUT/DELETE /api/productos, POST/PUT/DELETE /api/categorias, POST/PUT/DELETE /api/marcas, POST /api/upload, PUT/DELETE /api/perfiles/:id usan `auth` + `adminOnly`. Agregar los middlewares si faltan en alguno
- [x] T028 [US5] Verificar que el componente Admin (si se usa en App.jsx) redirige a /home si `perfil.rol !== 'admin'` o si no hay sesion

**Checkpoint**: Todos los endpoints protegidos, UI con guard de ruta

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan multiples historias, correcciones, verificacion final.

- [x] T029 [P] Mejorar manejo de errores en src/http.js: deleteCategoria y deleteMarca parsean body de error para mensaje descriptivo (especialmente 409)
- [x] T030 [P] Agregar JSDoc a las funciones nuevas en src/http.js (updatePerfilRol, deletePerfil) y a productForm.jsx, categForm.jsx, marcaForm.jsx, admin.jsx
- [x] T031 Verificar que los botones de admin en productos.jsx y los iconos en card.jsx no se renderizan para usuarios con rol cliente o sin sesion
- [x] T032 Ejecutar `npm run lint` y corregir errores
- [x] T033 Ejecutar `npm run build` y verificar compilacion sin errores
- [x] T034 Ejecutar `npm test -- --run` y verificar que los tests existentes pasan
- [x] T035 Validacion manual: seguir quickstart.md y confirmar todos los escenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias
- **Foundational (Phase 2)**: Depende de Setup — **BLOQUEA todas las historias**
- **US1 Productos (Phase 3)**: Depende de Foundational
- **US2 Categorias (Phase 4)**: Depende de Foundational — paralelo con US1, US3
- **US3 Marcas (Phase 5)**: Depende de Foundational — paralelo con US1, US2
- **US4 Usuarios (Phase 6)**: Depende de Foundational — paralelo con US1-US3
- **US5 Autorizacion (Phase 7)**: Depende de todas las fases anteriores
- **Polish (Phase 8)**: Depende de US1-US5 completas

### User Story Dependencies

- **US1, US2, US3, US4**: Independientes entre si una vez completa Phase 2
- **US5**: Depende de que los endpoints esten implementados en fases anteriores

### Parallel Opportunities

- T003, T004: validaciones backend (mismo archivo pero diferentes endpoints, secuencial OK)
- T005, T006: endpoints perfiles (mismo archivo, secuencial OK)
- T007, T008: funciones http.js (paralelo)
- T010, T015, T018: forms (paralelo — archivos distintos)
- T012, T016, T019: botones en productos.jsx (mismo archivo, secuencial)
- Phase 3, 4, 5, 6: pueden correr en paralelo una vez completada Phase 2

---

## Parallel Example: Forms

```bash
# Los 3 forms pueden implementarse en paralelo:
Task: "Implementar productForm.jsx en src/components/form/productForm.jsx"
Task: "Implementar categForm.jsx en src/components/form/categForm.jsx"
Task: "Implementar marcaForm.jsx en src/components/form/marcaForm.jsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Phase 1: Setup
2. Phase 2: Foundational (back + http.js + redirect)
3. Phase 3: US1 (productForm + boton + card icons)
4. **STOP**: Admin puede gestionar productos desde /productos — **MVP!**

### Incremental Delivery

1. Setup + Foundational → base
2. + US1 → productos CRUD desde catalogo → **MVP**
3. + US2 → categorias → demo
4. + US3 → marcas → demo
5. + US4 → vista usuarios → demo
6. + US5 → verificacion seguridad → release

---

## Notes

- `card.jsx` ya tiene iconos de admin (lapiz/basurero) — T013 y T014 verifican/completan funcionalidad existente
- `productForm.jsx`, `categForm.jsx`, `marcaForm.jsx` en `src/components/form/` son placeholder vacios — se implementan desde cero
- Cada form recibe prop opcional de entidad: sin prop = creacion, con prop = edicion
- Modal usa patron simple: div overlay con position fixed + panel centrado, controlado por estado local en productos.jsx
- Usar `useToast()` para notificaciones, `useConfirm()` para dialogos de confirmacion, `useAuth()` para datos de usuario
- Estados obligatorios en todos los componentes: loading, error, data, empty
- `admin.jsx` NO contiene logica de CRUD de productos/categorias/marcas
