/**
 * MCP server: supabase-read
 *
 * Wrapper read-only del proyecto Supabase. Expone 3 tools que solo permiten
 * operaciones de lectura sobre las tablas públicas.
 *
 * Credenciales: carga VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY del .env raíz.
 * Las consultas usan @supabase/supabase-js, que solo construye SELECTs.
 *
 * Tools expuestas:
 *   1. supabase_list_tables   → devuelve las 6 tablas con columnas y FKs
 *   2. supabase_get_columns   → columnas de una tabla específica
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
// Esquema hardcodeado de las tablas públicas (Opción B)
// Sincronizar con baseHerramientas.sql si cambia la estructura.
// ──────────────────────────────────────────────────────────────

/**
 * @typedef {{ name: string, type: string, nullable: boolean, default: string|null, fk_table?: string, fk_column?: string }} ColumnDef
 * @typedef {{ columns: ColumnDef[], estimated_rows: number, primary_key: string }} TableDef
 */

/** @type {Record<string, TableDef>} */
const SCHEMA = {
  categorias: {
    columns: [
      { name: "id", type: "bigint", nullable: false, default: "nextval('categorias_id_seq')" },
      { name: "nombre", type: "text", nullable: false, default: null },
      { name: "slug", type: "text", nullable: false, default: null },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
    estimated_rows: 11,
    primary_key: "id",
  },
  marcas: {
    columns: [
      { name: "id", type: "bigint", nullable: false, default: "nextval('marcas_id_seq')" },
      { name: "nombre", type: "text", nullable: false, default: null },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
    estimated_rows: 11,
    primary_key: "id",
  },
  productos: {
    columns: [
      { name: "id", type: "bigint", nullable: false, default: "nextval('productos_id_seq')" },
      { name: "nombre", type: "text", nullable: false, default: null },
      { name: "descripcion", type: "text", nullable: true, default: null },
      { name: "slug", type: "text", nullable: false, default: null },
      { name: "precio", type: "numeric", nullable: false, default: null },
      { name: "precio_oferta", type: "numeric", nullable: true, default: null },
      { name: "stock", type: "integer", nullable: true, default: "0" },
      { name: "categoria_id", type: "bigint", nullable: false, default: null, fk_table: "categorias", fk_column: "id" },
      { name: "marca_id", type: "bigint", nullable: false, default: null, fk_table: "marcas", fk_column: "id" },
      { name: "destacado", type: "boolean", nullable: true, default: "false" },
      { name: "mas_vendido", type: "boolean", nullable: true, default: "false" },
      { name: "imagenes", type: "text[]", nullable: true, default: "'{}'::text[]" },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
    estimated_rows: 10,
    primary_key: "id",
  },
  perfiles: {
    columns: [
      { name: "id", type: "bigint", nullable: false, default: "nextval('perfiles_id_seq')" },
      { name: "user_id", type: "uuid", nullable: false, default: null, fk_table: "auth.users", fk_column: "id" },
      { name: "nombre", type: "text", nullable: false, default: null },
      { name: "apellido", type: "text", nullable: false, default: null },
      { name: "dni", type: "text", nullable: true, default: null },
      { name: "rol", type: "text", nullable: false, default: "'cliente'::text" },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
    estimated_rows: 1,
    primary_key: "id",
  },
  pedidos: {
    columns: [
      { name: "id", type: "bigint", nullable: false, default: "nextval('pedidos_id_seq')" },
      { name: "perfil_id", type: "bigint", nullable: false, default: null, fk_table: "perfiles", fk_column: "id" },
      { name: "estado", type: "text", nullable: false, default: "'pendiente'::text" },
      { name: "total", type: "numeric", nullable: false, default: "0" },
      { name: "nota", type: "text", nullable: true, default: null },
      { name: "created_at", type: "timestamptz", nullable: true, default: "now()" },
    ],
    estimated_rows: 0,
    primary_key: "id",
  },
  pedido_items: {
    columns: [
      { name: "id", type: "bigint", nullable: false, default: "nextval('pedido_items_id_seq')" },
      { name: "pedido_id", type: "bigint", nullable: false, default: null, fk_table: "pedidos", fk_column: "id" },
      { name: "producto_id", type: "bigint", nullable: false, default: null, fk_table: "productos", fk_column: "id" },
      { name: "cantidad", type: "integer", nullable: false, default: null },
      { name: "precio_unitario", type: "numeric", nullable: false, default: null },
      { name: "subtotal", type: "numeric", nullable: true, default: "((cantidad)::numeric * precio_unitario)" },
    ],
    estimated_rows: 0,
    primary_key: "id",
  },
};

// ──────────────────────────────────────────────────────────────
// Handlers de las tools
// ──────────────────────────────────────────────────────────────

/**
 * @returns {Array<{ table_name: string, estimated_rows: number, column_count: number }>}
 */
function handleListTables() {
  return Object.entries(SCHEMA).map(([name, def]) => ({
    table_name: name,
    estimated_rows: def.estimated_rows,
    column_count: def.columns.length,
    primary_key: def.primary_key,
  }));
}

/**
 * Devuelve las columnas de una tabla específica, incluyendo claves foráneas.
 *
 * @param {{ table: string }} args
 * @returns {{ columns: ColumnDef[], table_name: string, primary_key: string }}
 */
function handleGetColumns({ table }) {
  const def = SCHEMA[table];
  if (!def) {
    throw new Error(
      `Tabla "${table}" no encontrada. Tablas disponibles: ${Object.keys(SCHEMA).join(", ")}`
    );
  }
  return {
    table_name: table,
    primary_key: def.primary_key,
    estimated_rows: def.estimated_rows,
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
  const def = SCHEMA[table];
  if (!def) {
    throw new Error(
      `Tabla "${table}" no encontrada. Tablas disponibles: ${Object.keys(SCHEMA).join(", ")}`
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
        "Lista todas las tablas del esquema público (categorias, marcas, productos, perfiles, pedidos, pedido_items) con cantidad estimada de filas y columnas.",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "supabase_get_columns",
      description:
        "Devuelve la definición de columnas de una tabla específica: nombre, tipo, si es nullable, valor por defecto y claves foráneas.",
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
        "Ejecuta una consulta SELECT parametrizada sobre una tabla usando el builder seguro de supabase-js. Solo lectura, sin SQL raw. Soportá filtros con operadores (eq, neq, gt, gte, lt, lte, like, ilike, is, in), orden y límite. Para joins usar el parámetro select: '*,categorias(nombre),marcas(nombre)'.",
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
        result = handleListTables();
        break;

      case "supabase_get_columns":
        result = handleGetColumns(args);
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
  console.error("supabase-read MCP server iniciado vía stdio");
}

main().catch((err) => {
  console.error("Error fatal al iniciar el MCP server:", err);
  process.exit(1);
});
