import { useState } from 'react';

/**
 * Panel lateral de filtros para el catálogo de productos.
 *
 * @param {Object}   props
 * @param {Array}    props.marcas              - Lista de marcas [{ id, nombre }]
 * @param {Array}    props.categorias          - Lista de categorías [{ id, nombre, slug }]
 * @param {number[]} props.selectedMarcas      - IDs de marcas seleccionadas
 * @param {(ids: number[]) => void} props.setSelectedMarcas - Setter de marcas seleccionadas
 * @param {number[]} props.selectedCategorias  - IDs de categorías seleccionadas
 * @param {(ids: number[]) => void} props.setSelectedCategorias - Setter de categorías seleccionadas
 * @param {string}   props.precioMin           - Valor del input de precio mínimo
 * @param {(val: string) => void} props.setPrecioMin - Setter de precio mínimo
 * @param {string}   props.precioMax           - Valor del input de precio máximo
 * @param {(val: string) => void} props.setPrecioMax - Setter de precio máximo
 */
export default function Filtrado({
  marcas,
  categorias,
  selectedMarcas,
  setSelectedMarcas,
  selectedCategorias,
  setSelectedCategorias,
  precioMin,
  setPrecioMin,
  precioMax,
  setPrecioMax,
}) {
  const [marcasAbierto, setMarcasAbierto] = useState(true);
  const [categoriasAbierto, setCategoriasAbierto] = useState(true);

  const toggleMarca = (id) => {
    setSelectedMarcas((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleCategoria = (id) => {
    setSelectedCategorias((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <aside className="w-full bg-surface-container border border-outline-variant rounded-xl p-5 flex flex-col gap-6">
      <h3 className="text-on-surface font-headline text-lg font-semibold border-b border-outline-variant/50 pb-3">
        Productos
      </h3>

      {/* Filtrar por Marca */}
      <div>
        <button
          onClick={() => setMarcasAbierto((prev) => !prev)}
          className="w-full flex items-center justify-between text-on-surface font-medium text-sm mb-3 cursor-pointer"
        >
          <span>Filtrar por Marca</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${marcasAbierto ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {marcasAbierto && (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {marcas.map((marca) => (
              <label
                key={marca.id}
                className="flex items-center gap-2 text-on-surface-variant text-sm cursor-pointer hover:text-on-surface transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedMarcas.includes(marca.id)}
                  onChange={() => toggleMarca(marca.id)}
                  className="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-1 cursor-pointer accent-primary"
                />
                {marca.nombre}
              </label>
            ))}
            {marcas.length === 0 && (
              <p className="text-on-surface-variant text-xs italic">No hay marcas disponibles</p>
            )}
          </div>
        )}
      </div>

      {/* Filtrar por Categoría */}
      <div>
        <button
          onClick={() => setCategoriasAbierto((prev) => !prev)}
          className="w-full flex items-center justify-between text-on-surface font-medium text-sm mb-3 cursor-pointer"
        >
          <span>Filtrar por Categoría</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${categoriasAbierto ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {categoriasAbierto && (
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {categorias.map((cat) => (
              <label
                key={cat.id}
                className="flex items-center gap-2 text-on-surface-variant text-sm cursor-pointer hover:text-on-surface transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategorias.includes(cat.id)}
                  onChange={() => toggleCategoria(cat.id)}
                  className="w-4 h-4 rounded border-outline-variant bg-surface text-primary focus:ring-primary focus:ring-1 cursor-pointer accent-primary"
                />
                {cat.nombre}
              </label>
            ))}
            {categorias.length === 0 && (
              <p className="text-on-surface-variant text-xs italic">No hay categorías disponibles</p>
            )}
          </div>
        )}
      </div>

      {/* Precio */}
      <div>
        <h4 className="text-on-surface font-medium text-sm mb-3">Precio</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={precioMin}
            onChange={(e) => setPrecioMin(e.target.value)}
            className="input"
            min="0"
          />
          <span className="text-on-surface-variant text-sm">-</span>
          <input
            type="number"
            placeholder="Máx"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
            className="input"
            min="0"
          />
        </div>
      </div>
    </aside>
  );
}
