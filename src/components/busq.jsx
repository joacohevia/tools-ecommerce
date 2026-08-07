import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductos } from '../http';

const Busq = () => {
  const [productos, setProductos] = useState([]);
  const [termino, setTermino] = useState('');
  const [debouncedTermino, setDebouncedTermino] = useState('');

  const contenedorRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    getProductos().then(setProductos).catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermino(termino);
    }, 300);
    return () => clearTimeout(timer);
  }, [termino]);

  const term = debouncedTermino.toLowerCase().trim();
  const resultados = term
    ? productos.filter((p) => p.nombre.toLowerCase().includes(term))
    : [];
  const abierto = term.length > 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(e.target)
      ) {
        setTermino('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTermino('');
      inputRef.current?.blur();
    }
  };

  return (
    <div
      ref={contenedorRef}
      className="relative flex-1 max-w-lg hidden sm:block"
    >
      <input
        ref={inputRef}
        type="text"
        value={termino}
        onChange={(e) => setTermino(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Buscar productos..."
        className="input w-full pl-4 pr-10"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
        🔍
      </span>

      {abierto && (
        <div className="absolute left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {resultados.length > 0 ? (
            <ul>
              {resultados.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/producto/${p.id}`}
                    onClick={() => setTermino('')}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
                  >
                    <img
                      src={p.imagenes?.[0] || '/placeholder.jpg'}
                      alt={p.nombre}
                      className="w-10 h-10 object-contain rounded bg-surface-container-low flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-on-surface text-sm font-medium truncate">
                        {p.nombre}
                      </p>
                      <p className="text-on-surface-variant text-xs">
                        {p.marcas?.nombre}
                      </p>
                    </div>
                    <span className="text-primary text-sm font-semibold flex-shrink-0">
                      $
                      {(Number(p.precio_oferta) || Number(p.precio)).toLocaleString(
                        'es-AR'
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-on-surface-variant text-sm text-center py-6">
              No se encontraron productos para &quot;{debouncedTermino}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Busq;
