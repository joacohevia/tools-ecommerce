---
name: code-refactoring
description: >
  Se activa al refactorizar código en herramientas-tandil (frontend React o backend Express).
  Cubre extracción de funciones, separación de responsabilidades, eliminación de duplicación,
  renombrado de archivos/variables y migración de patrones obsoletos. Úsala cuando el usuario
  pida refactorizar, simplificar, limpiar o reorganizar código existente.
---

# Guía de Refactoring (herramientas-tandil)

---

## 1. Principios generales

### Antes de empezar

1. **Entender qué hace el código** — leer el archivo completo y sus usos (grep para imports)
2. **Asegurar que hay respaldo** — el proyecto está en git, confirmar que no hay cambios sin committear
3. **Hacer cambios mínimos y atómicos** — un refactor por vez, testeable
4. **No cambiar comportamiento** — el refactoring no debe alterar la funcionalidad visible

### Después de refactorizar

1. Verificar que el proyecto compile/buildee: `npm run build` (frontend)
2. Verificar que no haya errores de lint: `npm run lint`

---

## 2. Refactoring en Frontend (React)

### Extraer lógica repetida a helpers

Si dos o más componentes repiten la misma lógica, extraer a una función:

```jsx
// ❌ Repetido en card.jsx, cardDetail.jsx, carrouseles...
const precioRegular = Number(producto.precio) || 0;
const precioOferta = producto.precio_oferta ? Number(producto.precio_oferta) : null;
const precioEfectivo = precioOferta || precioRegular;

// ✅ Extraer a src/utils/precios.js
export function getPrecioEfectivo(producto) {
  const regular = Number(producto.precio) || 0;
  const oferta = producto.precio_oferta ? Number(producto.precio_oferta) : null;
  return { regular, oferta, efectivo: oferta || regular };
}
```

### Mover fetch al http.js

Si un componente tiene un `fetch` inline, moverlo a `src/http.js`:

```jsx
// ❌ fetch directo en el componente
const res = await fetch("http://localhost:3000/api/productos");

// ✅ Función en http.js
// src/http.js
export async function getProductos(filtros = {}) { ... }

// Componente
import { getProductos } from '../../http';
const data = await getProductos(filtros);
```

### Separar lógica de presentación

Si un componente crece mucho (>150 líneas), considerar:

1. **Extraer sub-componentes:** partes del JSX que tienen sentido por sí solas
2. **Extraer hooks custom:** lógica de estado que puede reutilizarse
3. **Extraer funciones puras:** lógica de filtrado/ordenamiento a helpers

```jsx
// ✅ Hook custom para filtrado reutilizable
function useFiltros(productos, categorias, marcas) {
  const [selectedMarcas, setSelectedMarcas] = useState([]);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  // ...
  const productosFiltrados = useMemo(() => ..., [...]);
  return { productosFiltrados, selectedMarcas, setSelectedMarcas, ... };
}
```

### Simplificar useEffect

Si un `useEffect` tiene muchas dependencias o lógica compleja:

1. Mover la lógica a un hook custom (`useFetchProductos`, `useCarrito`)
2. Si la lógica responde a un evento de usuario → mover al event handler
3. Si dos efectos dependen de los mismos datos → considerar unirlos

### Eliminar estado derivado

```jsx
// ❌ Estado que se puede derivar
const [productos, setProductos] = useState([]);
const [productosCount, setProductosCount] = useState(0);
useEffect(() => { setProductosCount(productos.length); }, [productos]);

// ✅ Derivar directamente
const productosCount = productos.length;
```

### Renombrar archivos/componentes

Si un componente cambia de responsabilidad:
- El archivo debe llamarse igual que el componente (en lowercase)
- Actualizar TODOS los imports (usar grep para encontrar referencias)
- Si el componente se movió de carpeta, actualizar paths relativos

---

## 3. Refactoring en Backend (Express)

### Extraer rutas a archivos separados

Cuando `server.js` crece demasiado:

```
backend/
  server.js               # Solo configuración de app y listen
  routes/
    productos.js          # Router de productos
    categorias.js         # Router de categorías
    marcas.js             # Router de marcas
    upload.js             # Router de upload
  services/
    storage.js            # Lógica de Supabase Storage
```

```js
// routes/productos.js
import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => { ... });
router.get("/:id", async (req, res) => { ... });
router.post("/", async (req, res) => { ... });

export default router;

// server.js
import productosRouter from "./routes/productos.js";
app.use("/api/productos", productosRouter);
```

### Eliminar duplicación de queries

Si dos o más rutas usan la misma query de Supabase:

```js
// ❌ Duplicado en GET /api/productos y GET /api/productos/:id
.supabase.from("productos").select("*, categorias(nombre, slug), marcas(nombre)")

// ✅ Constante compartida
const PRODUCTO_JOIN = "*, categorias(nombre, slug), marcas(nombre)";
```

### Simplificar handlers

Si un handler tiene mucha lógica de negocio mezclada con HTTP:

1. Extraer validación a funciones `validateProducto(body)`
2. Extraer queries complejas a funciones `buildProductoQuery(filters)`
3. Extraer transformaciones a funciones `formatProducto(data)`

### Eliminar console.log de debugging

Los `console.log` que se usaron para debuggear deben removerse o convertirse a
logs estructurados con nivel adecuado. Solo mantener logs de error (`console.error`).

---

## 4. Refactoring transversal

### Eliminar código muerto

Buscar y eliminar:
- Variables declaradas pero no usadas (ESLint las detecta)
- Funciones exportadas que nadie importa (grep el nombre en todo el proyecto)
- Componentes no usados en ninguna ruta
- CSS/estilos que no aplican a ningún elemento

### Renombrar variables/archivos

**Variables:**
- Usar `camelCase` para variables y funciones
- Usar `PascalCase` para componentes React
- Nombres descriptivos: `productosFiltrados` mejor que `data`

**Archivos:**
- Frontend: lowercase (`nav.jsx`, `cardDetail.jsx`)
- Backend: lowercase (`server.js`)

**Pasos para renombrar:**
1. `grep "nombreViejo"` en todo el proyecto para encontrar usos
2. Renombrar en el archivo donde se define
3. Actualizar todos los imports/referencias
4. Si es un archivo: renombrar el archivo + actualizar imports

### Unificar estilos de código

- Comillas simples (`'`) para strings en JS/JSX
- Sin punto y coma al final de línea
- 2 espacios de indentación (no tabs)
- Sin comentarios innecesarios (el código debe ser auto-explicativo)
- Funciones exportadas incluyen JSDoc con `@param` y `@returns`

---

## 5. Checklist de verificación post-refactor

### Frontend
- [ ] `npm run build` no da errores
- [ ] `npm run lint` no da nuevos warnings
- [ ] Los imports de `http.js` siguen funcionando
- [ ] Las rutas de react-router-dom no se rompieron
- [ ] El contexto del carrito sigue accesible desde los componentes que lo usan

### Backend
- [ ] `npm run dev` levanta sin errores (en `backend/`)
- [ ] Las variables de entorno se cargan correctamente
- [ ] Los endpoints devuelven el mismo formato de respuesta
- [ ] Los códigos de status no cambiaron (200, 201, 400, 404, 500)

### General
- [ ] No se introdujeron nuevos secretos/keys en el código
- [ ] Los mensajes de error al usuario no filtran información interna
- [ ] No quedó código comentado de la versión anterior
- [ ] No quedaron `console.log` de debugging
