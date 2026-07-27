# Implementation Plan: Administracion desde el Catalogo

**Branch**: `001-admin-panel` | **Date**: 2026-07-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-admin-panel/spec.md`

## Summary

Centralizar toda la administracion (productos, categorias, marcas) directamente desde `/productos`. Las cards ya tienen iconos de editar/eliminar para admin. Se agregan 3 botones (Agregar producto, categoria, marca) visibles solo para admin. Los formularios en `src/components/form/` se implementan como componentes reutilizables (creacion + edicion via props). `admin.jsx` se limita exclusivamente a la vista de usuarios (listar, buscar, cambiar rol, eliminar).

## Technical Context

**Language/Version**: JavaScript ES Modules (Node.js 22+, React 19)
**Primary Dependencies**: Express 5, @supabase/supabase-js, React 19, react-router-dom v7, Tailwind CSS v4, sharp, multer
**Storage**: Supabase PostgreSQL (6 tablas) + Supabase Storage (bucket `productos`)
**Testing**: Vitest, supertest, @testing-library/react + jsdom + msw
**Target Platform**: Web SPA + REST API
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Catalogo se actualiza sin recarga tras CRUD (SC-003)
**Constraints**: admin.jsx sin logica CRUD de productos/categorias/marcas; formularios reutilizables; autorizacion backend obligatoria

## Constitution Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Frontend HTTP Abstraction | ✅ PASS | Forms y componentes usan funciones de `src/http.js`. Sin `fetch` ni Supabase directo. |
| II. Backend REST API | ✅ PASS | Endpoints `/api/*` con `@supabase/supabase-js`. Validacion 409 en DELETE categoria/marca. |
| III. Image Processing Pipeline | ✅ PASS | productForm reutiliza flujo canvas → uploadImagen → multer/sharp → Storage. |
| IV. Server-Side Validation | ✅ PASS | DELETE valida productos asociados. auth + adminOnly en todos los endpoints admin. FR-024, FR-025. |
| V. React Component Conventions | ✅ PASS | Archivos lowercase, Tailwind, separacion presentacion/datos. |
| VI. Explicit Data States | ✅ PASS | loading/error/data/empty en forms y vista de usuarios. |
| VII. Routing Conventions | ✅ PASS | `/productos` existente, `/admin` solo si se implementa vista usuarios separada. |
| VIII. Filtering & URL Sync | ⚠️ N/A | No hay nuevo filtrado con URL sync en esta feature. |
| IX. Documentation | ✅ PASS | JSDoc en forms exportados y funciones nuevas de http.js. |

**Gate result**: PASS — 0 violations.

## Project Structure

### Source Code Changes

```text
# Backend
backend/
├── server.js              # [MODIFIED] DELETE /api/categorias/:id: validar productos asociados (409)
│                          # [MODIFIED] DELETE /api/marcas/:id: validar productos asociados (409)
│                          # [NEW] PUT /api/perfiles/:id — cambiar rol de usuario (auth + adminOnly)
│                          # [NEW] DELETE /api/perfiles/:id — eliminar usuario, no permitir auto-eliminacion

# Frontend
src/
├── http.js                # [MODIFIED] Agregar updatePerfilRol, deletePerfil, searchPerfiles
├── components/
│   ├── nav.jsx            # [MODIFIED] Si hay vista admin separada, link condicional
│   ├── card.jsx           # [EXISTING] Iconos editar/eliminar para admin (preservar/verificar)
│   ├── form/
│   │   ├── productForm.jsx # [NEW] Reutilizable: creacion + edicion via prop `producto`
│   │   ├── categForm.jsx   # [NEW] Reutilizable: creacion + edicion via prop `categoria`
│   │   └── marcaForm.jsx   # [NEW] Reutilizable: creacion + edicion via prop `marca`
│   └── pages/
│       ├── productos.jsx   # [MODIFIED] Si es admin: 3 botones + manejo de forms modales
│       └── admin.jsx       # [NEW o MODIFIED] Solo vista de usuarios con listado y filtros
```

## Complexity Tracking

> No constitution violations — this section intentionally left empty.
