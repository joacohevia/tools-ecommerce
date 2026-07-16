---
name: backend-express-best-practices
description: >
  Se activa al modificar o extender el backend Express del proyecto PlacePicker
  (backend/app.js y archivos relacionados). Combina las convenciones propias del
  proyecto (middleware, persistencia en JSON, endpoints, CORS manual) con principios
  generales de Node.js/Express de la comunidad (validación en los bordes, checklist
  de seguridad, manejo de errores async, capas de responsabilidad). Úsala siempre que
  se agregue una ruta, se toque el manejo de archivos, se valide input, o se revise el
  servidor por seguridad o robustez.
---

# Backend Best Practices (PlacePicker — Node.js/Express)

Combina dos fuentes:
1. **Convenciones propias de PlacePicker** — cómo está armado `backend/app.js` hoy
   (persistencia en JSON, CORS manual, endpoints concretos).
2. **Principios generales de Node.js/Express** (basados en skills tipo
   `nodejs-best-practices` y `backend-dev-guidelines`) — validación en los bordes,
   checklist de seguridad, separación de responsabilidades, manejo de errores async.

Regla de prioridad: igual que en la skill de frontend, **las convenciones del proyecto
ganan**. PlacePicker es un backend simple de un solo archivo con persistencia en JSON,
no una arquitectura en capas con Prisma/TypeScript — no forzar esa complejidad. Los
principios generales se aplican como buenas prácticas adicionales, no como reemplazo
de la estructura actual.

> Nota: muchas skills de la comunidad (`backend-dev-guidelines`) asumen TypeScript +
> Prisma + capas `controller/service/repository`. Eso no aplica a este proyecto (JS
> plano + archivos JSON), así que se tomaron solo los principios que sí trasladan bien:
> validación de entrada, manejo de errores, seguridad y decisiones de arquitectura.

---

## 1. Estructura del servidor

### Middleware en orden correcto

```js
app.use(express.static('images'));     // 1. Archivos estáticos
app.use(bodyParser.json());            // 2. Parseo de body
app.use((req, res, next) => {          // 3. CORS inline
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.get('/places', ...);               // 4. Rutas GET
app.get('/users', ...);
app.get('/user-places', ...);
app.put('/user-places', ...);
app.use((req, res) => { ... });        // 5. 404 al final
```

El orden importa: estáticos y parseo de body van primero, las rutas al medio, el
handler 404 siempre al final (si no, nunca se alcanza).

### CORS explícito y manual

No usar librerías externas de CORS. Definirlo a mano para control preciso:

```js
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

**Nota de seguridad (buena práctica general):** `Access-Control-Allow-Origin: '*'`
está bien para desarrollo local, pero antes de producción restringir a los orígenes
reales (ver sección 8, `ALLOWED_ORIGINS`).

---

## 2. Lectura y escritura de archivos

### Usar `node:fs/promises` siempre

```js
import fs from 'node:fs/promises';  // ✅ Promesas nativas, no callbacks
```

### Manejo de archivos inexistentes con ENOENT

```js
try {
  fileContent = await fs.readFile(filename);
} catch (err) {
  if (err.code === 'ENOENT') {
    await fs.writeFile(filename, '[]');
    fileContent = '[]';
  } else {
    throw err;  // Error real, no taparlo
  }
}
```

### Escritura completa (no parcial)

Siempre sobrescribir el archivo completo con `JSON.stringify`. No usar append ni
parches parciales:

```js
await fs.writeFile(filename, JSON.stringify(data));
```

**⚠️ Riesgo a documentar (no bloqueante, pero hay que saberlo):** dos escrituras
concurrentes al mismo archivo pueden pisarse entre sí (race condition), porque no hay
locking. Si en algún momento se nota este problema en producción, es la señal de que
es momento de migrar a una base de datos real (ver sección 6).

---

## 3. Validación de entrada

Principio general: **validar siempre en los bordes** — el punto donde el dato entra al
sistema (query params, body, uploads), antes de tocar el filesystem o cualquier lógica.
Nunca confiar en que un dato ya viene "limpio" solo porque parece interno.

### Validar query params obligatorios

```js
app.get('/user-places', async (req, res) => {
  const user = req.query.user;
  if (!user) {
    return res.status(400).json({ message: 'User parameter is required.' });
  }
  // ... resto del handler
});
```

### Sanitizar nombres de archivo (previene path traversal)

```js
const safeUser = user.replace(/[^a-zA-Z0-9_-]/g, '');
const filename = `./data/${safeUser}-user-places.json`;
```

Esto es crítico: sin sanitizar, un `user` como `../../etc/passwd` podría hacer que
`fs.readFile`/`writeFile` apunte fuera de `data/`. Nunca construir un path a partir de
input crudo del usuario.

### Validar también el body en escrituras (PUT/POST)

Extendiendo la regla anterior a los endpoints de escritura: antes de guardar
`req.body.places` en el archivo, chequear que sea un array (o la forma esperada), no
solo que exista.

```js
app.put('/user-places', async (req, res) => {
  const { user, places } = req.body;
  if (!user || !Array.isArray(places)) {
    return res.status(400).json({ message: 'Invalid payload.' });
  }
  // ... resto del handler
});
```

---

## 4. Endpoints RESTful

### Convenciones

| Acción | Método | Ruta | Request | Response |
|--------|--------|------|---------|----------|
| Listar catálogo | GET | `/places` | — | `{ places: [...] }` |
| Listar usuarios | GET | `/users` | — | `{ users: [...] }` |
| Obtener por usuario | GET | `/user-places?user=X` | — | `{ places: [...] }` |
| Reemplazar | PUT | `/user-places?user=X` | `{ places: [...] }` | `{ message: '...' }` |
| Crear recurso | POST | (futuro) | `{ name: '...' }` | `{ user: '...' }` |
| Eliminar | DELETE | (futuro) | `?user=X&placeId=Y` | `{ message: '...' }` |

### Status codes correctos

- **200**: Éxito (GET, PUT)
- **400**: Parámetros inválidos
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

---

## 5. Manejo de errores

### Middleware 404 (siempre al final)

```js
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  res.status(404).json({ message: '404 - Not Found' });
});
```

### Try/catch en handlers async

```js
app.get('/ruta', async (req, res) => {
  try {
    // lógica
  } catch (error) {
    console.error('Error en /ruta:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
```

**⚠️ Regla general (evitar que el proceso se caiga):** todo handler `async` en Express
necesita su propio try/catch. Si un `await` dentro de un handler async lanza y nadie
la atrapa, en versiones de Express previas a la 5 el error no llega al middleware de
errores y puede colgar el request o tirar abajo el proceso. Como PlacePicker ya envuelve
cada handler en try/catch, esa base es correcta — mantenerla como regla no negociable
al agregar rutas nuevas.

Si el número de rutas crece mucho, considerar un wrapper simple para no repetir el
try/catch en cada una:

```js
const asyncHandler = (fn) => (req, res, next) => fn(req, res, next).catch(next);

app.get('/ruta', asyncHandler(async (req, res) => {
  // lógica, sin try/catch manual — los errores van al middleware de errores
}));
```

Esto es opcional: solo vale la pena si `app.js` empieza a tener muchas rutas
repitiendo el mismo patrón de try/catch.

---

## 6. Persistencia con archivos JSON

### Esquema de archivos

```
backend/data/
  places.json                  ← Catálogo global (solo lectura)
  <username>-user-places.json  ← Preferencias por usuario (lectura/escritura)
```

### Ventajas del esquema actual

- Cada usuario tiene su propio archivo: aislamiento natural.
- Agregar un usuario = crear un archivo nuevo, no hay que modificar código.
- No requiere base de datos externa (ideal para prototipos).
- Backup trivial: copiar la carpeta `data/`.

### Limitaciones a documentar (y cuándo migrar)

- Sin control de concurrencia: dos PUT simultáneos pueden pisarse.
- Sin validación de esquema en escritura más allá de lo que se agregue a mano
  (sección 3).
- No escala a miles de usuarios (demasiados archivos).
- **Señal de que es momento de migrar** a SQLite, PostgreSQL o similar: cuando
  aparezcan escrituras concurrentes reales, o cuando la cantidad de archivos en
  `data/` empiece a ser un problema operativo (backups, listados, etc.).

---

## 7. Framework y arquitectura: por qué Express acá

PlacePicker usa Express de forma directa (un solo `app.js`, sin capas
controller/service/repository). Esto es una decisión correcta para este tamaño de
proyecto — no agregar una arquitectura en capas "porque sí". Como referencia general
de cuándo cambiar de enfoque:

| Necesidad | Cuándo considerar |
|---|---|
| Seguir con Express plano (como ahora) | Proyecto chico/medio, pocas rutas, un solo dev o equipo pequeño |
| Separar en capas (routes → controller → service) | Cuando `app.js` empieza a superar unas ~300-400 líneas o la lógica de negocio se mezcla con el manejo de HTTP en cada ruta |
| Migrar a Fastify | Si el cuello de botella pasa a ser throughput/latencia bajo carga |
| Migrar a base de datos real | Cuando aparezcan problemas de concurrencia (sección 6) |

No es necesario tomar ninguna de estas decisiones ahora — es una guía para saber
quécambiar primero si el proyecto crece, no una checklist a aplicar hoy.

---

## 8. Configuración y entorno

### Puerto configurable

```js
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

### Base URL para CORS en producción

```js
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS?.split(',') || '*';
```

### No hardcodear rutas de archivos

```js
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, 'data');
```

### Variables de entorno, no valores hardcodeados

Regla general reforzada: cualquier valor que cambie entre entornos (puerto, orígenes
CORS permitidos, rutas de datos si se movieran fuera del repo) va a `process.env`, con
un default sensato para desarrollo local. Nunca un secreto (API key, contraseña) queda
en el código fuente, aunque hoy el proyecto no maneje ninguno.

---

## 9. Checklist de seguridad (aplicable aunque el proyecto sea simple)

- [ ] ¿Todo input (query params, body) se valida antes de usarse?
- [ ] ¿Los nombres de archivo derivados de input de usuario están sanitizados
      (sin `..`, `/`, etc.)?
- [ ] ¿CORS está abierto (`*`) solo en desarrollo, y restringido en producción?
- [ ] ¿Cada handler async tiene try/catch (o pasa por un `asyncHandler`)?
- [ ] ¿Los mensajes de error al cliente no filtran detalles internos (stack traces,
      paths del filesystem)?
- [ ] ¿El 404 catch-all está al final de todas las rutas?

---

## 10. Scripts de package.json

```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "node --watch app.js",
    "lint": "eslint app.js"
  }
}
```