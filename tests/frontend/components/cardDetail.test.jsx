// @vitest-environment jsdom
/**
 * Tests del breadcrumb en CardDetail.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CardDetail from '../../../src/components/pages/cardDetail';
import { getProductoById } from '../../../src/http';

vi.mock('../../../src/context/CarritoContext', async () => {
  const actual = await vi.importActual('../../../src/context/CarritoContext');
  return {
    ...actual,
    useCarrito: vi.fn(() => ({
      agregarAlCarrito: vi.fn(),
    })),
  };
});

vi.mock('../../../src/http', async () => {
  const actual = await vi.importActual('../../../src/http');
  return {
    ...actual,
    getProductoById: vi.fn(() => Promise.resolve({
      id: 1,
      nombre: 'Taladro Percutor',
      precio: 100000,
      precio_oferta: null,
      stock: 5,
      imagenes: [],
      marcas: { nombre: 'Bosch' },
      categorias: { nombre: 'Taladros', slug: 'taladros' },
      descripcion: 'Descripción de prueba',
    })),
  };
});

describe('CardDetail breadcrumb', () => {
  it('muestra breadcrumb con Inicio, Productos, categoría y nombre', async () => {
    render(
      <MemoryRouter initialEntries={['/producto/1']}>
        <Routes>
          <Route path="/producto/:id" element={<CardDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Taladro Percutor').length).toBeGreaterThanOrEqual(1);
    });

    const inicioLink = screen.getByText('Inicio');
    expect(inicioLink).toHaveAttribute('href', '/home');

    const productosLink = screen.getByText('Productos');
    expect(productosLink).toHaveAttribute('href', '/productos');

    const categoriaLink = screen.getByText('Taladros');
    expect(categoriaLink).toHaveAttribute('href', '/productos?categoria=taladros');
  });

  it('muestra boton Agregar al carrito cuando hay stock', async () => {
    render(
      <MemoryRouter initialEntries={['/producto/1']}>
        <Routes>
          <Route path="/producto/:id" element={<CardDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeInTheDocument();
    });
  });

  it('no muestra boton Agregar y muestra "Sin stock" cuando el stock es 0', async () => {
    getProductoById.mockResolvedValueOnce({
      id: 1,
      nombre: 'Taladro Percutor',
      precio: 100000,
      precio_oferta: null,
      stock: 0,
      imagenes: [],
      marcas: { nombre: 'Bosch' },
      categorias: { nombre: 'Taladros', slug: 'taladros' },
      descripcion: 'Descripción de prueba',
    });

    render(
      <MemoryRouter initialEntries={['/producto/1']}>
        <Routes>
          <Route path="/producto/:id" element={<CardDetail />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sin stock')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /agregar al carrito/i })).not.toBeInTheDocument();
  });
});
