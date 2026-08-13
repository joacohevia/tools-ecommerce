# Herramientas Tandil

E-commerce de una ferretería/herramientas de Tandil. Catálogo navegable con filtros, carrito de compras y un flujo de compra simple basado en WhatsApp (sin pasarela de pago ni login obligatorio).

## Qué resuelve

- **Catálogo online**: productos organizados por categorías y marcas, con destacados, más vendidos, búsqueda y filtros por precio/marca/categoría.
- **Detalle de producto**: galería de imágenes, precio con oferta, stock y descripción.
- **Carrito**: persistente en `localStorage`, con manejo de cantidades y total.
- **Compra anónima**: el cliente completa un formulario (celular, correo, envío/retiro, método de pago) y el pedido se envía al vendedor por WhatsApp con el detalle, el total y los datos para transferir.
- **Panel de administración**: gestión de productos, categorías, marcas, usuarios y pedidos (autenticado con rol `admin`).

## Tecnologías

### Frontend
- **React 19** + **Vite 8** (JSX)
- **Tailwind CSS v4**
- **react-router-dom v7**
- **embla-carousel-react** (carruseles)
- Context API para estado global (carrito, auth, toasts, confirmaciones)

### Backend
- **Node.js** + **Express 5** (ES Modules, puerto 3000)
- **Supabase** (`@supabase/supabase-js`) para datos (PostgreSQL) y almacenamiento de imágenes (Storage bucket `productos`)
- **multer** + **sharp** para subir y comprimir imágenes
- **Swagger UI** (`/api-docs`) para documentar la API

### Base de datos
- **Supabase PostgreSQL** con 6 tablas: `categorias`, `marcas`, `productos`, `perfiles`, `pedidos`, `pedido_items`.

### MCP (Model Context Protocol)
- Servidor local `supabase-read` (read-only) con 3 tools: `supabase_list_tables`, `supabase_get_columns`, `supabase_select`. Definido en `backend/mcp/supabase-read/server.js`.

## Requisitos previos

- Node.js 18+
- npm
- Una cuenta y proyecto en [Supabase](https://supabase.com)

## Configuración

1. Clonar el repositorio e instalar dependencias:

```sh
npm install
cd backend && npm install
```

2. Crear el archivo `.env` en la raíz con:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
VITE_FRONTEND_URL=http://localhost:5173
```

3. Aplicar el esquema de base de datos ejecutando `baseHerramientas.sql` en el SQL Editor de Supabase.

4. (Opcional) Completar los datos de pago y de WhatsApp:
   - `src/config/pago.js` → `alias` y `titular` de la cuenta para transferencias.
   - `src/config/whatsapp.js` → número de WhatsApp que recibe los pedidos.

## Scripts

```sh
# Frontend (raíz)
npm run dev        # servidor de desarrollo Vite
npm run build      # build de producción
npm run lint       # ESLint
npm run test       # Vitest (frontend + backend)

# Backend
cd backend && npm run dev    # nodemon server.js
cd backend && npm start      # node server.js
```

## Estructura del proyecto

```
herramientas-tandil/
├── src/                      # Frontend React
│   ├── main.jsx              # entry point (BrowserRouter + StrictMode)
│   ├── App.jsx               # rutas + proveedores
│   ├── index.css             # Tailwind + variables de tema + utilidades
│   ├── http.js               # capa HTTP (todas las llamadas al backend)
│   ├── supabase.js           # cliente Supabase (auth)
│   ├── config/               # configuración (whatsapp, pago)
│   ├── context/              # CarritoContext, AuthContext, ToastContext, ConfirmContext
│   └── components/
│       ├── nav.jsx           # barra de navegación + carrito dropdown
│       ├── card.jsx          # card de producto
│       ├── filtrado.jsx      # panel de filtros
│       ├── busq.jsx          # barra de búsqueda
│       ├── pages/            # home, productos, cardDetail, contacto, login, registro, realizarCompra, admin
│       ├── carrouseles/      # carruseles de ofertas y más vendidos
│       └── secciones/        # secciones de la landing
├── backend/
│   ├── server.js             # API Express
│   ├── openapi.yml           # especificación OpenAPI (Swagger)
│   └── mcp/supabase-read/    # servidor MCP read-only
├── baseHerramientas.sql      # esquema de base de datos
└── specs/                    # planes de trabajo (Spec Kit)
```

## Base de datos

| Tabla | Descripción |
|---|---|
| `categorias` | `id`, `nombre` (unique), `slug` (unique), `created_at` |
| `marcas` | `id`, `nombre` (unique), `created_at` |
| `productos` | nombre, descripción, slug, precio, precio_oferta, stock, FK a categoría y marca, destacado, más vendido, imágenes |
| `perfiles` | FK a `auth.users`, nombre, apellido, dni, rol (`admin`/`cliente`) |
| `pedidos` | FK a perfil, estado, total, nota |
| `pedido_items` | FK a pedido y producto, cantidad, precio unitario, subtotal generado |

## API

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/productos` | GET/POST | Listar (filtros: categoria, marca, destacado, mas_vendido) / crear |
| `/api/productos/:id` | GET/PUT/DELETE | Obtener / actualizar / eliminar |
| `/api/categorias` | GET/POST | Listar / crear |
| `/api/marcas` | GET/POST | Listar / crear |
| `/api/pedidos` | GET/POST | Listar / crear pedido |
| `/api/auth/login`, `/api/auth/me` | POST/GET | Autenticación |
| `/api/perfiles` | GET/POST | Gestión de perfiles |
| `/api/upload` | POST | Subir imagen (multipart) |
| `/api/admin/*` | GET/PUT/DELETE | Endpoints de administración |

## Flujo de compra

1. El usuario agrega productos al carrito.
2. Desde el carrito pulsa **"Comprar"** → `/realizar-compra`.
3. Completa celular, correo, método de entrega (envío con dirección y horario, o retiro en sucursal) y método de pago (efectivo o transferencia).
4. En la pantalla de confirmación ve el resumen, el total y los datos para transferir (alias + titular, con botón "Copiar").
5. Al confirmar se abre WhatsApp con el mensaje del pedido (detalle, total, entrega, pago y datos de transferencia). El pedido **no** se persiste en la base de datos: WhatsApp es el canal de notificación al vendedor.

## Subida de imágenes

1. El usuario selecciona una foto (se comprime en el frontend a 800px).
2. `POST /api/upload` → `multer` recibe → `sharp` comprime (800px, WebP 75%).
3. Se sube al bucket `productos` de Supabase Storage.
4. Devuelve la URL pública, que se guarda en `productos.imagenes[]`.
