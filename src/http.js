import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

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
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(producto),
  });
  if (!res.ok) throw new Error("Error al crear producto");
  return res.json();
}

export async function updateProducto(id, cambios) {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(cambios),
  });
  if (!res.ok) throw new Error("Error al actualizar producto");
  return res.json();
}

export async function deleteProducto(id) {
  const res = await fetch(`${API_URL}/productos/${id}`, {
    method: "DELETE",
    headers: { ...(await getAuthHeaders()) },
  });
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

/**
 * Inicia sesión contra el backend.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: object, session: object, perfil: object|null }>}
 */
export async function loginApi(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al iniciar sesión");
  }
  return res.json();
}

export async function uploadImagen(file) {
  const formData = new FormData();
  formData.append("imagen", file);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: { ...(await getAuthHeaders()) },
    body: formData,
  });
  if (!res.ok) throw new Error("Error al subir imagen");
  return res.json();
}

/**
 * Crea el perfil del usuario autenticado.
 * @param {object} perfil - { nombre, apellido, dni? }
 * @param {string} token - JWT de acceso del usuario
 * @returns {Promise<object>} Perfil creado
 */
export async function createPerfil(perfil, token) {
  const res = await fetch(`${API_URL}/perfiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(perfil),
  });
  if (!res.ok) throw new Error("Error al crear perfil");
  return res.json();
}

/**
 * Obtiene el perfil del usuario autenticado.
 * @param {string} token - JWT de acceso del usuario
 * @returns {Promise<object>} Datos del perfil
 */
export async function getPerfilMe(token) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener perfil");
  const data = await res.json();
  return data.perfil;
}

export async function getPerfiles() {
  const res = await fetch(`${API_URL}/perfiles`, {
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) throw new Error("Error al obtener perfiles");
  return res.json();
}

export async function getPerfilById(id) {
  const res = await fetch(`${API_URL}/perfiles/${id}`, {
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) throw new Error("Perfil no encontrado");
  return res.json();
}

export async function createCategoria(categoria) {
  const res = await fetch(`${API_URL}/categorias`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(categoria),
  });
  if (!res.ok) throw new Error("Error al crear categoria");
  return res.json();
}

export async function updateCategoria(id, cambios) {
  const res = await fetch(`${API_URL}/categorias/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(cambios),
  });
  if (!res.ok) throw new Error("Error al actualizar categoria");
  return res.json();
}

export async function deleteCategoria(id) {
  const res = await fetch(`${API_URL}/categorias/${id}`, {
    method: "DELETE",
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al eliminar categoria");
  }
}

export async function createMarca(marca) {
  const res = await fetch(`${API_URL}/marcas`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(marca),
  });
  if (!res.ok) throw new Error("Error al crear marca");
  return res.json();
}

export async function updateMarca(id, cambios) {
  const res = await fetch(`${API_URL}/marcas/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(cambios),
  });
  if (!res.ok) throw new Error("Error al actualizar marca");
  return res.json();
}

export async function deleteMarca(id) {
  const res = await fetch(`${API_URL}/marcas/${id}`, {
    method: "DELETE",
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al eliminar marca");
  }
}

export async function getPedidos() {
  const res = await fetch(`${API_URL}/pedidos`, {
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) throw new Error("Error al obtener pedidos");
  return res.json();
}

export async function createPedido(pedido) {
  const res = await fetch(`${API_URL}/pedidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify(pedido),
  });
  if (!res.ok) throw new Error("Error al crear pedido");
  return res.json();
}

export async function updatePedidoEstado(id, estado) {
  const res = await fetch(`${API_URL}/pedidos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) throw new Error("Error al actualizar pedido");
  return res.json();
}

/**
 * Obtiene todos los perfiles registrados (solo admin).
 * @returns {Promise<Array>} Lista de perfiles con nombre, apellido, dni, rol, created_at
 */
export async function getAdminUsuarios() {
  const res = await fetch(`${API_URL}/admin/usuarios`, {
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
}

/**
 * Obtiene los pedidos de un perfil especifico, con items y productos anidados.
 * @param {number} perfilId
 * @returns {Promise<Array>} Lista de pedidos con pedido_items y productos
 */
export async function getAdminPedidosPorUsuario(perfilId) {
  const res = await fetch(`${API_URL}/admin/usuarios/${perfilId}/pedidos`, {
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) throw new Error("Error al obtener pedidos del usuario");
  return res.json();
}

/**
 * Obtiene el detalle completo de un pedido con sus items y productos.
 * @param {number} pedidoId
 * @returns {Promise<object>} Pedido con pedido_items y productos anidados
 */
export async function getAdminPedidoItems(pedidoId) {
  const res = await fetch(`${API_URL}/admin/pedidos/${pedidoId}/items`, {
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) throw new Error("Error al obtener items del pedido");
  return res.json();
}

/**
 * Cambia el rol de un perfil (solo admin).
 * @param {number} id - ID del perfil
 * @param {string} rol - "admin" o "cliente"
 * @returns {Promise<object>} Perfil actualizado
 */
export async function updatePerfilRol(id, rol) {
  const res = await fetch(`${API_URL}/perfiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await getAuthHeaders()) },
    body: JSON.stringify({ rol }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al actualizar rol");
  }
  return res.json();
}

/**
 * Elimina un perfil (solo admin, no permite auto-eliminacion).
 * @param {number} id - ID del perfil
 */
export async function deletePerfil(id) {
  const res = await fetch(`${API_URL}/perfiles/${id}`, {
    method: "DELETE",
    headers: { ...(await getAuthHeaders()) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Error al eliminar perfil");
  }
}
