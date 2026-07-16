import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCategorias, getMarcas, getProductos } from '../../http';
import Card from '../card';
import Filtrado from '../filtrado';

const ORDEN_OPCIONES = [
  { value: 'mas_vendido', label: 'Más vendidos' },
  { value: 'nombre_asc', label: 'Nombre (A-Z)' },
  { value: 'nombre_desc', label: 'Nombre (Z-A)' },
  { value: 'precio_asc', label: 'Precio (Menor a Mayor)' },
  { value: 'precio_desc', label: 'Precio (Mayor a Menor)' },
  { value: 'destacado', label: 'Destacados' },
];

/**
 * Aplica los filtros seleccionados y ordena la lista de productos.
 *
 * Estrategia: filtrado y ordenamiento 100% en cliente mediante useMemo.
 * Se eligió este enfoque porque el backend no soporta:
 *  - Selección múltiple de marcas/categorías
 *  - Filtro por rango de precios
 *  - Orden dinámico
 * El catálogo es de tamaño acotado (ferretería local), por lo que
 * un solo fetch inicial es suficiente y eficiente.
 *
 * @param {Array}  productos          - Lista cruda de productos desde la API
 * @param {number[]} selectedMarcas    - IDs de marcas tildadas
 * @param {number[]} selectedCategorias - IDs de categorías tildadas
 * @param {string} precioMin           - Valor string del input mínimo
 * @param {string} precioMax           - Valor string del input máximo
 * @param {string} sortBy              - Clave de orden (ver ORDEN_OPCIONES)
 * @returns {Array} Productos filtrados y ordenados
 */
function filtrarYOrdenar(productos, selectedMarcas, selectedCategorias, precioMin, precioMax, sortBy) {
  let resultado = [...productos];

  if (selectedMarcas.length > 0) {
    resultado = resultado.filter((p) => selectedMarcas.includes(p.marca_id));
  }

  if (selectedCategorias.length > 0) {
    resultado = resultado.filter((p) => selectedCategorias.includes(p.categoria_id));
  }

  const min = precioMin !== '' ? Number(precioMin) : null;
  const max = precioMax !== '' ? Number(precioMax) : null;
  if (min !== null || max !== null) {
    resultado = resultado.filter((p) => {
      const efectivo = Number(p.precio_oferta) || Number(p.precio);
      if (min !== null && efectivo < min) return false;
      if (max !== null && efectivo > max) return false;
      return true;
    });
  }

  resultado.sort((a, b) => {
    const precioA = Number(a.precio_oferta) || Number(a.precio);
    const precioB = Number(b.precio_oferta) || Number(b.precio);

    switch (sortBy) {
      case 'nombre_asc':
        return a.nombre.localeCompare(b.nombre, 'es');
      case 'nombre_desc':
        return b.nombre.localeCompare(a.nombre, 'es');
      case 'precio_asc':
        return precioA - precioB;
      case 'precio_desc':
        return precioB - precioA;
      case 'destacado':
        if (a.destacado && !b.destacado) return -1;
        if (!a.destacado && b.destacado) return 1;
        return a.nombre.localeCompare(b.nombre, 'es');
      case 'mas_vendido':
      default:
        if (a.mas_vendido && !b.mas_vendido) return -1;
        if (!a.mas_vendido && b.mas_vendido) return 1;
        return a.nombre.localeCompare(b.nombre, 'es');
    }
  });

  return resultado;
}

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMarcas, setSelectedMarcas] = useState([]);
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [sortBy, setSortBy] = useState('mas_vendido');

  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function cargar() {
      try {
        const [prodData, catData, marcaData] = await Promise.all([
          getProductos(),
          getCategorias(),
          getMarcas(),
        ]);
        setProductos(prodData);
        setCategorias(catData);
        setMarcas(marcaData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    cargar();
  }, []);

  useEffect(() => {
    const slug = searchParams.get('categoria');
    if (slug && categorias.length > 0) {
      const cat = categorias.find((c) => c.slug === slug);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (cat) setSelectedCategorias([cat.id]);
    }
  }, [searchParams, categorias]);

  const productosFiltrados = useMemo(
    () => filtrarYOrdenar(productos, selectedMarcas, selectedCategorias, precioMin, precioMax, sortBy),
    [productos, selectedMarcas, selectedCategorias, precioMin, precioMax, sortBy]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-dark-muted text-lg">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-400 text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-dark-muted mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/home" className="hover:text-dark-text transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-dark-text font-medium">Productos</li>
        </ol>
      </nav>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-dark-muted text-sm">
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="ordenar" className="text-dark-text text-sm font-medium whitespace-nowrap">
            Ordenar por:
          </label>
          <select
            id="ordenar"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-black border border-white/10 rounded-lg px-3 py-2 text-dark-text text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {ORDEN_OPCIONES.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Filtrado
            marcas={marcas}
            categorias={categorias}
            selectedMarcas={selectedMarcas}
            setSelectedMarcas={setSelectedMarcas}
            selectedCategorias={selectedCategorias}
            setSelectedCategorias={setSelectedCategorias}
            precioMin={precioMin}
            setPrecioMin={setPrecioMin}
            precioMax={precioMax}
            setPrecioMax={setPrecioMax}
          />
        </div>

        {/* Grid de productos */}
        <div className="flex-1">
          {productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-dark-muted text-lg mb-2">No se encontraron productos</p>
              <p className="text-dark-muted text-sm">Probá ajustando los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(245px,1fr))] gap-4 justify-items-center">
              {productosFiltrados.map((producto) => (
                <Card key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
