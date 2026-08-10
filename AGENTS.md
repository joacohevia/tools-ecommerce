# AGENTS.md — herramientas-tandil

## Stack

- **Frontend:** React 19 + Vite 8 (JSX, Tailwind CSS v4)
- **Backend:** Node.js + Express 5 (ES Modules, puerto 3000)
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage (bucket `productos`)
- **Package manager:** npm
- **MCP:** servidor local `supabase-read` (3 tools read-only)

## Commands

```sh
# Frontend (raiz)
npm run dev       # Vite dev server
npm run build     # production build
npm run lint      # ESLint

# Backend
cd backend && npm run dev    # nodemon server.js
cd backend && npm start      # node server.js

# Dependencias MCP (solo si cambia backend/package.json)
cd backend && npm install
```

## Database schema (6 tablas)

```
categorias
├── id (bigint PK, nextval)
├── nombre (text, unique, not null)
├── slug (text, unique, not null)
└── created_at (timestamptz, default now())

marcas
├── id (bigint PK, nextval)
├── nombre (text, unique, not null)
└── created_at (timestamptz, default now())

productos
├── id (bigint PK, nextval)
├── nombre (text, not null)
├── descripcion (text, nullable)
├── slug (text, unique, not null)
├── precio (numeric, not null)
├── precio_oferta (numeric, nullable)
├── stock (integer, default 0)
├── categoria_id (bigint, not null, FK → categorias.id)
├── marca_id (bigint, not null, FK → marcas.id)
├── destacado (boolean, default false)
├── mas_vendido (boolean, default false)
├── imagenes (text[], default '{}', URLs de Supabase Storage)
└── created_at (timestamptz, default now())

perfiles
├── id (bigint PK, nextval)
├── user_id (uuid, not null, FK → auth.users.id)
├── nombre (text, not null)
├── apellido (text, not null)
├── dni (text, nullable)
├── rol (text, not null, default 'cliente', CHECK: admin|cliente)
└── created_at (timestamptz, default now())

pedidos
├── id (bigint PK, nextval)
├── perfil_id (bigint, not null, FK → perfiles.id)
├── estado (text, not null, default 'pendiente', CHECK: pendiente|confirmado|enviado|entregado|cancelado)
├── total (numeric, not null, default 0)
├── nota (text, nullable)
└── created_at (timestamptz, default now())

pedido_items
├── id (bigint PK, nextval)
├── pedido_id (bigint, not null, FK → pedidos.id)
├── producto_id (bigint, not null, FK → productos.id)
├── cantidad (integer, not null, CHECK > 0)
├── precio_unitario (numeric, not null)
└── subtotal (numeric, generated: cantidad * precio_unitario)
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

## MCP tools (supabase-read)

Servidor local via stdio definido en `backend/mcp/supabase-read/server.js`. Usa `@modelcontextprotocol/sdk` + `@supabase/supabase-js`. Solo lectura, sin SQL raw.

| Tool | Descripcion |
|---|---|
| `supabase_list_tables` | Lista las 6 tablas del esquema con columnas, FKs y filas estimadas |
| `supabase_get_columns` | Columnas de una tabla: nombre, tipo, nullable, default, FK |
| `supabase_select` | SELECT parametrizado con filtros (eq, neq, gt, gte, lt, lte, like, ilike, is, in), orden y limite. Soporta joins via `select: "*,categorias(nombre)"` |

El servidor consulta la estructura de tablas dinámicamente desde la especificación OpenAPI de Supabase/PostgREST en tiempo de ejecución.

Configurado en `opencode.json` → `mcp.supabase-read`. El MCP original de Supabase está desactivado (`enabled: false`).

## Frontend architecture

```
src/
├── main.jsx                     ← entry point (BrowserRouter + StrictMode)
├── App.jsx                      ← root (Routes + CarritoProvider)
├── index.css                    ← Tailwind imports + CSS variables + fuentes
├── http.js                      ← todas las llamadas al backend viven aca (antes productosService.jsx)
├── supabase.js                  ← cliente Supabase (para auth futura, no para queries)
├── assets/
│   └── hero.png
├── context/
│   └── CarritoContext.jsx       ← estado global del carrito (Context API + localStorage)
└── components/
    ├── nav.jsx                  ← barra de navegacion (logo, busqueda, usuario, carrito, categorias)
    ├── footer.jsx               ← footer simple
    ├── busq.jsx                 ← barra de busqueda con dropdown de resultados
    ├── card.jsx                 ← card de producto (usada en carruseles y grid)
    ├── filtrado.jsx             ← panel lateral de filtros (marcas, categorias, precio)
    ├── pages/
    │   ├── home.jsx             ← landing page (compone carruseles y secciones)
    │   ├── productos.jsx        ← catalogo con filtros, orden y breadcrumb
    │   ├── contacto.jsx         ← formulario de contacto + datos de la empresa
    │   ├── cardDetail.jsx       ← detalle de producto (galeria, breadcrumb, add-to-cart)
    │   ├── login.jsx            ← login (placeholder, sin auth real)
    │   └── registro.jsx         ← registro (placeholder, sin auth real)
    ├── carrouseles/
    │   ├── carrouselOfertas.jsx  ← GET /api/productos?destacado=true
    │   └── carrouselVendidos.jsx ← GET /api/productos?mas_vendido=true
    └── secciones/
        ├── seccionHerramientas.jsx ← GET /api/categorias
        ├── seccionNov.jsx          ← ultimos 6 productos
        └── seccionDescripcion.jsx  ← placeholder vacio
```

**Regla:** los componentes nunca llaman a Supabase ni a `fetch` directo. Toda llamada HTTP va a traves de `http.js`.

## Routes

| Path | Component | Descripcion |
|---|---|---|
| `/home` | `Home` | Landing page |
| `/productos` | `Productos` | Catalogo con filtros, orden y breadcrumb. Soporta `?categoria=slug` para pre-seleccion |
| `/productos?categoria=slug` | `Productos` | Idem, con categoria pre-seleccionada desde el nav |
| `/producto/:id` | `CardDetail` | Detalle del producto |
| `/contacto` | `Contacto` | Formulario de contacto |
| `/login` | `Login` | Login (placeholder) |
| `/registro` | `Registro` | Registro (placeholder) |

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
- Tema oscuro: variables CSS en `index.css` (`--bg-dark`, `--bg-blue-dark`, `--text-primary`, `--text-secondary`, `--accent`)
- Clases de tema: `bg-dark-blue`, `text-dark-text`, `text-dark-muted`, `border-white/10`
- Routing: react-router-dom v7 (`BrowserRouter`, `Routes`, `Route`, `Link`, `useNavigate`, `useSearchParams`)
- Estado global: CarritoContext (Context API + localStorage)
- Patron de filtrado: `useState` para filtros + `useMemo` para datos procesados + `useSearchParams` para sincronizar URL
- Docstrings: funciones exportadas y helpers complejos incluyen JSDoc con `@param` y `@returns`

<!-- SPECKIT START -->
Plan actual: `specs/003-ux-improvements/plan/plan.md` — Mejoras de UX: navegación, menú hamburguesa, filtros mobile, animaciones, toggle contraseña, WhatsApp
<!-- SPECKIT END -->
