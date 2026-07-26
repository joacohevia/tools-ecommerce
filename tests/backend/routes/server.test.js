/**
 * Tests del backend con supertest.
 */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../../backend/server.js';

describe('Backend — Health check', () => {
  it('GET / responde con status ok', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/productos devuelve array', async () => {
    const res = await request(app).get('/api/productos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/productos/:id con id inexistente da 404', async () => {
    const res = await request(app).get('/api/productos/99999');
    expect(res.status).toBe(404);
  });

  it('POST /api/productos sin token da 401', async () => {
    const res = await request(app).post('/api/productos').send({});
    expect(res.status).toBe(401);
  });

  it('PUT /api/productos/:id sin token da 401', async () => {
    const res = await request(app).put('/api/productos/1').send({});
    expect(res.status).toBe(401);
  });

  it('DELETE /api/productos/:id sin token da 401', async () => {
    const res = await request(app).delete('/api/productos/1');
    expect(res.status).toBe(401);
  });

  it('GET /api/categorias devuelve array', async () => {
    const res = await request(app).get('/api/categorias');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/marcas devuelve array', async () => {
    const res = await request(app).get('/api/marcas');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/perfiles sin token da 401', async () => {
    const res = await request(app).get('/api/perfiles');
    expect(res.status).toBe(401);
  });

  it('GET /api/pedidos sin token da 401', async () => {
    const res = await request(app).get('/api/pedidos');
    expect(res.status).toBe(401);
  });

  it('POST /api/upload sin token da 401', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.status).toBe(401);
  });

  it('404 en ruta inexistente', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
  });
});
