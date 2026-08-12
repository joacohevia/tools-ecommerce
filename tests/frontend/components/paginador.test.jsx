// @vitest-environment jsdom
/**
 * Tests del componente Paginador y su helper calcularPaginas.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Paginador from '../../../src/components/paginador';
import { calcularPaginas } from '../../../src/lib/utils';

describe('calcularPaginas', () => {
  it('devuelve todas las páginas cuando hay 7 o menos', () => {
    expect(calcularPaginas(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(calcularPaginas(1, 1)).toEqual([1]);
    expect(calcularPaginas(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('muestra elipsis en saltos grandes con página central', () => {
    expect(calcularPaginas(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10]);
  });

  it('muestra elipsis al inicio cuando la página está cerca del final', () => {
    expect(calcularPaginas(10, 10)).toEqual([1, '…', 9, 10]);
  });

  it('muestra elipsis al final cuando la página está cerca del inicio', () => {
    expect(calcularPaginas(1, 10)).toEqual([1, 2, '…', 10]);
  });
});

describe('Paginador', () => {
  it('no renderiza nada con una sola página', () => {
    const { container } = render(<Paginador pagina={1} totalPaginas={1} onChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza Anterior, Siguiente y los números de página', () => {
    render(<Paginador pagina={2} totalPaginas={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  });

  it('deshabilita Anterior en la primera página', () => {
    render(<Paginador pagina={1} totalPaginas={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled();
  });

  it('deshabilita Siguiente en la última página', () => {
    render(<Paginador pagina={3} totalPaginas={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /anterior/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled();
  });

  it('marca la página actual con aria-current', () => {
    render(<Paginador pagina={2} totalPaginas={3} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current');
  });

  it('llama a onChange con la página clickeada', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Paginador pagina={1} totalPaginas={5} onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
