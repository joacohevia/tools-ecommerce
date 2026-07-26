// @vitest-environment jsdom
/**
 * Tests del CarritoContext.
 */
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CarritoProvider, useCarrito } from '../../../src/context/CarritoContext';

const productoMock = {
  id: 1, nombre: 'Martillo', precio: '1500', precio_oferta: null,
  marcaNombre: 'Stanley', imagen: '/img.jpg',
};

const productoOfertaMock = {
  id: 2, nombre: 'Destornillador', precio: '800', precio_oferta: '600',
  marcaNombre: 'Bahco', imagen: '/img2.jpg',
};

function wrapper({ children }) {
  return <CarritoProvider>{children}</CarritoProvider>;
}

describe('CarritoContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('inicia vacio', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalPrecio).toBe(0);
  });

  it('agregarAlCarrito — agrega un item nuevo', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].cantidad).toBe(1);
  });

  it('agregarAlCarrito — incrementa cantidad de item existente', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock));
    act(() => result.current.agregarAlCarrito(productoMock));
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].cantidad).toBe(2);
  });

  it('agregarAlCarrito — respeta cantidad personalizada', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock, 5));
    expect(result.current.items[0].cantidad).toBe(5);
  });

  it('removerDelCarrito — elimina un item por id', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock));
    act(() => result.current.removerDelCarrito(1));
    expect(result.current.items).toHaveLength(0);
  });

  it('modificarCantidad — cambia la cantidad', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock));
    act(() => result.current.modificarCantidad(1, 10));
    expect(result.current.items[0].cantidad).toBe(10);
  });

  it('modificarCantidad — remueve si cantidad <= 0', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock));
    act(() => result.current.modificarCantidad(1, 0));
    expect(result.current.items).toHaveLength(0);
  });

  it('vaciarCarrito — limpia todos los items', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock));
    act(() => result.current.agregarAlCarrito(productoOfertaMock));
    act(() => result.current.vaciarCarrito());
    expect(result.current.items).toHaveLength(0);
  });

  it('totalItems — suma las cantidades', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock, 3));
    act(() => result.current.agregarAlCarrito(productoOfertaMock, 2));
    expect(result.current.totalItems).toBe(5);
  });

  it('totalPrecio — usa precio_oferta cuando existe', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoOfertaMock, 2));
    expect(result.current.totalPrecio).toBe(1200);
  });

  it('totalPrecio — usa precio regular si no hay oferta', () => {
    const { result } = renderHook(() => useCarrito(), { wrapper });
    act(() => result.current.agregarAlCarrito(productoMock, 3));
    expect(result.current.totalPrecio).toBe(4500);
  });
});
