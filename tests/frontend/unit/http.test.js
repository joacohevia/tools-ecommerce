/**
 * Tests unitarios para src/http.js con MSW.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { server } from '../../mocks/server';
import {
  getProductos,
  getProductoById,
  deleteProducto,
  getCategorias,
  getMarcas,
  loginApi,
  getPerfilMe,
} from '../../../src/http';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('getProductos', () => {
  it('devuelve array de productos', async () => {
    const data = await getProductos();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(3);
    expect(data[0].nombre).toBe('Martillo');
  });

  it('pasa filtros como query params', async () => {
    const data = await getProductos({ destacado: true });
    expect(data).toHaveLength(3);
  });
});

describe('getProductoById', () => {
  it('devuelve un producto por id', async () => {
    const data = await getProductoById(1);
    expect(data.id).toBe(1);
    expect(data.nombre).toBe('Martillo');
  });
});

describe('deleteProducto', () => {
  it('elimina un producto sin lanzar error', async () => {
    await expect(deleteProducto(1)).resolves.toBeUndefined();
  });
});

describe('getCategorias', () => {
  it('devuelve array de categorias', async () => {
    const data = await getCategorias();
    expect(data).toHaveLength(2);
    expect(data[0].slug).toBe('manuales');
  });
});

describe('getMarcas', () => {
  it('devuelve array de marcas', async () => {
    const data = await getMarcas();
    expect(data).toHaveLength(2);
    expect(data[0].nombre).toBe('Stanley');
  });
});

describe('loginApi', () => {
  it('devuelve user, session y perfil', async () => {
    const data = await loginApi('admin@test.com', 'password');
    expect(data.user).toBeDefined();
    expect(data.session.access_token).toBe('fake-token');
    expect(data.perfil.rol).toBe('admin');
  });
});

describe('getPerfilMe', () => {
  it('devuelve perfil con token', async () => {
    const data = await getPerfilMe('fake-token');
    expect(data.perfil.rol).toBe('admin');
  });
});
