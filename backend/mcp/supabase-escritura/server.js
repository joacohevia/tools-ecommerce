/**
 * MCP server: supabase-escritura
 *
 * Servidor de escritura para el proyecto Supabase. Expone 1 tool que permite
 * insertar productos de forma masiva, resolviendo/creando automáticamente
 * marcas y categorías.
 *
 * Credenciales: carga SUPABASE_SERVICE_ROLE_KEY del .env raíz.
 * Esta key tiene permisos de escritura total (bypass RLS).
 *
 * Tools expuestas:
 *   1. supabase_insert_productos → INSERT masivo de productos con resolución automática
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
// Credenciales desde .env
// ──────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "..", "..", "..", ".env") });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el .env");
  process.exit(1);
}

/** Cliente Supabase con service role key — permisos totales (bypass RLS). */
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ──────────────────────────────────────────────────────────────
// Helpers: limpieza de precios
// ──────────────────────────────────────────────────────────────

/**
 * Convierte un valor de precio (number o string con formato argentino) a número.
 * Ej: "$125.000,00" → 125000, "ARS 98.000" → 98000, 45000 → 45000
 *
 * @param {number|string} valor
 * @returns {number} El precio como número, o NaN si no se puede convertir.
 */
function limpiarPrecio(valor) {
  if (typeof valor === "number") return valor;
  if (typeof valor !== "string") return NaN;
  let limpio = valor
    .replace(/\$/g, "")
    .replace(/ARS/gi, "")
    .replace(/USD/gi, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .trim();
  const num = parseFloat(limpio);
  return isNaN(num) ? NaN : num;
}

// ──────────────────────────────────────────────────────────────
// Helpers: generación de slug
// ──────────────────────────────────────────────────────────────

/** Mapa de caracteres españoles para normalizar slugs. */
const CHAR_MAP = {
  á: "a", é: "e", í: "i", ó: "o", ú: "u",
  à: "a", è: "e", ì: "i", ò: "o", ù: "u",
  ä: "a", ë: "e", ï: "i", ö: "o", ü: "u",
  â: "a", ê: "e", î: "i", ô: "o", û: "u",
  ñ: "n", ç: "c",
};

/**
 * Convierte un texto en un slug URL-friendly.
 * Normaliza acentos y eñes, convierte a minúsculas, reemplaza no-alfanuméricos por guiones.
 *
 * @param {string} texto
 * @returns {string} Slug generado.
 */
function slugificar(texto) {
  if (!texto) return "";
  let slug = texto.toLowerCase().trim();
  slug = slug.replace(/[áàäâéèëêíìïîóòöôúùüûñç]/g, (c) => CHAR_MAP[c] || c);
  slug = slug.replace(/[^a-z0-9]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  return slug || "producto";
}

/**
 * Genera un slug único para un producto, verificando que no exista ya en la DB.
 * Si el slug base ya existe, agrega sufijo incremental (-2, -3, ...).
 *
 * @param {string} nombre - Nombre del producto.
 * @returns {Promise<string>} Slug único.
 */
async function generarSlugUnico(nombre) {
  const base = slugificar(nombre);
  let slug = base;
  let intentos = 0;
  while (intentos < 100) {
    const { data, error } = await supabase
      .from("productos")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Error al verificar slug: ${error.message}`);
    if (!data) return slug;
    intentos++;
    slug = `${base}-${intentos + 1}`;
  }
  throw new Error(`No se pudo generar un slug único para "${nombre}" después de 100 intentos`);
}

// ──────────────────────────────────────────────────────────────
// Helpers: resolver/crear marca y categoría
// ──────────────────────────────────────────────────────────────

/** Contador para IDs placeholder en modo dry_run. */
let dryRunIdCounter = -1;

/**
 * Busca una marca por nombre (case-insensitive). Si no existe y dry_run es false, la crea.
 * En modo dry_run no escribe en la DB; devuelve un ID placeholder negativo.
 *
 * @param {string} nombre - Nombre de la marca.
 * @param {boolean} dry_run - Si true, solo busca sin crear.
 * @returns {Promise<{ id: number, creada: boolean }>}
 */
async function resolverOMarcar(nombre, dry_run = false) {
  const { data: existente, error } = await supabase
    .from("marcas")
    .select("id")
    .ilike("nombre", nombre)
    .maybeSingle();
  if (error) throw new Error(`Error al buscar marca "${nombre}": ${error.message}`);
  if (existente) return { id: existente.id, creada: false };

  if (dry_run) return { id: dryRunIdCounter--, creada: true };

  const { data: nueva, error: insertError } = await supabase
    .from("marcas")
    .insert({ nombre })
    .select()
    .single();
  if (insertError) throw new Error(`Error al crear marca "${nombre}": ${insertError.message}`);
  return { id: nueva.id, creada: true };
}

/**
 * Busca una categoría por nombre (case-insensitive). Si no existe y dry_run es false, la crea
 * generando un slug automático a partir del nombre.
 * En modo dry_run no escribe en la DB; devuelve un ID placeholder negativo y slug generado.
 *
 * @param {string} nombre - Nombre de la categoría.
 * @param {boolean} dry_run - Si true, solo busca sin crear.
 * @returns {Promise<{ id: number, slug: string, creada: boolean }>}
 */
async function resolverOCategoria(nombre, dry_run = false) {
  const { data: existente, error } = await supabase
    .from("categorias")
    .select("id, slug")
    .ilike("nombre", nombre)
    .maybeSingle();
  if (error) throw new Error(`Error al buscar categoría "${nombre}": ${error.message}`);
  if (existente) return { id: existente.id, slug: existente.slug, creada: false };

  const categoriaSlug = slugificar(nombre);

  if (dry_run) return { id: dryRunIdCounter--, slug: categoriaSlug, creada: true };

  const { data: nueva, error: insertError } = await supabase
    .from("categorias")
    .insert({ nombre, slug: categoriaSlug })
    .select()
    .single();
  if (insertError) throw new Error(`Error al crear categoría "${nombre}": ${insertError.message}`);
  return { id: nueva.id, slug: nueva.slug, creada: true };
}

// ──────────────────────────────────────────────────────────────
// Handler: supabase_insert_productos
// ──────────────────────────────────────────────────────────────

/**
 * Inserta uno o varios productos en la base de datos.
 *
 * Pipeline:
 *   1. Limpiar precios (formato argentino → número).
 *   2. Validar todo el lote (sin tocar la DB).
 *   3. Resolver/crear marcas y categorías por nombre (ILIKE).
 *   4. Generar slugs únicos.
 *   5. Si dry_run, devolver preview. Si no, insertar.
 *
 * @param {{ productos: Array, dry_run?: boolean }} args
 * @returns {Promise<Object>} Resultado de la operación.
 */
async function handleInsertProductos({ productos, dry_run = false }) {
  if (!productos || !Array.isArray(productos) || productos.length === 0) {
    throw new Error("Se requiere un array no vacío de productos");
  }

  // ── FASE 1: Limpieza y normalización ──
  const normalizados = productos.map((p, i) => {
    const precio = limpiarPrecio(p.precio);
    const precio_oferta = p.precio_oferta !== undefined && p.precio_oferta !== null
      ? limpiarPrecio(p.precio_oferta)
      : null;
    return {
      nombre: (p.nombre || "").trim(),
      descripcion: p.descripcion?.trim() || null,
      precio,
      precio_oferta,
      stock: p.stock !== undefined ? Math.max(0, parseInt(p.stock) || 0) : 0,
      marca: (p.marca || "").trim(),
      categoria: (p.categoria || "").trim(),
      destacado: p.destacado === true,
      mas_vendido: p.mas_vendido === true,
      imagenes: Array.isArray(p.imagenes) ? p.imagenes : [],
      index: i,
    };
  });

  // ── FASE 2: Validación de todo el lote ──
  const errores = [];
  for (const p of normalizados) {
    const label = `Producto #${p.index + 1}${p.nombre ? ` "${p.nombre}"` : ""}`;
    if (!p.nombre) errores.push(`${label}: nombre es requerido`);
    if (isNaN(p.precio) || p.precio <= 0) errores.push(`${label}: precio debe ser un número positivo`);
    if (!p.marca) errores.push(`${label}: marca es requerida`);
    if (!p.categoria) errores.push(`${label}: categoria es requerida`);
    if (p.precio_oferta !== null && (isNaN(p.precio_oferta) || p.precio_oferta < 0)) {
      errores.push(`${label}: precio_oferta inválido`);
    }
    if (p.precio_oferta !== null && p.precio_oferta > p.precio) {
      errores.push(`${label}: precio_oferta (${p.precio_oferta}) no puede ser mayor al precio (${p.precio})`);
    }
  }

  if (errores.length > 0) {
    return {
      insertados: 0,
      con_error: errores.length,
      marcas_creadas: [],
      categorias_creadas: [],
      productos: errores.map((e) => ({ ok: false, error: e })),
    };
  }

  // ── FASE 3: Resolver/crear marcas y categorías ──
  const marcasResueltas = new Map();
  const categoriasResueltas = new Map();
  const marcasCreadas = [];
  const categoriasCreadas = [];

  const nombresMarca = [...new Set(normalizados.map((p) => p.marca))];
  const nombresCategoria = [...new Set(normalizados.map((p) => p.categoria))];

  for (const nombre of nombresMarca) {
    const { id, creada } = await resolverOMarcar(nombre, dry_run);
    marcasResueltas.set(nombre.toLowerCase(), id);
    if (creada) marcasCreadas.push(nombre);
  }

  for (const nombre of nombresCategoria) {
    const result = await resolverOCategoria(nombre, dry_run);
    categoriasResueltas.set(nombre.toLowerCase(), result);
    if (result.creada) categoriasCreadas.push(nombre);
  }

  // ── FASE 4: Generar slugs únicos ──
  const conSlugs = [];
  for (const p of normalizados) {
    const slug = await generarSlugUnico(p.nombre);
    conSlugs.push({ ...p, slug });
  }

  // ── Dry run: devolver preview sin insertar ──
  if (dry_run) {
    return {
      dry_run: true,
      insertados: 0,
      con_error: 0,
      marcas_creadas: marcasCreadas,
      categorias_creadas: categoriasCreadas,
      productos: conSlugs.map((p) => ({
        nombre: p.nombre,
        slug: p.slug,
        precio: p.precio,
        precio_oferta: p.precio_oferta,
        stock: p.stock,
        marca: p.marca,
        marca_id: marcasResueltas.get(p.marca.toLowerCase()),
        categoria: p.categoria,
        categoria_id: categoriasResueltas.get(p.categoria.toLowerCase())?.id,
        categoria_slug: categoriasResueltas.get(p.categoria.toLowerCase())?.slug,
        descripcion: p.descripcion,
        destacado: p.destacado,
        mas_vendido: p.mas_vendido,
      })),
    };
  }

  // ── FASE 5: Insertar uno por uno ──
  const resultados = [];
  let insertados = 0;
  let conError = 0;

  for (const p of conSlugs) {
    try {
      const { data, error } = await supabase
        .from("productos")
        .insert({
          nombre: p.nombre,
          descripcion: p.descripcion,
          slug: p.slug,
          precio: p.precio,
          precio_oferta: p.precio_oferta,
          stock: p.stock,
          categoria_id: categoriasResueltas.get(p.categoria.toLowerCase()).id,
          marca_id: marcasResueltas.get(p.marca.toLowerCase()),
          destacado: p.destacado,
          mas_vendido: p.mas_vendido,
          imagenes: p.imagenes,
        })
        .select()
        .single();

      if (error) {
        resultados.push({ nombre: p.nombre, ok: false, error: error.message });
        conError++;
      } else {
        resultados.push({
          nombre: p.nombre,
          ok: true,
          id: data.id,
          slug: data.slug,
        });
        insertados++;
      }
    } catch (err) {
      resultados.push({ nombre: p.nombre, ok: false, error: err.message });
      conError++;
    }
  }

  return {
    dry_run: false,
    insertados,
    con_error: conError,
    marcas_creadas: marcasCreadas,
    categorias_creadas: categoriasCreadas,
    productos: resultados,
  };
}

// ──────────────────────────────────────────────────────────────
// Servidor MCP
// ──────────────────────────────────────────────────────────────

const server = new Server(
  { name: "supabase-escritura", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

/**
 * GET /tools/list
 * Registra la tool de inserción de productos.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "supabase_insert_productos",
      description:
        "Inserta uno o varios productos en la base de datos. Resuelve automáticamente marcas y categorías (las crea si no existen). Genera slugs únicos basados en el nombre. Soporta modo dry_run para validar sin insertar. Usa service role key (bypass RLS).",
      inputSchema: {
        type: "object",
        properties: {
          productos: {
            type: "array",
            description: "Lista de productos a insertar.",
            items: {
              type: "object",
              properties: {
                nombre: { type: "string", description: "Nombre del producto (requerido)." },
                descripcion: { type: "string", description: "Descripción opcional." },
                precio: { description: "Precio normal (requerido, número > 0). Acepta strings con formato argentino ('$125.000,00')." },
                precio_oferta: { description: "Precio de oferta (opcional). Acepta strings con formato argentino." },
                stock: { type: "integer", description: "Cantidad en stock (default 0)." },
                marca: { type: "string", description: "Nombre de la marca (requerido). Se crea si no existe." },
                categoria: { type: "string", description: "Nombre de la categoría (requerido). Se crea si no existe." },
                destacado: { type: "boolean", description: "Producto destacado (default false)." },
                mas_vendido: { type: "boolean", description: "Producto más vendido (default false)." },
                imagenes: { type: "array", items: { type: "string" }, description: "URLs de imágenes (opcional)." },
              },
              required: ["nombre", "precio", "marca", "categoria"],
            },
          },
          dry_run: {
            type: "boolean",
            description: "Si true, valida todo pero no inserta. Devuelve preview de lo que se insertaría.",
          },
        },
        required: ["productos"],
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
      case "supabase_insert_productos":
        result = await handleInsertProductos(args);
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
  console.error("supabase-escritura MCP server iniciado vía stdio");
}

main().catch((err) => {
  console.error("Error fatal al iniciar el MCP server:", err);
  process.exit(1);
});
