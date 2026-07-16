---
name: react-frontend-best-practices
description: >
  Se activa al crear, editar o revisar componentes React del frontend de PlacePicker
  (carpeta src/). Combina las convenciones propias del proyecto (estructura de carpetas,
  patrón contenedor/presentacional, manejo de estado, HTTP layer, portales, naming)
  con las reglas de performance de Vercel Engineering (waterfalls, re-renders, bundle
  size, caching). Úsala siempre que se escriba un componente nuevo, se toque un
  useEffect/useState, se agregue un fetch, o se revise código existente por performance.
---

# React Frontend Best Practices (PlacePicker)

Esta skill combina dos fuentes:
1. **Convenciones propias de PlacePicker** — cómo está organizado el proyecto hoy.
2. **Reglas de performance de Vercel Engineering (`react-best-practices`)** — patrones
   generales de la industria para evitar waterfalls, re-renders innecesarios y bundles
   pesados.

Regla de prioridad: si hay conflicto, **las convenciones del proyecto ganan** (son las
que mantienen consistencia con el resto del código). Las reglas de Vercel aplican como
capa de optimización adicional, no como reemplazo de los patrones ya establecidos.

> Nota: PlacePicker es una SPA con Vite (no Next.js), así que las reglas de Vercel sobre
> Server Components / RSC no aplican directamente. Se incluyen solo las reglas de
> performance que sí son relevantes en un cliente puro: waterfalls, re-renders, bundle
> size y patrones de caching en cliente.

---

## 1. Estructura de carpetas

```
src/
  main.jsx                    # Entry point (solo monta <App/>)
  App.jsx                     # Componente raíz (orquestador)
  index.css                   # Estilos globales, reset, variables
  http.js                     # Capa HTTP: funciones fetch
  loc.js                      # Utilidad: geolocalización / Haversine
  components/                 # Componentes de UI
    Places.jsx
    Modal.jsx
    Error.jsx
    AvailablePlaces.jsx
    DeleteConfirmation.jsx
    ProgressBar.jsx
    UseComboSelectComponent.jsx
  assets/                     # Imágenes, fuentes, etc.
```

**Reglas:**
- `components/` solo contiene JSX, nunca lógica de negocio pura.
- Helpers puros (matemática, formato) van en archivos separados (`loc.js`).
- Toda llamada HTTP vive en `http.js` — nunca `fetch` directo dentro de un componente.
- Assets estáticos en `assets/`.

---

## 2. Tipos de componentes: presentacional vs contenedor

**Presentacional** — recibe props, renderiza, sin estado de negocio:

```jsx
export default function Places({ title, places, fallbackText, onSelectPlace, isLoading, loadingText }) {
  return (
    <section className="places-category">
      <h2>{title}</h2>
      {isLoading && <p>{loadingText}</p>}
      {!isLoading && places.length === 0 && <p>{fallbackText}</p>}
      {!isLoading && places.length > 0 && (
        <ul className="places">
          {places.map((place) => (
            <li key={place.id} className="place-item">
              <button onClick={() => onSelectPlace(place)}>
                <img src={`http://localhost:3000/${place.image.src}`} alt={place.image.alt} />
                <h3>{place.title}</h3>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

**Contenedor** — maneja estado, efectos, y delega el render a un presentacional:

```jsx
export default function AvailablePlaces({ onSelectPlace }) {
  const [isFetching, setIsFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState();
  // ... useEffect con fetch y geolocalización
  // ... renderiza <Places ... /> con los datos
}
```

Flujo: `App` (contenedor) → `Places` (presentacional) · `AvailablePlaces` (contenedor) → `Places` (mismo presentacional, reutilizado).

**⚠️ Regla de performance (Vercel — anti-patrón crítico):** nunca definir un componente
dentro de otro componente (ni presentacional ni contenedor). Cada render del padre
recrearía el componente hijo desde cero, perdiendo su estado y forzando un remount
completo. Los componentes van siempre a nivel de módulo.

```jsx
// ❌ Mal: se redefine en cada render de AvailablePlaces
function AvailablePlaces() {
  function PlaceCard() { /* ... */ }
}

// ✅ Bien: definido a nivel de módulo, fuera del padre
function PlaceCard() { /* ... */ }
function AvailablePlaces() { /* usa <PlaceCard /> */ }
```

---

## 3. Manejo de estado

- Estado global de la app en `App.jsx` (o Context si crece).
- Estado local de UI (loading, error) vive en el componente que lo necesita.
- Nunca duplicar estado: si un valor se puede derivar de otro, no se guarda aparte.

### Los 3 estados que casi todo componente con datos debe manejar

```jsx
function MiComponente() {
  const [data, setData] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  if (isFetching) return <LoadingSkeleton />;
  if (error) return <Error message={error.message} />;
  return <DataView data={data} />;
}
```

**⚠️ Regla de performance (Vercel):** al inicializar estado con un cálculo costoso,
pasar una función a `useState` en vez de invocar el cálculo en cada render:

```jsx
// ❌ Mal: parseExpensiveData() corre en CADA render, aunque el resultado se descarte
const [data, setData] = useState(parseExpensiveData(raw));

// ✅ Bien: la función solo se ejecuta una vez, en el montaje
const [data, setData] = useState(() => parseExpensiveData(raw));
```

**⚠️ Regla de performance:** para actualizaciones que dependen del valor anterior,
usar la forma funcional de `setState` — evita closures obsoletos y permite callbacks
estables con `useCallback`:

```jsx
// ✅ No depende de "places" en el closure, siempre usa el valor más reciente
setAvailablePlaces((prev) => [newPlace, ...prev]);
```

### useRef para valores sin re-render

```jsx
const selectedPlace = useRef();
// Se escribe: selectedPlace.current = place
// Se lee:     selectedPlace.current.id
```

**⚠️ Regla de performance:** si un valor cambia con mucha frecuencia (posición de
scroll, coordenadas de mouse, contador de intervalo) y no necesita disparar un
re-render, usar `useRef` en vez de `useState` para guardarlo.

### useCallback para callbacks estables

```jsx
const handleRemovePlace = useCallback(async () => {
  // lógica de eliminación
}, [userPlaces]);
```

**⚠️ Regla de performance:** no envolver en `useCallback`/`useMemo` cálculos triviales
(sumas simples, concatenación de strings cortos) — el overhead de comparar
dependencias supera el ahorro. Reservarlo para callbacks pasados a hijos memoizados
o usados dentro de un `useEffect`.

---

## 4. Efectos secundarios (useEffect)

### Fetch con useEffect

```jsx
useEffect(() => {
  async function fetchData() {
    setIsFetching(true);
    try {
      const result = await apiFunction(params);
      setData(result);
    } catch (error) {
      setError({ message: error.message });
    }
    setIsFetching(false);
  }
  fetchData();
}, [params]);
```

**⚠️ Regla de performance — waterfalls (la de mayor impacto según Vercel):** si un
componente necesita datos de dos fuentes independientes (por ejemplo lugares +
ubicación del usuario), no las esperes en secuencia. Lanzá ambas promesas primero y
esperá juntas:

```jsx
// ❌ Mal: espera el fetch, y RECIÉN DESPUÉS pide la geolocalización (waterfall)
const places = await fetchPlaces();
const position = await getPosition();

// ✅ Bien: ambas arrancan en paralelo, se resuelven cuando la más lenta termine
const [places, position] = await Promise.all([fetchPlaces(), getPosition()]);
```

Esto aplica directamente a `AvailablePlaces.jsx`, que hoy combina fetch + geolocalización.

### Cleanup en efectos con timers

```jsx
useEffect(() => {
  const timer = setTimeout(() => onConfirm(), TIMER);
  return () => clearTimeout(timer); // cancela el timer si el componente se desmonta
}, [onConfirm]);
```

### Dependencias correctas

- Incluir TODAS las variables usadas dentro del efecto en el array de dependencias.
- Si una dependencia cambia demasiado seguido, estabilizarla con `useCallback` en vez
  de mentir en el array (nunca poner `[]` si hay variables externas usadas adentro).

**⚠️ Regla de performance:** cuando la lógica del efecto en realidad responde a una
interacción del usuario (click, submit) y no a un cambio de estado que requiera
sincronización, mover esa lógica al event handler directamente en vez de a un
`useEffect` — evita una vuelta extra de render.

---

## 5. Bundle size y carga diferida

**⚠️ Regla de performance (Vercel):** librerías de íconos/utilidades grandes
(`react-icons`, `lodash`, `date-fns`, etc.) deben importarse con paths directos, no
como barrel import, para evitar que Vite/webpack incluya toda la librería en el bundle:

```jsx
// ❌ Mal: puede arrastrar toda la librería de íconos al bundle
import { FaMapMarker } from "react-icons/fa";

// ✅ Mejor cuando el bundler no hace tree-shaking automático del paquete
import FaMapMarker from "react-icons/fa/FaMapMarker";
```

Para features opcionales o pesadas (ej. un mapa interactivo, un editor de imágenes),
considerar `React.lazy()` + `Suspense` en vez de incluirlas en el bundle inicial.

---

## 6. Flujo de datos y actualización optimista

```jsx
async function handleUpdate(newData) {
  const previousData = data;

  // 1. Actualizar estado local INMEDIATAMENTE
  setData((prev) => [newData, ...prev]);

  try {
    // 2. Persistir en backend
    await apiUpdate(currentUser, newData);
  } catch (error) {
    // 3. Revertir si falla
    setData(previousData);
    setErrorUpdating({ message: error.message });
  }
}
```

**Cuándo usarlo:**
- ✅ Operaciones donde el usuario espera feedback inmediato (agregar, eliminar).
- ❌ Operaciones destructivas sin confirmación (usar modal antes).
- ❌ Cuando la respuesta del server es indispensable para la siguiente acción.

---

## 7. HTTP layer (`http.js`)

```jsx
export async function fetchUsers() {
  const response = await fetch('http://localhost:3000/users');
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return resData.users;
}
```

**Reglas:**
- Todas las funciones HTTP en un solo archivo `http.js`.
- Cada función lanza `Error` si la respuesta no es ok.
- No mezclar lógica de UI con llamadas HTTP.
- URLs centralizadas en constantes o variables de entorno.

**⚠️ Regla de performance:** si varios componentes piden los mismos datos (por ejemplo
la lista de usuarios), evaluar deduplicación de requests (patrón tipo SWR/React Query)
en vez de repetir el fetch en cada componente que lo necesita.

---

## 8. Portales para modales

```jsx
import { createPortal } from 'react-dom';

function Modal({ open, children, onClose }) {
  const dialog = useRef();

  useEffect(() => {
    if (open) dialog.current.showModal();
    else dialog.current.close();
  }, [open]);

  return createPortal(
    <dialog className="modal" ref={dialog} onClose={onClose}>
      {open ? children : null}
    </dialog>,
    document.getElementById('modal')
  );
}
```

**Ventajas:** el modal no hereda estilos indeseados del padre, el z-index/posicionamiento
son independientes, y `<dialog>` nativo mejora la accesibilidad (foco, Escape).

---

## 9. Props y eventos

**Naming:**
- Eventos: `on` + acción → `onSelectPlace`, `onConfirm`, `onCancel`, `onClose`.
- Handlers: `handle` + acción → `handleSelectPlace`, `handleRemovePlace`.
- Callbacks desde hijos: nombres verbosos pero claros
  (`onComboBoxChangeUserUpdateFunction`).

**Props típicas en componentes reutilizables:**

```jsx
<Places
  title={string}
  places={array}
  fallbackText={string}
  isLoading={boolean}
  loadingText={string}
  onSelectPlace={function}
/>
```

**Siempre `key` única y estable en listas** (el id del dato, nunca el índice):

```jsx
{places.map((place) => (
  <li key={place.id}>...</li>  // ✅
))}
```

**⚠️ Regla de performance:** para renderizado condicional, preferir el operador
ternario (`? :`) sobre `&&` cuando la condición puede ser `0`, `NaN` u otro falsy que
React renderice literalmente:

```jsx
// ❌ Si places.length es 0, React renderiza el número "0" en pantalla
{places.length && <PlacesList places={places} />}

// ✅ Bien
{places.length > 0 ? <PlacesList places={places} /> : null}
```

---

## 10. Componentes específicos del proyecto

- **`Modal.jsx`** — `<dialog>` nativo + `createPortal`. Controlado por `open`
  (true = `showModal()`, false = `close()`). Recibe `onClose` (Escape, click fuera).
- **`DeleteConfirmation.jsx`** — auto-confirmación con timer de 3s, muestra
  `ProgressBar` como feedback, botones "Yes"/"No", limpia el timer al desmontar.
- **`ProgressBar.jsx`** — `<progress>` nativo, decrementa cada 10ms desde `TIMER` a 0,
  sin side effects fuera del intervalo.
- **`Error.jsx`** — props `title`, `message`, `onConfirm` (opcional, muestra botón
  "Okay" si existe). Reutilizable en modales o inline.
- **`UserComboSelectComponent.jsx`** — fetch de usuarios al montar, maneja los 4
  estados (carga/error/vacío/con datos), `<select>` con opción por usuario, dispara
  callback en `onChange`.

---

## 11. CSS y estilos

- Clases modulares con nombres descriptivos: `places-category`, `place-item`,
  `fallback-text`.
- Animaciones con `@keyframes` en CSS global (`slide-up-fade-in`, `slide-down-fade-in`).
- Variables de color en `:root` o directamente en selectores.
- `box-sizing: border-box` global.
- Responsive con `grid-template-columns: repeat(auto-fill, minmax(...))`.

---

## 12. Checklist rápido antes de dar por terminado un componente

- [ ] ¿Es presentacional o contenedor? ¿Está en la carpeta correcta?
- [ ] ¿Maneja los 3 estados (loading / error / data) si hace fetch?
- [ ] ¿Los fetches independientes corren en paralelo (`Promise.all`), no en cadena?
- [ ] ¿Ningún componente está definido dentro de otro componente?
- [ ] ¿Las dependencias de `useEffect`/`useCallback` están completas y no mentidas?
- [ ] ¿Las listas usan `key` estable (id, no índice)?
- [ ] ¿El fetch vive en `http.js`, no inline en el componente?
- [ ] ¿Los modales usan `createPortal` + `<dialog>`?
- [ ] ¿Naming de props/handlers sigue `on`/`handle`?