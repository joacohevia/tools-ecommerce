// @vitest-environment jsdom
/**
 * Tests del componente Filtrado (panel de filtros de productos).
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Filtrado from '../../../src/components/filtrado';

const marcasMock = [
  { id: 1, nombre: 'Stanley' },
  { id: 2, nombre: 'Bahco' },
];

const categoriasMock = [
  { id: 1, nombre: 'Manuales', slug: 'manuales' },
  { id: 2, nombre: 'Eléctricas', slug: 'electricas' },
];

function setup(overrides = {}) {
  const props = {
    marcas: marcasMock,
    categorias: categoriasMock,
    selectedMarcas: [],
    setSelectedMarcas: vi.fn(),
    selectedCategorias: [],
    setSelectedCategorias: vi.fn(),
    precioMin: '',
    setPrecioMin: vi.fn(),
    precioMax: '',
    setPrecioMax: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<Filtrado {...props} />) };
}

describe('Filtrado', () => {
  it('renderiza el título Productos', () => {
    setup();
    expect(screen.getByText('Productos')).toBeInTheDocument();
  });

  it('renderiza las marcas con checkboxes', () => {
    setup();
    expect(screen.getByText('Stanley')).toBeInTheDocument();
    expect(screen.getByText('Bahco')).toBeInTheDocument();
    expect(screen.getByText('Filtrar por Marca')).toBeInTheDocument();
  });

  it('renderiza las categorías con checkboxes', () => {
    setup();
    expect(screen.getByText('Manuales')).toBeInTheDocument();
    expect(screen.getByText('Eléctricas')).toBeInTheDocument();
    expect(screen.getByText('Filtrar por Categoría')).toBeInTheDocument();
  });

  it('renderiza los inputs de precio', () => {
    setup();
    expect(screen.getByPlaceholderText('Mín')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Máx')).toBeInTheDocument();
    expect(screen.getByText('Precio')).toBeInTheDocument();
  });

  it('marca checkbox de marca cuando está seleccionada', () => {
    setup({ selectedMarcas: [1] });
    const checkboxes = screen.getAllByRole('checkbox');
    const stanleyCheck = checkboxes[0];
    expect(stanleyCheck).toBeChecked();
  });

  it('marca checkbox de categoría cuando está seleccionada', () => {
    setup({ selectedCategorias: [1] });
    const checkboxes = screen.getAllByRole('checkbox');
    const manualesCheck = checkboxes[2];
    expect(manualesCheck).toBeChecked();
  });

  it('puede colapsar/expandir sección de marcas', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText('Stanley')).toBeVisible();
    await user.click(screen.getByText('Filtrar por Marca'));
    expect(screen.queryByText('Stanley')).not.toBeInTheDocument();
  });

  it('puede colapsar/expandir sección de categorías', async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText('Manuales')).toBeVisible();
    await user.click(screen.getByText('Filtrar por Categoría'));
    expect(screen.queryByText('Manuales')).not.toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay marcas', () => {
    setup({ marcas: [] });
    expect(screen.getByText('No hay marcas disponibles')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay categorías', () => {
    setup({ categorias: [] });
    expect(screen.getByText('No hay categorías disponibles')).toBeInTheDocument();
  });

  it('llama a setPrecioMin al cambiar el input', async () => {
    const user = userEvent.setup();
    const setPrecioMin = vi.fn();
    setup({ setPrecioMin });
    const input = screen.getByPlaceholderText('Mín');
    await user.type(input, '100');
    expect(setPrecioMin).toHaveBeenCalled();
  });
});
