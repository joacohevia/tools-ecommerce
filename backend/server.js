import { createClient } from "@supabase/supabase-js";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

dotenv.config({ path: "../.env" });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: path.join(__dirname, "uploads") });

app.use(cors());
app.use(express.json());

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

app.post("/api/productos", async (req, res) => {
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

app.put("/api/productos/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("productos")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch {
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

app.delete("/api/productos/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Producto eliminado" });
  } catch {
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

// ============================================================
// CATEGORIAS
// ============================================================

app.get("/api/categorias", async (req, res) => {
  // Evita que el navegador/proxy sirva una respuesta cacheada (304)
  res.set("Cache-Control", "no-store");

  console.log("[GET /api/categorias] Request recibida");

  try {
    const { data, error, status, statusText } = await supabase
      .from("categorias")
      .select("*")
      .order("nombre");

    console.log("[GET /api/categorias] Supabase status:", status, statusText);

    if (error) {
      console.error("[GET /api/categorias] Error de Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("[GET /api/categorias] Filas recibidas:", data?.length ?? 0);
    console.log("[GET /api/categorias] Data:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (err) {
    console.error("[GET /api/categorias] Excepción:", err);
    res.status(500).json({ error: "Error al obtener categorias" });
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

// ============================================================
// UPLOAD DE IMAGENES
// ============================================================

app.post("/api/upload", upload.single("imagen"), async (req, res) => {
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
// ROOT Y 404
// ============================================================

app.get("/", (req, res) => {
  res.json({ message: "API herramientas-tandil", status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
