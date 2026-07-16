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
        className="w-full pl-4 pr-10 py-2 rounded-md border border-white/20 bg-white/10 text-dark-text placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-muted pointer-events-none">
        🔍
      </span>

      {abierto && (
        <div className="absolute left-0 right-0 mt-1 bg-dark-blue border border-white/20 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
          {resultados.length > 0 ? (
            <ul>
              {resultados.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/producto/${p.id}`}
                    onClick={() => setTermino('')}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={p.imagenes?.[0] || '/placeholder.jpg'}
                      alt={p.nombre}
                      className="w-10 h-10 object-contain rounded bg-white/5 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-dark-text text-sm font-medium truncate">
                        {p.nombre}
                      </p>
                      <p className="text-dark-muted text-xs">
                        {p.marcas?.nombre}
                      </p>
                    </div>
                    <span className="text-blue-400 text-sm font-semibold flex-shrink-0">
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
            <p className="text-dark-muted text-sm text-center py-6">
              No se encontraron productos para &quot;{debouncedTermino}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Busq;
