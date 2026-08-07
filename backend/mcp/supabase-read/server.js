/**
 * MCP server: supabase-read
 *
 * Wrapper read-only del proyecto Supabase. Expone 3 tools que solo permiten
 * operaciones de lectura sobre las tablas públicas.
 *
 * Credenciales: carga VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY del .env raíz.
 * Consulta la estructura de tablas dinámicamente desde la API OpenAPI de Supabase/PostgREST.
 *
 * Tools expuestas:
 *   1. supabase_list_tables   → devuelve las tablas públicas con cantidad de columnas y PK
 *   2. supabase_get_columns   → columnas de una tabla específica con tipos, nullability, defaults y FKs
 *   3. supabase_select        → SELECT parametrizado con filtros, orden y límite
 *
 * Protocolo: MCP sobre stdio (JSON-RPC), usando @modelcontextprotocol/sdk.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ──────────────────────────────────────────────────────────────
// Credenciales desde .env (mismo patrón que backend/server.js)
// ──────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el .env");
  process.exit(1);
}

/** Cliente Supabase con anon key — solo puede hacer operaciones públicas (SELECTs en tablas con RLS). */
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ──────────────────────────────────────────────────────────────
// Introspección dinámica del esquema desde PostgREST OpenAPI spec
// ──────────────────────────────────────────────────────────────

let schemaCache = null;
let schemaCacheTime = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 segundos

/**
 * @typedef {{ name: string, type: string, nullable: boolean, default: any, fk_table?: string, fk_column?: string }} ColumnDef
 * @typedef {{ table_name: string, primary_key: string, columns: ColumnDef[] }} TableDef
 */

/**
 * Consulta la especificación OpenAPI de PostgREST en Supabase y construye
 * dinámicamente la definición de tablas, columnas, tipos, PKs y FKs.
 *
 * @returns {Promise<Record<string, TableDef>>}
 */
async function getDynamicSchema() {
  const now = Date.now();
  if (schemaCache && now - schemaCacheTime < CACHE_TTL_MS) {
    return schemaCache;
  }

  const url = `${SUPABASE_URL}/rest/v1/`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Error al obtener el esquema dinámico de Supabase: ${res.statusText}`
    );
  }

  const data = await res.json();
  const definitions = data.definitions || {};

  const schema = {};

  for (const [tableName, def] of Object.entries(definitions)) {
    const requiredCols = def.required || [];
    const props = def.properties || {};
    let primaryKey = "id";

    const columns = Object.entries(props).map(([colName, colDef]) => {
      const desc = colDef.description || "";

      if (desc.includes("<pk/>")) {
        primaryKey = colName;
      }

      const fkMatch = desc.match(/fk table='([^']+)' column='([^']+)'/);
      const fk_table = fkMatch ? fkMatch[1] : undefined;
      const fk_column = fkMatch ? fkMatch[2] : undefined;

      let type = colDef.format || colDef.type || "text";
      if (colDef.type === "array") {
        type = `${colDef.items?.type || "text"}[]`;
      }

      return {
        name: colName,
        type,
        nullable: !requiredCols.includes(colName),
        default: colDef.default ?? null,
        ...(fk_table ? { fk_table, fk_column } : {}),
      };
    });

    schema[tableName] = {
      table_name: tableName,
      primary_key: primaryKey,
      columns,
    };
  }

  schemaCache = schema;
  schemaCacheTime = now;
  return schema;
}

// ──────────────────────────────────────────────────────────────
// Handlers de las tools
// ──────────────────────────────────────────────────────────────

/**
 * @returns {Promise<Array<{ table_name: string, column_count: number, primary_key: string }>>}
 */
async function handleListTables() {
  const schema = await getDynamicSchema();
  return Object.entries(schema).map(([name, def]) => ({
    table_name: name,
    column_count: def.columns.length,
    primary_key: def.primary_key,
  }));
}

/**
 * Devuelve las columnas de una tabla específica, incluyendo claves foráneas.
 *
 * @param {{ table: string }} args
 * @returns {Promise<{ columns: ColumnDef[], table_name: string, primary_key: string }>}
 */
async function handleGetColumns({ table }) {
  const schema = await getDynamicSchema();
  const def = schema[table];
  if (!def) {
    throw new Error(
      `Tabla "${table}" no encontrada. Tablas disponibles: ${Object.keys(schema).join(", ")}`
    );
  }
  return {
    table_name: table,
    primary_key: def.primary_key,
    columns: def.columns,
  };
}

/**
 * Ejecuta una SELECT parametrizada usando supabase-js.
 *
 * La query se construye encadenando métodos del builder de supabase-js,
 * lo que garantiza que solo se generen SELECTs. No se ejecuta SQL raw.
 *
 * @param {{
 *   table: string,
 *   select?: string,
 *   filters?: Array<{ column: string, op: string, value: any }>,
 *   limit?: number,
 *   order_column?: string,
 *   order_asc?: boolean,
 * }} args
 * @returns {Promise<Array<Object>>}
 */
async function handleSelect({ table, select = "*", filters = [], limit = 100, order_column, order_asc = true }) {
  const schema = await getDynamicSchema();
  const def = schema[table];
  if (!def) {
    throw new Error(
      `Tabla "${table}" no encontrada. Tablas disponibles: ${Object.keys(schema).join(", ")}`
    );
  }

  const MAX_LIMIT = 1000;
  const safeLimit = Math.min(Math.max(1, limit ?? 100), MAX_LIMIT);

  /** Mapea el operador al método correspondiente del builder de supabase-js. */
  const VALID_OPS = ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is", "in"];

  let query = supabase.from(table).select(select);

  for (const f of (filters ?? [])) {
    if (!f.column || !f.op || f.value === undefined) {
      throw new Error(`Filtro inválido: se requiere column, op y value. Recibido: ${JSON.stringify(f)}`);
    }
    if (!VALID_OPS.includes(f.op)) {
      throw new Error(`Operador "${f.op}" no soportado. Válidos: ${VALID_OPS.join(", ")}`);
    }
    query = query[f.op](f.column, f.value);
  }

  if (order_column) {
    query = query.order(order_column, { ascending: order_asc });
  }

  query = query.limit(safeLimit);

  const { data, error } = await query;
  if (error) throw new Error(`Error de Supabase: ${error.message} (código: ${error.code})`);

  return data;
}

// ──────────────────────────────────────────────────────────────
// Servidor MCP
// ──────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: "supabase-read",
    version: "1.0.0",
  },
  {
    capabilities: { tools: {} },
  }
);

/**
 * GET /tools/list
 * Registra las 3 tools disponibles con sus input schemas.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "supabase_list_tables",
      description:
        "Lista todas las tablas públicas de la base de datos Supabase con la cantidad de columnas y su clave primaria.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "supabase_get_columns",
      description:
        "Devuelve la definición dinámica de columnas de una tabla específica: nombre, tipo, si es nullable, valor por defecto y claves foráneas.",
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "Nombre de la tabla (ej: 'productos', 'categorias', 'pedidos').",
          },
        },
        required: ["table"],
      },
    },
    {
      name: "supabase_select",
      description:
        "Ejecuta una consulta SELECT parametrizada sobre una tabla usando el builder seguro de supabase-js. Solo lectura, sin SQL raw. Soporta filtros con operadores (eq, neq, gt, gte, lt, lte, like, ilike, is, in), orden y límite. Para joins usar el parámetro select: '*,categorias(nombre),marcas(nombre)'.",
      inputSchema: {
        type: "object",
        properties: {
          table: {
            type: "string",
            description: "Nombre de la tabla a consultar (ej: 'productos', 'pedidos').",
          },
          select: {
            type: "string",
            description:
              "Columnas a seleccionar. Default '*'. Para joins anidados usar '*,categorias(nombre),marcas(nombre)'.",
          },
          filters: {
            type: "array",
            description: "Lista de filtros a aplicar secuencialmente.",
            items: {
              type: "object",
              properties: {
                column: { type: "string", description: "Nombre de la columna a filtrar." },
                op: {
                  type: "string",
                  enum: ["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is", "in"],
                  description: "Operador de comparación.",
                },
                value: { description: "Valor contra el que comparar. Para 'in' usar array." },
              },
              required: ["column", "op", "value"],
            },
          },
          limit: {
            type: "integer",
            description: "Máximo de filas a devolver (default 100, max 1000).",
          },
          order_column: {
            type: "string",
            description: "Columna por la cual ordenar los resultados.",
          },
          order_asc: {
            type: "boolean",
            description: "true = ascendente, false = descendente (default true).",
          },
        },
        required: ["table"],
      },
    },
  ],
}));

/**
 * POST /tools/call
 * Despacha la tool solicitada y devuelve el resultado como texto JSON.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "supabase_list_tables":
        result = await handleListTables();
        break;

      case "supabase_get_columns":
        result = await handleGetColumns(args);
        break;

      case "supabase_select":
        result = await handleSelect(args);
        break;

      default:
        throw new Error(`Tool desconocida: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: err.message }],
      isError: true,
    };
  }
});

// ──────────────────────────────────────────────────────────────
// Arranque: conecta vía stdio y queda escuchando.
// ──────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log a stderr para no interferir con el protocolo stdio (stdout es JSON-RPC).
  console.error("supabase-read MCP server iniciado vía stdio (esquema dinámico)");
}

main().catch((err) => {
  console.error("Error fatal al iniciar el MCP server:", err);
  process.exit(1);
});
