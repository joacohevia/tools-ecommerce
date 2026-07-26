/**
 * MSW server con handlers compartidos para todos los tests del frontend.
 * Intercepta fetch a localhost:3000/api para devolver respuestas controladas.
 */
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const BASE = 'http://localhost:3000/api';

export const server = setupServer(
  http.get(`${BASE}/productos`, () =>
    HttpResponse.json([
      { id: 1, nombre: 'Martillo', precio: '1500', precio_oferta: null, stock: 10, imagenes: [], marcas: { nombre: 'Stanley' }, categorias: { nombre: 'Manuales', slug: 'manuales' }, destacado: true, mas_vendido: false },
      { id: 2, nombre: 'Destornillador', precio: '800', precio_oferta: '600', stock: 25, imagenes: [], marcas: { nombre: 'Bahco' }, categorias: { nombre: 'Manuales', slug: 'manuales' }, destacado: false, mas_vendido: true },
      { id: 3, nombre: 'Taladro', precio: '12000', precio_oferta: null, stock: 5, imagenes: [], marcas: { nombre: 'Black & Decker' }, categorias: { nombre: 'Eléctricas', slug: 'electricas' }, destacado: false, mas_vendido: false },
    ]),
  ),

  http.get(`${BASE}/productos/:id`, ({ params }) =>
    HttpResponse.json({
      id: Number(params.id),
      nombre: 'Martillo',
      precio: '1500',
      precio_oferta: null,
      stock: 10,
      imagenes: [],
      marcas: { nombre: 'Stanley' },
      categorias: { nombre: 'Manuales', slug: 'manuales' },
      destacado: false,
      mas_vendido: false,
      descripcion: 'Martillo de carpintero',
    }),
  ),

  http.delete(`${BASE}/productos/:id`, () =>
    HttpResponse.json({ message: 'Producto eliminado' }),
  ),

  http.get(`${BASE}/categorias`, () =>
    HttpResponse.json([
      { id: 1, nombre: 'Manuales', slug: 'manuales' },
      { id: 2, nombre: 'Eléctricas', slug: 'electricas' },
    ]),
  ),

  http.get(`${BASE}/marcas`, () =>
    HttpResponse.json([
      { id: 1, nombre: 'Stanley' },
      { id: 2, nombre: 'Bahco' },
    ]),
  ),

  http.post(`${BASE}/auth/login`, () =>
    HttpResponse.json({
      user: { id: 'uuid-1', email: 'admin@test.com' },
      session: { access_token: 'fake-token', refresh_token: 'fake-refresh', expires_in: 3600 },
      perfil: { id: 1, nombre: 'Admin', apellido: 'Test', rol: 'admin' },
    }),
  ),

  http.get(`${BASE}/auth/me`, () =>
    HttpResponse.json({
      user: { id: 'uuid-1' },
      perfil: { id: 1, nombre: 'Admin', apellido: 'Test', rol: 'admin' },
    }),
  ),
);
