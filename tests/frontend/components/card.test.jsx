// @vitest-environment jsdom
/**
 * Tests del componente Card.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent, act } from '@testing-library/react';
import { renderWithProviders } from '../../helpers';
import Card from '../../../src/components/card';
import { useAuth } from '../../../src/context/AuthContext';

vi.mock('../../../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../../src/context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => ({ perfil: null })),
  };
});


const productoMock = {
  id: 1, nombre: 'Martillo', precio: '1500', precio_oferta: null,
  stock: 10, imagenes: [], marcas: { nombre: 'Stanley' },
  categorias: { nombre: 'Manuales', slug: 'manuales' },
};

const productoOfertaMock = {
  ...productoMock, id: 2, nombre: 'Destornillador',
  precio: '800', precio_oferta: '600', marcas: { nombre: 'Bahco' },
};

describe('Card', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ perfil: null });
  });

  it('renderiza el nombre del producto', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByText('Martillo')).toBeInTheDocument();
  });

  it('renderiza la marca', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByText('Stanley')).toBeInTheDocument();
  });

  it('muestra precio regular', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByText('$1.500')).toBeInTheDocument();
  });

  it('muestra precio tachado cuando hay oferta', () => {
    renderWithProviders(<Card producto={productoOfertaMock} />);
    expect(screen.getByText('$800')).toHaveClass('line-through');
  });

  it('muestra precio de oferta como efectivo', () => {
    renderWithProviders(<Card producto={productoOfertaMock} />);
    expect(screen.getByText('$600')).toBeInTheDocument();
  });

  it('tiene boton Agregar', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByRole('button', { name: /agregar/i })).toBeInTheDocument();
  });

  it('no muestra botones admin si no es admin', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.queryByTitle('Editar producto')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Eliminar producto')).not.toBeInTheDocument();
  });

  it('muestra botones admin cuando el usuario es admin', () => {
    useAuth.mockReturnValue({ perfil: { rol: 'admin' } });
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByTitle('Editar producto')).toBeInTheDocument();
    expect(screen.getByTitle('Eliminar producto')).toBeInTheDocument();
  });

  it('usa placeholder si no hay imagen', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Martillo');
  });

  it('onDelete no se llama si no se dispara delete', () => {
    const onDelete = vi.fn();
    renderWithProviders(<Card producto={productoMock} onDelete={onDelete} />);
    expect(onDelete).not.toHaveBeenCalled();
  });

  describe('US6 — Animación Agregar al carrito', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('cambia texto a "Agregado ✓" al clickear', () => {
      renderWithProviders(<Card producto={productoMock} />);
      const btn = screen.getByRole('button', { name: /agregar/i });
      expect(btn).toHaveTextContent('Agregar al carrito');

      fireEvent.click(btn);
      expect(screen.getByRole('button', { name: /agregado/i })).toHaveTextContent('Agregado ✓');
    });

    it('revierte a texto original después de 1s', () => {
      renderWithProviders(<Card producto={productoMock} />);
      const btn = screen.getByRole('button', { name: /agregar/i });

      fireEvent.click(btn);
      expect(screen.getByRole('button', { name: /agregado/i })).toBeInTheDocument();

      act(() => vi.advanceTimersByTime(1100));
      expect(screen.getByRole('button', { name: /agregar al carrito/i })).toBeInTheDocument();
    });
  });
});
