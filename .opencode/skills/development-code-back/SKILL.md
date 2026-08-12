---
name: development-code-back
description: >
  Se activa al modificar o extender el backend Express de herramientas-tandil
  (backend/server.js). Combina las convenciones propias del proyecto (Supabase, multer/sharp
  para imágenes, endpoints REST) con principios generales de Node.js/Express de la comunidad
  (validación en los bordes, checklist de seguridad, manejo de errores async). Úsala siempre
  que se agregue una ruta, se toque el manejo de imágenes, se valide input, o se revise el
  servidor por seguridad o robustez.
---

# Backend Best Practices (herramientas-tandil — Node.js/Express 5 + Supabase)

Combina dos fuentes:
1. **Convenciones propias de herramientas-tandil** — Express 5 con Supabase PostgreSQL,
   multer + sharp para uploads, endpoints REST.
2. **Principios generales de Node.js/Express** — validación en los bordes, checklist de
   seguridad, manejo de errores async, separación de responsabilidades.

Regla de prioridad: **las convenciones del proyecto ganan**.

> herramientas-tandil usa Supabase como base de datos (no archivos JSON). Las queries
> se hacen con `@supabase/supabase-js` (anon key). Las imágenes se procesan con
> multer → sharp (800px WebP 75%) y se suben a Supabase Storage (bucket `productos`).

---

## 1. Stack

- **Runtime:** Node.js con ES Modules (`"type": "module"`)
- **Framework:** Express 5 (puerto 3000)
- **Database:** Supabase PostgreSQL via `@supabase/supabase-js`
- **Storage:** Supabase Storage (bucket `productos`)
- **Imágenes:** multer → sharp (redimensiona a 800px, convierte a WebP 75%)
- **Dependencias clave:** `express`, `cors`, `multer`, `sharp`, `@supabase/supabase-js`, `dotenv`

Archivo principal: `backend/server.js` (~229 líneas)

---

## 2. Estructura del servidor

### Middleware en orden correcto

```js
const app = express();

app.use(cors());          // 1. CORS (paquete cors, no manual)
app.use(express.json());  // 2. Parseo de body JSON

// 3. Rutas de la API
app.get("/api/productos", ...);
app.get("/api/categorias", ...);
app.get("/api/marcas", ...);
app.post("/api/upload", upload.single("imagen"), ...);

// 4. Root y 404 al final
app.get("/", ...);
app.use((req, res) => { res.status(404).json({ error: "Ruta no encontrada" }); });

// 5. Listen
app.listen(PORT, ...);
```

El orden importa: CORS y parseo primero, rutas al medio, 404 al final.

### CORS

Se usa el paquete `cors` (no manual):
```js
import cors from "cors";
app.use(cors());
```

### Credenciales

Las variables de entorno se cargan con `dotenv` desde el `.env` raíz:
```js
dotenv.config({ path: "../.env" });
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
```

---

## 3. API Endpoints

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/productos` | GET | Listar productos (filtros: `categoria`, `marca`, `destacado`, `mas_vendido`) |
| `/api/productos/:id` | GET | Producto individual con joins a categorías y marcas |
| `/api/productos` | POST | Crear producto (body: nombre, slug, precio, categoria_id, marca_id, etc.) |
| `/api/productos/:id` | PUT | Actualizar producto |
| `/api/productos/:id` | DELETE | Eliminar producto |
| `/api/categorias` | GET | Listar categorías (con `Cache-Control: no-store`) |
| `/api/marcas` | GET | Listar marcas |
| `/api/upload` | POST | Subir imagen (multipart/form-data) |

### Convenciones de respuesta

- **200**: Éxito (GET, PUT, DELETE)
- **201**: Recurso creado (POST)
- **400**: Parámetros inválidos
- **404**: Recurso no encontrado
- **500**: Error interno

Todas las respuestas son JSON.

---

## 4. Queries a Supabase

### Patrón estándar de query

```js
app.get("/api/productos", async (req, res) => {
  try {
    const { categoria, marca, destacado, mas_vendido } = req.query;

    let query = supabase
      .from("productos")
      .select("*, categorias(nombre, slug), marcas(nombre)")
      .order("nombre");

    if (categoria) query = query.eq("categorias.slug", categoria);
    if (marca) query = query.eq("marcas.nombre", marca);
    if (destacado) query = query.eq("destacado", true);
    if (mas_vendido) query = query.eq("mas_vendido", true);

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});
```

### Patrones importantes

- **Joins anidados:** `select("*, categorias(nombre, slug), marcas(nombre)")`
- **Single row:** `.eq("id", req.params.id).single()` para GET by ID
- **Insert con return:** `.insert({...}).select().single()`
- **Update:** `.update(req.body).eq("id", req.params.id).select().single()`
- **Delete:** `.delete().eq("id", req.params.id)`

### Validación en POST

```js
if (!nombre || !slug || !precio || !categoria_id || !marca_id) {
  return res.status(400).json({
    error: "Faltan campos requeridos: nombre, slug, precio, categoria_id, marca_id"
  });
}
```

---

## 5. Image Upload Flow

```
1. Cliente envía FormData con el campo "imagen"
2. multer recibe el archivo → guarda temporal en backend/uploads/
3. sharp lo procesa: resize(800px, WebP 75%)
4. Se lee el buffer resultante
5. supabase.storage.from("productos").upload(...)  → bucket público
6. Se limpian archivos temporales con unlink()
7. Se devuelve { url: "https://...supabase.co/.../uuid.webp" }
```

### Código de referencia

```js
const upload = multer({ dest: path.join(__dirname, "uploads") });

app.post("/api/upload", upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibio ninguna imagen" });

    const filePath = req.file.path;
    const filename = `${randomUUID()}.webp`;
    const outputPath = path.join(__dirname, "uploads", filename);

    await sharp(filePath)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath);

    const fileBuffer = await fs.promises.readFile(outputPath);

    const { error } = await supabase.storage
      .from("productos")
      .upload(filename, fileBuffer, {
        contentType: "image/webp",
        cacheControl: "3600",
      });

    // Cleanup
    await unlink(filePath).catch(() => {});
    await unlink(outputPath).catch(() => {});

    if (error) return res.status(500).json({ error: error.message });

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/productos/${filename}`;
    res.json({ url: publicUrl });
  } catch {
    res.status(500).json({ error: "Error al subir imagen" });
  }
});
```

**Detalles importantes:**
- El directorio `backend/uploads/` es temporal — solo vive mientras se procesa la imagen
- Siempre hacer cleanup de archivos temporales aunque falle (`.catch(() => {})`)
- `withoutEnlargement: true` evita que imágenes chicas se agranden
- La URL pública sigue el patrón: `${SUPABASE_URL}/storage/v1/object/public/productos/${filename}`

---

## 6. Manejo de errores

### Try/catch obligatorio en handlers async

Todo handler `async` DEBE tener try/catch — Express 5 mejora el manejo pero el patrón
explícito es más seguro y predecible:

```js
app.get("/api/ruta", async (req, res) => {
  try {
    // lógica
  } catch (err) {
    console.error("[GET /api/ruta] Error:", err);
    res.status(500).json({ error: "Mensaje genérico" });
  }
});
```

### Mensajes de error al cliente

- Nunca filtrar detalles internos (stack traces, paths del filesystem)
- Los errores de Supabase se envían con `error.message` (solo en desarrollo)
- En handlers genéricos, usar mensajes amigables: `"Error al obtener productos"`

### 404 catch-all

Siempre al final de todas las rutas, después del root:
```js
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});
```

---

## 7. Validación de entrada

Principio: **validar siempre en los bordes** — antes de tocar la DB o el filesystem.

### Query params

```js
// En GET /api/productos — los filtros son opcionales pero válidos
const { categoria, marca, destacado, mas_vendido } = req.query;
```

### Body en POST/PUT

```js
if (!nombre || !slug || !precio || !categoria_id || !marca_id) {
  return res.status(400).json({ error: "Faltan campos requeridos" });
}
```

### Uploads

```js
if (!req.file) {
  return res.status(400).json({ error: "No se recibio ninguna imagen" });
}
```

---

## 8. Configuración y entorno

### Puerto configurable

```js
const PORT = process.env.PORT || 3000;
```

### Variables de entorno en `.env`

```
VITE_SUPABASE_URL=https://eqybnumouyhtxklrzuvc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Directorios con `import.meta.url`

```js
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

---

## 9. MCP Server (supabase-read)

El proyecto incluye un servidor MCP local en `backend/mcp/supabase-read/server.js` que
expone 3 tools read-only sobre las tablas públicas:

| Tool | Descripción |
|---|---|
| `supabase_list_tables` | Lista las 6 tablas con columnas, FKs y filas estimadas |
| `supabase_get_columns` | Columnas de una tabla específica |
| `supabase_select` | SELECT parametrizado con filtros, orden, límite y joins |

**Regla:** si se modifica `baseHerramientas.sql`, sincronizar el objeto `SCHEMA` hardcodeado
en `backend/mcp/supabase-read/server.js`.

---

## 10. Scripts de package.json

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

- `npm run dev` — desarrollo con hot reload (nodemon)
- `npm start` — producción

---

## 11. Checklist de seguridad y robustez

- [ ] ¿Todo input (query params, body, file) se valida antes de usarse?
- [ ] ¿Cada handler async tiene try/catch?
- [ ] ¿Los mensajes de error al cliente no filtran detalles internos?
- [ ] ¿El 404 catch-all está al final de todas las rutas?
- [ ] ¿Los archivos temporales de upload se limpian siempre (incluso en error)?
- [ ] ¿Las queries a Supabase validan `error` antes de usar `data`?
- [ ] ¿Los secretos están en `.env`, nunca hardcodeados?
- [ ] ¿Las rutas nuevas siguen el prefijo `/api/`?
- [ ] ¿Los endpoints de escritura (POST/PUT/DELETE) validan el body?

---

## 12. Cuándo refactorizar el backend

| Señal | Acción |
|---|---|
| `server.js` supera ~400 líneas | Separar rutas en `routes/productos.js`, `routes/categorias.js`, etc. |
| Lógica de negocio se mezcla con HTTP | Extraer a capa `services/` |
| Muchas rutas repitiendo try/catch | Crear wrapper `asyncHandler` |
| Aparecen queries complejas o transacciones | Considerar `supabase.rpc()` para stored procedures |
| Necesidad de autenticación real | Activar Supabase Auth + middleware de verificación JWT |
