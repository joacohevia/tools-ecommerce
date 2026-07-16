const API_URL = "http://localhost:3000/api";

export async function getProductos(filtros = {}) {
  const params = new URLSearchParams(filtros).toString();
  const url = `${API_URL}/productos${params ? `?${params}` : ""}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}

export async function getProductoById(id) {
  const res = await fetch(`${API_URL}/productos/${id}`);
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
}

export async function createProducto(producto) {
  const res = await fetch(`${API_URL}/productos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
}

export async function updateProducto(id, cambios) {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  });
  if (!res.ok) throw new Error("Error al actualizar producto");
  return res.json();
}

export async function deleteProducto(id) {
  const res = await fetch(`${API_URL}/productos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar producto");
}

export async function getCategorias() {
  const res = await fetch(`${API_URL}/categorias`);
  if (!res.ok) throw new Error("Error al obtener categorias");
  return res.json();
}

export async function getMarcas() {
  const res = await fetch(`${API_URL}/marcas`);
  if (!res.ok) throw new Error("Error al obtener marcas");
  return res.json();
}

export async function uploadImagen(file) {
  const formData = new FormData();
  formData.append("imagen", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir imagen");
  return res.json();
}
