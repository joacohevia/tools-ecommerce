# Data Model: Administracion desde el Catalogo

**Feature**: `001-admin-panel`
**Date**: 2026-07-26

## Overview

Sin cambios de esquema. Se documentan las reglas de negocio nuevas y los endpoints administrativos necesarios.

## Entities & Business Rules

### Producto
Gestionado desde `productForm.jsx` (reutilizable creacion + edicion).

| Campo | Tipo | Reglas |
|-------|------|--------|
| id | bigint PK | — |
| nombre | text NOT NULL | Obligatorio |
| slug | text UNIQUE NOT NULL | Obligatorio, duplicado → error backend |
| precio | numeric NOT NULL | Obligatorio, > 0 |
| categoria_id | bigint FK NOT NULL | Obligatorio |
| marca_id | bigint FK NOT NULL | Obligatorio |
| imagenes | text[] | Procesadas via canvas → upload → sharp → Storage |

**Reglas de negocio**: Sin restricciones de eliminacion. Se puede borrar aunque este en pedidos.

### Categoria
Gestionado desde `categForm.jsx`.

| Campo | Tipo | Reglas |
|-------|------|--------|
| id | bigint PK | — |
| nombre | text UNIQUE NOT NULL | Obligatorio |
| slug | text UNIQUE NOT NULL | Obligatorio |

**Regla nueva**: DELETE solo si no tiene productos (`COUNT(*) FROM productos WHERE categoria_id = :id = 0`). Si count > 0 → 409 Conflict. Editar siempre permitido.

### Marca
Gestionado desde `marcaForm.jsx`.

| Campo | Tipo | Reglas |
|-------|------|--------|
| id | bigint PK | — |
| nombre | text UNIQUE NOT NULL | Obligatorio |

**Regla nueva**: DELETE solo si no tiene productos (`COUNT(*) FROM productos WHERE marca_id = :id = 0`). Si count > 0 → 409 Conflict. Editar siempre permitido.

### Perfil
Gestionado desde vista de usuarios (admin.jsx).

| Campo | Tipo | Reglas |
|-------|------|--------|
| id | bigint PK | — |
| user_id | uuid FK NOT NULL | Referencia a auth.users |
| nombre | text NOT NULL | — |
| apellido | text NOT NULL | — |
| rol | text NOT NULL DEFAULT 'cliente' | CHECK (admin \| cliente). Admin puede cambiar rol de otros. |

**Reglas nuevas**:
- PUT /api/perfiles/:id — cambiar rol (req.body: `{ rol }`). Solo admin. No se puede cambiar el rol del propio perfil (proteccion contra lockout).
- DELETE /api/perfiles/:id — eliminar perfil. Solo admin. No se puede eliminar el propio perfil.

## API Endpoints Summary

### Existentes (sin cambios)
Todos los endpoints CRUD de productos, categorias (GET/POST/PUT), marcas (GET/POST/PUT), upload, auth, pedidos.

### Modificados
| Endpoint | Cambio |
|----------|--------|
| DELETE /api/categorias/:id | Validacion previa: productos asociados → 409 |
| DELETE /api/marcas/:id | Validacion previa: productos asociados → 409 |

### Nuevos
| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| /api/perfiles/:id | PUT | Cambiar rol (body: `{ rol }`) |
| /api/perfiles/:id | DELETE | Eliminar perfil (no auto-eliminacion) |
