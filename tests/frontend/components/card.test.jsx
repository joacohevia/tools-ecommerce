// @vitest-environment jsdom
/**
 * Tests del componente Card.
 */
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../helpers';
import Card from '../../../src/components/card';

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

  it('muestra cuotas calculadas', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByText(/6x/)).toBeInTheDocument();
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

  it('usa placeholder si no hay imagen', () => {
    renderWithProviders(<Card producto={productoMock} />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Martillo');
  });

  it('onDelete no se llama si no se dispara delete', () => {
    const onDelete = vi.fn();
    renderWithProviders(<Card producto={productoMock} onDelete={onDelete} />);
    expect(onDelete).not.toHaveBeenCalled();
  });
});
