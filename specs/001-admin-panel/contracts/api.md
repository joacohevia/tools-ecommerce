# API Contracts: Administracion desde el Catalogo

**Feature**: `001-admin-panel`
**Date**: 2026-07-26

## Endpoints Modificados

### DELETE /api/categorias/:id
Agregar validacion antes del delete.

**Response 409** (NUEVO):
```json
{ "error": "No se puede eliminar la categoria porque tiene productos asociados" }
```

### DELETE /api/marcas/:id
Idem categoria.

**Response 409** (NUEVO):
```json
{ "error": "No se puede eliminar la marca porque tiene productos asociados" }
```

## Endpoints Nuevos

### PUT /api/perfiles/:id

**Auth**: `auth` + `adminOnly`
**Body**: `{ "rol": "admin" | "cliente" }`

**Response 200**:
```json
{ "id": 1, "rol": "admin", "nombre": "...", "apellido": "..." }
```

**Response 400**: `{ "error": "Rol invalido. Permitidos: admin, cliente" }`  
**Response 403**: No se puede cambiar el propio rol  
**Response 404**: `{ "error": "Perfil no encontrado" }`

### DELETE /api/perfiles/:id

**Auth**: `auth` + `adminOnly`

**Response 200**: `{ "message": "Perfil eliminado" }`  
**Response 403**: `{ "error": "No puedes eliminar tu propia cuenta" }`  
**Response 404**: `{ "error": "Perfil no encontrado" }`

## Funciones http.js

### Nuevas

```js
export async function updatePerfilRol(id, rol)    // PUT /api/perfiles/:id
export async function deletePerfil(id)              // DELETE /api/perfiles/:id
export async function getPerfiles(filtro)           // GET /api/perfiles (ya existe, se usa para listar)
```

## Contratos de Componentes (Props)

### productForm.jsx
```js
// Props
producto?: object   // Si existe → modo edicion; si no → modo creacion
onSaved?: () => void // Callback tras guardado exitoso
onCancel?: () => void // Callback al cancelar
```

### categForm.jsx
```js
categoria?: object  // Si existe → edicion; si no → creacion
onSaved?: () => void
onCancel?: () => void
```

### marcaForm.jsx
```js
marca?: object      // Si existe → edicion; si no → creacion
onSaved?: () => void
onCancel?: () => void
```
