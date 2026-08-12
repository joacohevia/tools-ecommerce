import { calcularPaginas } from '../lib/utils';

/**
 * Paginador responsive con números de página (elipsis en saltos) y
 * botones Anterior / Siguiente.
 *
 * @param {object} props
 * @param {number} props.pagina - Página actual (1-indexada)
 * @param {number} props.totalPaginas - Total de páginas
 * @param {(n: number) => void} props.onChange - Callback al elegir una página
 * @returns {JSX.Element|null}
 */
export default function Paginador({ pagina, totalPaginas, onChange }) {
  if (totalPaginas <= 1) return null;

  const paginas = calcularPaginas(pagina, totalPaginas);

  const btnNav = 'px-3 py-1.5 rounded-md border border-outline-variant text-on-surface-variant text-sm hover:text-primary hover:border-primary transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer';

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 mt-8" aria-label="Paginación">
      <button
        type="button"
        onClick={() => onChange(pagina - 1)}
        disabled={pagina === 1}
        className={btnNav}
      >
        ‹ Anterior
      </button>

      {paginas.map((item, idx) =>
        item === '…' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-on-surface-variant text-sm select-none">
            …
          </span>
        ) : (
          <button
            type="button"
            key={item}
            onClick={() => onChange(item)}
            disabled={item === pagina}
            aria-current={item === pagina ? 'page' : undefined}
            className={`w-9 h-9 rounded-md text-sm transition-colors ${
              item === pagina
                ? 'bg-primary text-on-primary font-semibold cursor-default'
                : 'text-on-surface-variant hover:bg-surface-container-high cursor-pointer'
            }`}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onChange(pagina + 1)}
        disabled={pagina === totalPaginas}
        className={btnNav}
      >
        Siguiente ›
      </button>
    </nav>
  );
}
