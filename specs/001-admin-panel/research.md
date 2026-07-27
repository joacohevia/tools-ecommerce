# Research: Administracion desde el Catalogo

**Feature**: `001-admin-panel`
**Date**: 2026-07-26

## Research Questions

### RQ1: Donde poner los 3 botones de admin en /productos

**Decision**: Los botones "Agregar producto", "Agregar categoria", "Agregar marca" se renderizan condicionalmente en `productos.jsx` cuando `perfil.rol === 'admin'`. Se ubican en una barra superior, encima del grid de productos. Cada boton abre su respectivo formulario de `/form/` en modo creacion, renderizado como modal o panel lateral.

**Rationale**: Mantiene todo en una sola pagina. El admin no necesita navegar a otra URL. Los botones estan contextualmente cerca de los productos que gestiona.

**Alternatives considered**:
- Navbar separado para admin: Rechazado — fragmenta la experiencia.
- Dropdown "Administrar": Rechazado — requiere un click extra, menos visible.

### RQ2: Como abrir los formularios — modal vs inline vs panel lateral

**Decision**: Modal (overlay con fondo oscuro) para todos los formularios. Al hacer clic en un boton o en el lapiz de una card, se abre un modal que contiene el form correspondiente. Al guardar o cancelar, el modal se cierra y el catalogo se refresca.

**Rationale**: Modal es el patron mas natural para formularios contextuales. No interrumpe el layout del catalogo subyacente. Los contextos de toast/confirm ya usan este patron.

**Alternatives considered**:
- Inline (reemplazar el grid): Rechazado — el usuario pierde contexto visual del catalogo.
- Panel lateral: Rechazado — ocupa espacio lateral permanente, peor en mobile.

### RQ3: Como manejar creacion vs edicion en los formularios

**Decision**: Cada form recibe una prop opcional (`producto`, `categoria`, `marca`). Si la prop existe → modo edicion (precarga campos, llama a update*). Si no existe → modo creacion (campos vacios, llama a create*). El boton de submit cambia texto ("Guardar" en ambos casos). El modal se cierra y refresca al completar.

**Rationale**: Patron estandar React. Un solo componente por entidad. Sin duplicacion de codigo. Cumple FR-019, FR-020.

### RQ4: Como actualizar el catalogo sin recargar la pagina

**Decision**: Cada operacion CRUD exitosa dispara un re-fetch de `getProductos()` (o la funcion correspondiente) y actualiza el estado local. No se usa `window.location.reload()`. Para eliminaciones, se puede hacer filtrado optimista del array local ademas del re-fetch.

**Rationale**: Cumple SC-003. Sigue el patron existente en el proyecto donde los componentes ya usan `useState` + `useEffect` para datos.

### RQ5: Redireccion de admin al login → /productos

**Decision**: En el handler de login exitoso (dentro de `useAuth` o `login.jsx`), verificar `perfil.rol === 'admin'`. Si es admin, redirigir a `/productos` en vez de `/home`.

**Rationale**: Implementacion minima. Un solo condicional en el flujo de login existente.

### RQ6: Gestion de usuarios — endpoints necesarios

**Decision**: Se necesitan endpoints nuevos en el backend:
- `PUT /api/perfiles/:id` — cambiar rol (body: `{ rol: "admin" | "cliente" }`)
- `DELETE /api/perfiles/:id` — eliminar usuario (con validacion: no auto-eliminarse)
- `GET /api/perfiles` ya existe y sirve para listar

Para la busqueda, se filtra del lado del frontend (ya que la lista de usuarios no es tan grande) o se agrega query param `?q=` al GET existente.

**Rationale**: Extender endpoints existentes en vez de crear nuevas rutas `/api/admin/usuarios`. Mas simple, menos codigo.

### RQ7: Validacion de eliminacion de categoria/marca

**Decision**: Antes del DELETE, consultar si hay productos con esa FK:
```js
const { count } = await supabase.from("productos").select("*", { count: "exact", head: true }).eq("categoria_id", id);
if (count > 0) return res.status(409).json({ error: "..." });
```
Mismo patron para marcas con `marca_id`.

**Rationale**: Simple, eficiente, no requiere triggers ni cambios de esquema. Ya documentado en research.md v1.
