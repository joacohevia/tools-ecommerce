# AGENTS.md — herramientas-tandil

## Stack

- **Frontend:** React 19 + Vite 8 (JSX, Tailwind CSS v4)
- **Backend:** Node.js + Express 5 (ES Modules, puerto 3000)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (bucket `productos`)
- **Package manager:** npm

## Commands

```sh
# Frontend (raiz)
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # ESLint

# Backend
cd backend && npm run dev    # nodemon server.js
cd backend && npm start      # node server.js
```

## Database schema

```
categorias
├── id (bigserial PK)
├── nombre (text, unique)
├── slug (text, unique)
└── created_at (timestamptz)

marcas
├── id (bigserial PK)
├── nombre (text, unique)
└── created_at (timestamptz)

productos
├── id (bigserial PK)
├── nombre (text)
├── descripcion (text, nullable)
├── slug (text, unique)
├── precio (numeric)
├── precio_oferta (numeric, nullable)
├── stock (integer, default 0)
├── categoria_id (bigint FK → categorias.id)
├── marca_id (bigint FK → marcas.id)
├── destacado (boolean, default false)
├── mas_vendido (boolean, default false)
├── imagenes (text[], URLs de Supabase Storage)
└── created_at (timestamptz, default now())
```

Para aplicar el esquema: ejecutar `baseHerramientas.sql` en el SQL Editor de Supabase.

## Backend API (Express)

| Endpoint | Método | Descripcion |
|---|---|---|
| `/api/productos` | GET | Listar (filtros: categoria, marca, destacado, mas_vendido) |
| `/api/productos/:id` | GET | Producto individual |
| `/api/productos` | POST | Crear producto |
| `/api/productos/:id` | PUT | Actualizar producto |
| `/api/productos/:id` | DELETE | Eliminar producto |
| `/api/categorias` | GET | Listar categorias |
| `/api/marcas` | GET | Listar marcas |
| `/api/upload` | POST | Subir imagen (multipart/form-data) |

Archivo: `backend/server.js`. Usa `@supabase/supabase-js` (anon key) para queries y `supabase.storage` para uploads.
Imagenes: `multer` recibe → `sharp` comprime (800px, WebP 75%) → sube a Storage → devuelve URL publica.

## Frontend architecture

```
src/
├── main.jsx
├── App.jsx
├── App.css
├── index.css
├── supabase.js              ← cliente Supabase (para auth futura, no para queries)
└── components/
    ├── productosService.jsx  ← TODAS las llamadas al backend viven aca
    ├── nav.jsx
    ├── footer.jsx
    ├── card.jsx
    ├── carrouselOfertas.jsx  ← GET /api/productos?destacado=true
    ├── carrouselVendidos.jsx ← GET /api/productos?mas_vendido=true
    ├── productos.jsx         ← GET /api/productos (listado completo)
    ├── seccionHerramientas.jsx ← GET /api/categorias
    └── seccionNov.jsx        ← GET /api/productos (ultimos 6)
```

**Regla:** los componentes nunca llaman a Supabase ni a `fetch` directo. Toda llamada HTTP va a traves de `productosService.jsx`.

## Image upload flow

```
1. Usuario selecciona foto en el celu (3-5 MB)
2. Frontend la comprime con canvas (max 800px)
3. POST /api/upload → FormData con el file
4. Backend: multer → sharp (800px, WebP 75%, ~50-150 KB final)
5. Supabase Storage bucket "productos" → guarda el .webp
6. Devuelve URL publica: { url: "https://...supabase.co/.../uuid.webp" }
7. Frontend guarda URL en productos.imagenes[]
```

## React conventions

- Nombres de archivo en lowercase: `nav.jsx`, `card.jsx`
- Estados de datos: loading, error, data en todo fetch
- CSS: Tailwind utility classes para nuevo codigo
- No routing, no state management global
