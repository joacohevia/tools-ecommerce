# Quickstart: Administracion desde el Catalogo

**Feature**: `001-admin-panel`
**Date**: 2026-07-26

## Prerequisites
- `npm install` (raiz + backend)
- Supabase con esquema `baseHerramientas.sql`
- Al menos un perfil con rol `admin`

## Setup
```bash
cd backend && npm run dev   # puerto 3000
npm run dev                 # puerto 5173 (otra terminal)
```

## Verification

### 1. Login como admin → redirect a /productos
1. Iniciar sesion con credenciales admin en `/login`
2. Debe redirigir automaticamente a `/productos`
3. Las cards deben mostrar iconos de lapiz y basurero

### 2. Editar y eliminar desde cards
1. Clic en lapiz de una card → modal con productForm precargado
2. Modificar precio → guardar → toast exito → card actualizada
3. Clic en basurero → confirm dialog → confirmar → card desaparece
4. Cancelar confirm dialog → no pasa nada

### 3. Agregar producto/categoria/marca
1. Como admin, deben verse 3 botones: "Agregar producto", "Agregar categoria", "Agregar marca"
2. Clic en "Agregar producto" → modal con form vacio
3. Llenar campos obligatorios → guardar → toast → producto aparece en catalogo
4. Repetir con categoria y marca

### 4. Validacion de eliminacion con productos
1. Intentar eliminar categoria que tenga productos → toast error 409
2. Crear categoria sin productos → eliminar → OK

### 5. Vista de usuarios (admin.jsx)
1. Navegar a vista de usuarios
2. Ver lista con nombre, apellido, rol
3. Buscar por nombre (filtro)
4. Cambiar rol de un usuario → toast exito
5. Intentar eliminar cuenta propia → error
6. Eliminar otro usuario → confirm → OK

### 6. Cliente no ve nada
1. Cerrar sesion, iniciar como cliente
2. En `/productos`: sin iconos en cards, sin botones admin
3. Llamada directa a `POST /api/productos` → 403

## Tests
```bash
npm run test:backend    # supertest - endpoints admin
npm run test:frontend   # testing-library - forms, proteccion
npm run lint            # ESLint
```
