---
name: skill
description: >
  Se activa al crear, editar o revisar componentes React del frontend de herramientas-tandil
  (carpeta src/). Combina las convenciones propias del proyecto (estructura de carpetas,
  manejo de estado, HTTP layer via http.js, Context API para carrito, Tailwind CSS v4) con
  reglas de performance de Vercel Engineering (waterfalls, re-renders, bundle size, caching).
  Úsala siempre que se escriba un componente nuevo, se toque un useEffect/useState, se
  agregue un fetch, o se revise código existente por performance.
---

# React Frontend Best Practices (herramientas-tandil)

Esta skill combina dos fuentes:
1. **Convenciones propias de herramientas-tandil** — cómo está organizado el proyecto hoy.
2. **Reglas de performance de Vercel Engineering** — patrones generales de la industria
   para evitar waterfalls, re-renders innecesarios y bundles pesados.

Regla de prioridad: si hay conflicto, **las convenciones del proyecto ganan** (son las
que mantienen consistencia con el resto del código). Las reglas de Vercel aplican como
capa de optimización adicional, no como reemplazo de los patrones ya establecidos.

> herramientas-tandil es una SPA con Vite, React 19 y Tailwind CSS v4 (no Next.js).
> Las reglas sobre Server Components / RSC no aplican. Se incluyen solo las de
> performance relevantes en cliente puro.

---

## 1. Stack y estructura de carpetas

**Stack:** React 19, Vite 8, Tailwind CSS v4, react-router-dom v7

```
src/
  main.jsx                    # Entry point (BrowserRouter + StrictMode)
  App.jsx                     # Root (CarritoProvider + Routes)
  index.css                   # Tailwind imports + CSS variables + fuentes
  http.js                     # Capa HTTP — todas las llamadas al backend
  supabase.js                 # Cliente Supabase (auth futura, no para queries)
  assets/
    hero.png
  context/
    CarritoContext.jsx        # Estado global del carrito (Context API + localStorage)
  components/
    nav.jsx                   # Barra de navegación
    footer.jsx                # Footer simple
    busq.jsx                  # Barra de búsqueda con dropdown
    card.jsx                  # Card de producto (carruseles y grid)
    filtrado.jsx              # Panel lateral de filtros
    pages/
      home.jsx                # Landing page
      productos.jsx           # Catálogo con filtros, orden y breadcrumb
      contacto.jsx            # Formulario de contacto
      cardDetail.jsx          # Detalle de producto (galería, breadcrumb, add-to-cart)
      login.jsx               # Login (placeholder)
      registro.jsx            # Registro (placeholder)
    carrouseles/
      carrouselOfertas.jsx    # GET /api/productos?destacado=true
      carrouselVendidos.jsx   # GET /api/productos?mas_vendido=true
    secciones/
      seccionHerramientas.jsx # GET /api/categorias
      seccionNov.jsx          # Últimos 6 productos
      seccionDescripcion.jsx  # Placeholder vacío
```

**Reglas:**
- Nombres de archivo en lowercase: `nav.jsx`, `card.jsx`, `cardDetail.jsx`
- Toda llamada HTTP vive en `http.js` — nunca `fetch` directo ni `supabase-js` dentro de un componente
- Assets estáticos en `assets/`
- Estado global en `context/`

---

## 2. Patrones de estado en componentes

### Los 3 estados obligatorios en todo fetch

```jsx
function MiComponente() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {
      try {
        setIsLoading(true);
        const result = await getProductos();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    cargar();
  }, []);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} />;
  return <DataView data={data} />;
}
```

### useState con inicializador costoso

```jsx
// ❌ Mal: la función se ejecuta en CADA render, aunque el resultado se descarte
const [items, setItems] = useState(cargarDesdeStorage());

// ✅ Bien: se ejecuta solo en el montaje
const [items, setItems] = useState(() => cargarDesdeStorage());
```

### setState funcional para dependencias del valor anterior

```jsx
// ✅ No depende de "items" en el closure, siempre usa el valor más reciente
setItems((prev) => [...prev, nuevoItem]);
```

### useRef para valores sin re-render

Usar `useRef` cuando un valor cambia con mucha frecuencia y no necesita disparar un re-render
(posición de scroll, coordenadas de mouse, timers).

---

## 3. Efectos secundarios (useEffect)

### Fetch con useEffect (patrón estándar del proyecto)

```jsx
useEffect(() => {
  async function cargar() {
    try {
      const data = await getProductos(filtros);
      setProductos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }
  cargar();
}, [filtros]);
```

### Waterfalls — regla de performance crítica (Vercel)

Si un componente necesita datos de dos o más fuentes independientes, lanzarlas en paralelo:

```jsx
// ❌ Mal: espera el primer fetch y recién después el segundo (waterfall)
const productos = await getProductos();
const categorias = await getCategorias();

// ✅ Bien: ambas arrancan en paralelo
const [productos, categorias, marcas] = await Promise.all([
  getProductos(),
  getCategorias(),
  getMarcas(),
]);
```

El proyecto ya sigue este patrón en `productos.jsx:103-107`.

### Dependencias correctas

- Incluir TODAS las variables usadas dentro del efecto en el array de dependencias
- Si una dependencia cambia demasiado seguido, estabilizarla con `useCallback`
- Nunca usar `[]` si hay variables externas usadas adentro

### Lógica de interacción va en handlers, no en useEffect

Cuando la lógica responde a una interacción del usuario (click, submit) y no a un cambio
de estado que requiera sincronización, moverla al event handler directamente.

---

## 4. HTTP Layer (`http.js`)

Todas las llamadas al backend están centralizadas en `src/http.js`. Cada función:

```jsx
const API_URL = "http://localhost:3000/api";

export async function getProductos(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const url = `${API_URL}/productos${params ? `?${params}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}
```

**Reglas:**
- URLs con base en constante `API_URL`
- Cada función lanza `Error` si `!res.ok`
- No mezclar lógica de UI con llamadas HTTP
- Los componentes importan de `../../http.js`, nunca hacen `fetch` directo

---

## 5. Estado global — Context API

### CarritoContext

El carrito usa Context API + localStorage con persistencia automática:

```jsx
// Proveedor en App.jsx
<CarritoProvider>
  <Nav />
  <Routes>...</Routes>
</CarritoProvider>

// Consumo en componentes
const { items, agregarAlCarrito, removerDelCarrito, totalItems, totalPrecio } = useCarrito();
```

**Patrón:**
- `useState(() => cargarDesdeStorage())` para inicializar desde localStorage
- `useEffect` para sincronizar cambios al storage
- `setItems` funcional para operaciones que dependen del estado anterior
- Hook `useCarrito()` lanza error si se usa fuera del Provider

### Cuándo usar Context vs estado local

- **Context:** datos compartidos entre múltiples componentes no relacionados (carrito, auth futura)
- **Estado local:** datos que solo usa un componente y sus hijos directos (filtros, orden, loading)

---

## 6. Routing (react-router-dom v7)

```jsx
// App.jsx — todas las rutas definidas en un solo lugar
<Routes>
  <Route path="/home" element={<Home />} />
  <Route path="/productos" element={<Productos />} />
  <Route path="/producto/:id" element={<CardDetail />} />
  <Route path="/contacto" element={<Contacto />} />
  <Route path="/login" element={<Login />} />
  <Route path="/registro" element={<Registro />} />
</Routes>
```

**Convenciones:**
- `Link` para navegación interna, `useNavigate` para redirecciones programáticas
- `useSearchParams` para sincronizar filtros con la URL (ej: `?categoria=slug`)
- Breadcrumb en páginas de catálogo y detalle: `Inicio / Productos / Nombre`

---

## 7. Patrón de filtrado

Usado en `productos.jsx`:

1. **Un solo fetch inicial** con `Promise.all([getProductos(), getCategorias(), getMarcas()])`
2. **Filtrado y orden en cliente** con `useMemo` — evita refetches innecesarios
3. **Sincronización con URL** vía `useSearchParams` para pre-seleccionar categoría desde el nav

```jsx
const productosFiltrados = useMemo(
  () => filtrarYOrdenar(productos, selectedMarcas, selectedCategorias, precioMin, precioMax, sortBy),
  [productos, selectedMarcas, selectedCategorias, precioMin, precioMax, sortBy]
);
```

---

## 8. Tailwind CSS v4 — convenciones de tema oscuro

El proyecto usa variables CSS en `index.css` para el tema oscuro:

```css
--bg-dark: #0a0a0f;
--bg-dark-blue: #0f1726;
--text-primary: #e2e8f0;
--text-secondary: #94a3b8;
--accent: #3b82f6;
```

**Clases de utilidad propias:**
- `bg-dark`, `bg-dark-blue` — fondos oscuros
- `text-dark-text` — texto principal claro
- `text-dark-muted` — texto secundario
- `border-white/10` — bordes sutiles

**Reglas:**
- Siempre usar utility classes de Tailwind, no CSS custom en componentes nuevos
- Seguir el sistema de colores oscuros existente
- Cards cuadradas de `245px × 333px` con borde `border-white/10` y fondo `bg-dark-blue`

---

## 9. Card de producto — patrón a seguir

```jsx
const Card = ({ producto }) => {
  const { agregarAlCarrito } = useCarrito();

  const imagen = producto.imagenes?.[0] || '/placeholder.jpg';
  const precioRegular = Number(producto.precio) || 0;
  const precioOferta = producto.precio_oferta ? Number(producto.precio_oferta) : null;

  return (
    <Link to={`/producto/${producto.id}`} className="...">
      <img src={imagen} alt={producto.nombre} loading="lazy" />
      <h3>{producto.nombre}</h3>
      {precioOferta && <p className="line-through">${precioRegular}</p>}
      <p>${precioOferta || precioRegular}</p>
      <button onClick={(e) => { e.preventDefault(); agregarAlCarrito({...}); }}>
        Agregar
      </button>
    </Link>
  );
};
```

**Detalles clave:**
- `loading="lazy"` en imágenes para no bloquear el LCP
- `e.preventDefault()` en el botón para que no navegue al hacer click en "Agregar"
- Usa `useCarrito()` directamente, no recibe el carrito por props
- El objeto que se pasa a `agregarAlCarrito` es una versión reducida del producto

---

## 10. Bundle size y carga diferida

### Import directo de subpaths

Si se agrega una librería de íconos o utilidades grandes, importar con paths directos:

```jsx
// ❌ Mal: puede arrastrar toda la librería al bundle
import { FaMapMarker } from "react-icons/fa";

// ✅ Mejor
import FaMapMarker from "react-icons/fa/FaMapMarker";
```

### Lazy loading

Para features pesadas opcionales, usar `React.lazy()` + `Suspense`.

---

## 11. Reglas de performance (Vercel Engineering)

### No definir componentes dentro de otros componentes

```jsx
// ❌ Mal: se redefine en cada render del padre
function AvailablePlaces() {
  function PlaceCard() { /* ... */ }
}

// ✅ Bien: definido a nivel de módulo
function PlaceCard() { /* ... */ }
function AvailablePlaces() { /* usa <PlaceCard /> */ }
```

### useCallback / useMemo con criterio

No envolver cálculos triviales — el overhead de comparar dependencias supera el ahorro.
Reservarlos para:
- Callbacks pasados a hijos memoizados
- Callbacks usados dentro de un useEffect
- Cálculos costosos de verdad (arrays grandes, ordenamiento)

### Ternario sobre && para renderizado condicional

```jsx
// ❌ Mal: si length es 0, React renderiza "0"
{productos.length && <ProductList productos={productos} />}

// ✅ Bien
{productos.length > 0 ? <ProductList productos={productos} /> : null}
```

### Keys estables en listas

```jsx
{productos.map((p) => (
  <Card key={p.id} producto={p} />  // ✅ id del dato, nunca índice
))}
```

---

## 12. Actualización optimista

```jsx
async function handleDelete(id) {
  const previousData = data;
  setData((prev) => prev.filter((p) => p.id !== id));

  try {
    await deleteProducto(id);
  } catch (error) {
    setData(previousData);
    setError(error.message);
  }
}
```

**Cuándo usarlo:**
- ✅ Agregar/eliminar ítems (el usuario espera feedback inmediato)
- ❌ Operaciones sin confirmación previa
- ❌ Cuando la respuesta del server es indispensable para la acción siguiente

---

## 13. Checklist antes de terminar un componente

- [ ] ¿El fetch vive en `http.js`, no inline en el componente?
- [ ] ¿Maneja los 3 estados: loading / error / data?
- [ ] ¿Los fetches independientes corren en paralelo con `Promise.all`?
- [ ] ¿Ningún componente está definido dentro de otro componente?
- [ ] ¿Las dependencias de `useEffect`/`useCallback` están completas?
- [ ] ¿Las listas usan `key` estable (id, no índice)?
- [ ] ¿Los colores siguen el tema oscuro (`bg-dark-blue`, `text-dark-text`, etc.)?
- [ ] ¿Nombres de archivo en lowercase?
- [ ] ¿Funciones exportadas tienen JSDoc con `@param` y `@returns`?
