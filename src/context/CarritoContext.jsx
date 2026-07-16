/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const CarritoContext = createContext();

function cargarDesdeStorage() {
  try {
    const guardado = localStorage.getItem('carrito');
    return guardado ? JSON.parse(guardado) : [];
  } catch {
    return [];
  }
}

export function CarritoProvider({ children }) {
  const [items, setItems] = useState(cargarDesdeStorage);

  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setItems((prev) => {
      const existente = prev.find((i) => i.producto.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [...prev, { producto, cantidad }];
    });
  };

  const removerDelCarrito = (productoId) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  };

  const modificarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removerDelCarrito(productoId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.producto.id === productoId ? { ...i, cantidad } : i
      )
    );
  };

  const vaciarCarrito = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.cantidad, 0);
  const totalPrecio = items.reduce(
    (sum, i) =>
      sum +
      (Number(i.producto.precio_oferta) || Number(i.producto.precio)) *
        i.cantidad,
    0
  );

  return (
    <CarritoContext.Provider
      value={{
        items,
        agregarAlCarrito,
        removerDelCarrito,
        modificarCantidad,
        vaciarCarrito,
        totalItems,
        totalPrecio,
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error('useCarrito debe usarse dentro de CarritoProvider');
  return ctx;
}
