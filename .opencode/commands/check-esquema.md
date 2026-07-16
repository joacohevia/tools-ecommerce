Consultá la base de datos mediante el MCP de Supabase y verificá el estado actual del esquema.

Generá un reporte que incluya:

1. Todas las tablas del esquema `public`.
2. La cantidad de registros de cada tabla.
3. La estructura de cada tabla (columnas y tipos de datos).
4. Las claves primarias y foráneas.
5. Si existen tablas relacionadas con autenticación (`auth.users`, perfiles, etc.), indicá únicamente su estructura y la cantidad de registros, sin mostrar información sensible.
6. Guardá el resultado en un archivo llamado `reporte-esquema.json`.

No modifiques ningún dato; únicamente realizá consultas de lectura.