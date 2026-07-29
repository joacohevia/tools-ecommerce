import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import { load } from "js-yaml";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import swaggerUi from "swagger-ui-express";

dotenv.config({ path: "../.env" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: path.join(__dirname, "uploads") });

app.use(cors({
  origin: process.env.VITE_FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());

// ── Swagger UI ─────────────────────────────────────────────
const openapiSpec = load(readFileSync(path.join(__dirname, "openapi.yml"), "utf8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));
console.log("Swagger UI disponible en http://localhost:" + PORT + "/api-docs");

/**
 * Middleware de autenticación JWT.
 * Verifica el token del header Authorization contra Supabase Auth.
 * Si es válido, inyecta req.user con { id, email } y continúa.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token de acceso requerido" });
    }
    const token = header.split(" ")[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
    req.user = user;
    next();
  } catch {
    res.status(500).json({ error: "Error al verificar autenticación" });
  }
}

/**
 * Middleware de autorización — solo administradores.
 * Requiere que auth() ya haya inyectado req.user.
 * Busca el perfil del usuario y verifica que su rol sea 'admin'.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function adminOnly(req, res, next) {
  try {
    const { data: perfil, error } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error || !perfil || perfil.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado — solo administradores" });
    }
    next();
  } catch {
    res.status(500).json({ error: "Error al verificar rol de administrador" });
  }
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos, intentá de nuevo en 15 minutos" },
});

// ============================================================
// AUTH
// ============================================================

/**
 * POST /api/auth/login
 * Autentica al usuario con email y contraseña contra Supabase Auth.
 * Devuelve los datos de sesión (access_token, refresh_token, etc.)
 * y el perfil del usuario si ya existe en la tabla perfiles.
 *
 * @body   {string} email    - Correo del usuario
 * @body   {string} password - Contraseña del usuario
 * @returns {object} 200 - { user, session, perfil }
 * @returns {object} 400 - Campos requeridos faltantes
 * @returns {object} 401 - Credenciales inválidas
 * @returns {object} 500 - Error interno del servidor
 */
app.post("/api/auth/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message?.includes("Invalid login")) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      if (error.message?.includes("Email not confirmed")) {
        return res.status(401).json({ error: "Debes confirmar tu correo antes de iniciar sesión" });
      }
      return res.status(401).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      return res.status(500).json({ error: "Error al iniciar sesión" });
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("*")
      .eq("user_id", data.user.id)
      .maybeSingle();

    res.json({
      user: data.user,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      },
      perfil,
    });
  } catch {
    res.status(500).json({ error: "Error interno al iniciar sesión" });
  }
});

/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado y su perfil a partir del token JWT.
 * Requiere token Bearer en el header Authorization.
 *
 * @returns {object} 200 - { user, perfil }
 * @returns {object} 401 - Token inválido o ausente
 * @returns {object} 500 - Error interno del servidor
 */
app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("*")
      .eq("user_id", req.user.id)
      .maybeSingle();

    res.json({ user: req.user, perfil: perfil || null });
  } catch {
    res.status(500).json({ error: "Error al obtener datos del usuario" });
  }
});

// ============================================================
// PRODUCTOS
// ============================================================

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

app.get("/api/productos/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("productos")
      .select("*, categorias(nombre, slug), marcas(nombre)")
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener producto" });
  }
});

app.post("/api/productos", auth, adminOnly, async (req, res) => {
  try {
    const { nombre, descripcion, slug, precio, precio_oferta, stock, categoria_id, marca_id, destacado, mas_vendido, imagenes } = req.body;

    if (!nombre || !slug || !precio || !categoria_id || !marca_id) {
      return res.status(400).json({ error: "Faltan campos requeridos: nombre, slug, precio, categoria_id, marca_id" });
    }

    const { data, error } = await supabase
      .from("productos")
      .insert({ nombre, descripcion, slug, precio, precio_oferta, stock, categoria_id, marca_id, destacado, mas_vendido, imagenes })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: "Error al crear producto" });
  }
});

app.put("/api/productos/:id", auth, adminOnly, async (req, res) => {
  try {
    const camposPermitidos = [
      "nombre", "descripcion", "slug", "precio", "precio_oferta",
      "stock", "categoria_id", "marca_id", "destacado", "mas_vendido", "imagenes",
    ];

    const updateData = {};
    for (const key of camposPermitidos) {
      if (key in req.body) updateData[key] = req.body[key];
    }

    const { data, error } = await supabase
      .from("productos")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

app.delete("/api/productos/:id", auth, adminOnly, async (req, res) => {
  try {
    const { data: producto, error: fetchError } = await supabase
      .from("productos")
      .select("imagenes")
      .eq("id", req.params.id)
      .single();

    if (fetchError || !producto) {
      console.log(`[DELETE /api/productos/${req.params.id}] Producto no encontrado`);
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const imagenes = producto.imagenes || [];
    console.log(`[DELETE /api/productos/${req.params.id}] Imagenes a eliminar: ${imagenes.length}`);

    if (imagenes.length > 0) {
      const filenames = imagenes.map((url) => {
        const parts = url.split("/productos/");
        return parts[1] ? decodeURIComponent(parts[1]) : null;
      }).filter(Boolean);

      console.log(`[DELETE /api/productos/${req.params.id}] Archivos a borrar del storage:`, filenames);

      if (filenames.length > 0) {
        const { data: removed, error: storageError } = await supabase.storage
          .from("productos")
          .remove(filenames);

        if (storageError) {
          console.error(`[DELETE /api/productos/${req.params.id}] Error al eliminar imagenes del storage:`, storageError.message);
        } else {
          console.log(`[DELETE /api/productos/${req.params.id}] Imagenes eliminadas del storage:`, removed);
        }
      }
    }

    const { data: deleted, error: deleteError } = await supabase
      .from("productos")
      .delete()
      .eq("id", req.params.id)
      .select();

    if (deleteError) return res.status(500).json({ error: deleteError.message });
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.log(`[DELETE /api/productos/${req.params.id}] Producto eliminado correctamente`);
    res.json({ message: "Producto eliminado", deleted });
  } catch (err) {
    console.error(`[DELETE /api/productos/${req.params.id}] Error:`, err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// ============================================================
// CATEGORIAS
// ============================================================

app.get("/api/categorias", async (req, res) => {
  res.set("Cache-Control", "no-store");

  try {
    const { data, error } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre");

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener categorias" });
  }
});

app.post("/api/categorias", auth, adminOnly, async (req, res) => {
  try {
    const { nombre, slug } = req.body;
    if (!nombre || !slug) {
      return res.status(400).json({ error: "Faltan campos requeridos: nombre, slug" });
    }
    const { data, error } = await supabase
      .from("categorias")
      .insert({ nombre, slug })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: "Error al crear categoria" });
  }
});

app.put("/api/categorias/:id", auth, adminOnly, async (req, res) => {
  try {
    const { nombre, slug } = req.body;
    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (slug) updateData.slug = slug;
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Sin campos para actualizar" });
    }
    const { data, error } = await supabase
      .from("categorias")
      .update(updateData)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Categoria no encontrada" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al actualizar categoria" });
  }
});

app.delete("/api/categorias/:id", auth, adminOnly, async (req, res) => {
  try {
    const { count, error: countError } = await supabase
      .from("productos")
      .select("*", { count: "exact", head: true })
      .eq("categoria_id", req.params.id);

    if (countError) return res.status(500).json({ error: countError.message });
    if (count > 0) {
      return res.status(409).json({ error: "No se puede eliminar la categoria porque tiene productos asociados" });
    }

    const { data: deleted, error } = await supabase
      .from("categorias")
      .delete()
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Categoria no encontrada" });
    }
    res.json({ message: "Categoria eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar categoria" });
  }
});

// ============================================================
// MARCAS
// ============================================================

app.get("/api/marcas", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("marcas")
      .select("*")
      .order("nombre");

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener marcas" });
  }
});

app.post("/api/marcas", auth, adminOnly, async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: "Falta campo requerido: nombre" });
    }
    const { data, error } = await supabase
      .from("marcas")
      .insert({ nombre })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: "Error al crear marca" });
  }
});

app.put("/api/marcas/:id", auth, adminOnly, async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: "Falta campo requerido: nombre" });
    }
    const { data, error } = await supabase
      .from("marcas")
      .update({ nombre })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Marca no encontrada" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al actualizar marca" });
  }
});

app.delete("/api/marcas/:id", auth, adminOnly, async (req, res) => {
  try {
    const { count, error: countError } = await supabase
      .from("productos")
      .select("*", { count: "exact", head: true })
      .eq("marca_id", req.params.id);

    if (countError) return res.status(500).json({ error: countError.message });
    if (count > 0) {
      return res.status(409).json({ error: "No se puede eliminar la marca porque tiene productos asociados" });
    }

    const { data: deleted, error } = await supabase
      .from("marcas")
      .delete()
      .eq("id", req.params.id)
      .select();
    if (error) return res.status(500).json({ error: error.message });
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Marca no encontrada" });
    }
    res.json({ message: "Marca eliminada" });
  } catch {
    res.status(500).json({ error: "Error al eliminar marca" });
  }
});

// ============================================================
// PERFILES
// ============================================================

app.get("/api/perfiles", auth, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .order("id");

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener perfiles" });
  }
});

app.get("/api/perfiles/:id", auth, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

/**
 * POST /api/perfiles
 * Crea el perfil del usuario autenticado.
 * Requiere token JWT en el header Authorization.
 *
 * @body {string} nombre - Nombre del usuario
 * @body {string} apellido - Apellido del usuario
 * @body {string} [dni] - DNI del usuario (opcional)
 * @returns {object} 201 - Perfil creado
 * @returns {object} 400 - Campos requeridos faltantes
 * @returns {object} 401 - Token inválido o ausente
 * @returns {object} 409 - El usuario ya tiene un perfil
 */
app.post("/api/perfiles", auth, async (req, res) => {
  try {
    const { nombre, apellido, dni } = req.body;

    if (!nombre || !apellido) {
      return res.status(400).json({ error: "Faltan campos requeridos: nombre, apellido" });
    }

    const existe = await supabase
      .from("perfiles")
      .select("id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (existe.data) {
      return res.status(409).json({ error: "El usuario ya tiene un perfil" });
    }

    const { data, error } = await supabase
      .from("perfiles")
      .insert({
        user_id: req.user.id,
        nombre,
        apellido,
        dni: dni || null,
        rol: "cliente",
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch {
    res.status(500).json({ error: "Error al crear perfil" });
  }
});

// ============================================================
// PEDIDOS
// ============================================================

app.get("/api/pedidos", auth, async (req, res) => {
  try {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("id, rol")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" });

    let query = supabase
      .from("pedidos")
      .select("*, pedido_items(*, productos(nombre, slug, imagenes))")
      .order("created_at", { ascending: false });

    if (perfil.rol !== "admin") {
      query = query.eq("perfil_id", perfil.id);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

app.post("/api/pedidos", auth, async (req, res) => {
  try {
    const { items, nota } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "El pedido debe tener al menos un item" });
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" });

    let total = 0;
    const itemsConPrecio = [];

    for (const item of items) {
      const { data: producto } = await supabase
        .from("productos")
        .select("precio, precio_oferta")
        .eq("id", item.producto_id)
        .single();

      if (!producto) {
        return res.status(400).json({ error: `Producto ${item.producto_id} no encontrado` });
      }

      const precio = producto.precio_oferta || producto.precio;
      const subtotal = precio * item.cantidad;
      total += subtotal;
      itemsConPrecio.push({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: precio,
      });
    }

    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
        perfil_id: perfil.id,
        estado: "pendiente",
        total,
        nota: nota || null,
      })
      .select()
      .single();

    if (pedidoError) return res.status(500).json({ error: pedidoError.message });

    const itemsParaInsertar = itemsConPrecio.map((item) => ({
      pedido_id: pedido.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from("pedido_items")
      .insert(itemsParaInsertar);

    if (itemsError) return res.status(500).json({ error: itemsError.message });

    const { data: pedidoCompleto } = await supabase
      .from("pedidos")
      .select("*, pedido_items(*, productos(nombre, slug, imagenes))")
      .eq("id", pedido.id)
      .single();

    res.status(201).json(pedidoCompleto);
  } catch {
    res.status(500).json({ error: "Error al crear pedido" });
  }
});

app.put("/api/pedidos/:id", auth, adminOnly, async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "confirmado", "enviado", "entregado", "cancelado"];

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: `Estado inválido. Permitidos: ${estadosValidos.join(", ")}`,
      });
    }

    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
});

// ============================================================
// UPLOAD DE IMAGENES
// ============================================================

app.post("/api/upload", auth, adminOnly, upload.single("imagen"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibio ninguna imagen" });
    }

    const filePath = req.file.path;
    const filename = `${randomUUID()}.webp`;
    const outputPath = path.join(__dirname, "uploads", filename);

    await sharp(filePath)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath);

    const fileBuffer = await import("node:fs").then((fs) =>
      fs.promises.readFile(outputPath)
    );

    const { error } = await supabase.storage
      .from("productos")
      .upload(filename, fileBuffer, {
        contentType: "image/webp",
        cacheControl: "3600",
      });

    await unlink(filePath).catch(() => {});
    await unlink(outputPath).catch(() => {});

    if (error) return res.status(500).json({ error: error.message });

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/productos/${filename}`;
    res.json({ url: publicUrl });
  } catch {
    res.status(500).json({ error: "Error al subir imagen" });
  }
});

// ============================================================
// ADMIN — USUARIOS Y PEDIDOS
// ============================================================

app.get("/api/admin/usuarios", auth, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("perfiles")
      .select("*")
      .order("id");

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

app.put("/api/perfiles/:id", auth, adminOnly, async (req, res) => {
  try {
    const { rol } = req.body;
    if (!rol || !["admin", "cliente"].includes(rol)) {
      return res.status(400).json({ error: "Rol invalido. Permitidos: admin, cliente" });
    }

    const { data: adminPerfil } = await supabase
      .from("perfiles")
      .select("id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (adminPerfil && String(adminPerfil.id) === req.params.id) {
      return res.status(403).json({ error: "No puedes cambiar tu propio rol" });
    }

    const { data, error } = await supabase
      .from("perfiles")
      .update({ rol })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Perfil no encontrado" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

app.delete("/api/perfiles/:id", auth, adminOnly, async (req, res) => {
  try {
    const { data: adminPerfil } = await supabase
      .from("perfiles")
      .select("id")
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (adminPerfil && String(adminPerfil.id) === req.params.id) {
      return res.status(403).json({ error: "No puedes eliminar tu propia cuenta" });
    }

    const { data: deleted, error } = await supabase
      .from("perfiles")
      .delete()
      .eq("id", req.params.id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }
    res.json({ message: "Perfil eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar perfil" });
  }
});

app.get("/api/admin/usuarios/:perfilId/pedidos", auth, adminOnly, async (req, res) => {
  try {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("id")
      .eq("id", req.params.perfilId)
      .maybeSingle();

    if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" });

    const { data, error } = await supabase
      .from("pedidos")
      .select("*, pedido_items(*, productos(nombre, slug, imagenes))")
      .eq("perfil_id", req.params.perfilId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener pedidos del usuario" });
  }
});

app.get("/api/admin/pedidos/:pedidoId/items", auth, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*, pedido_items(*, productos(nombre, slug, imagenes))")
      .eq("id", req.params.pedidoId)
      .single();

    if (error || !data) return res.status(404).json({ error: "Pedido no encontrado" });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al obtener items del pedido" });
  }
});

// ============================================================
// ROOT Y 404
// ============================================================

app.get("/", (req, res) => {
  res.json({ message: "API herramientas-tandil", status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

export default app;
