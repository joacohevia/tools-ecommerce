import { Listbox } from '@headlessui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { deleteCategoria, deleteMarca, getCategorias, getMarcas, getProductos } from '../../http';
import Card from '../card';
import Filtrado from '../filtrado';
import CategForm from '../form/categForm';
import MarcaForm from '../form/marcaForm';
import ProductForm from '../form/productForm';
import Paginador from '../paginador';
import WhatsAppButton from '../whatsappButton';


const ORDEN_OPCIONES = [
  { value: 'mas_vendido', label: 'Más vendidos' },
  { value: 'nombre_asc', label: 'Nombre (A-Z)' },
  { value: 'nombre_desc', label: 'Nombre (Z-A)' },
  { value: 'precio_asc', label: 'Precio (Menor a Mayor)' },
  { value: 'precio_desc', label: 'Precio (Mayor a Menor)' },
  { value: 'destacado', label: 'Destacados' },
];

const PRODUCTOS_POR_PAGINA = 30;

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
function ChevronDownIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export default function Productos() {
  const { perfil } = useAuth();
  const { confirm } = useConfirm();
  const { toast } = useToast();
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

  const [showForm, setShowForm] = useState(null);
  const [editProducto, setEditProducto] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [pagina, setPagina] = useState(1);
  const gridRef = useRef(null);

  const [searchParams] = useSearchParams();

  const cargarProductos = async () => {
    try {
      const prodData = await getProductos();
      setProductos(prodData);
    } catch {
      // silent — el estado de error general ya se maneja
    }
  };

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

  useEffect(() => {
    if (showForm) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showForm]);

  const productosFiltrados = useMemo(
    () => filtrarYOrdenar(productos, selectedMarcas, selectedCategorias, precioMin, precioMax, sortBy),
    [productos, selectedMarcas, selectedCategorias, precioMin, precioMax, sortBy]
  );

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const productosPaginados = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);

  const actualizarMarcas = (updater) => { setSelectedMarcas(updater); setPagina(1); };
  const actualizarCategorias = (updater) => { setSelectedCategorias(updater); setPagina(1); };
  const actualizarPrecioMin = (val) => { setPrecioMin(val); setPagina(1); };
  const actualizarPrecioMax = (val) => { setPrecioMax(val); setPagina(1); };
  const actualizarSort = (val) => { setSortBy(val); setPagina(1); };

  const cambiarPagina = (nuevaPagina) => {
    setPagina(nuevaPagina);
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-on-surface-variant text-lg">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-error text-lg">Error: {error}</p>
      </div>
    );
  }

  return (
    <>
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-20 md:py-15 flex-1">
      {/* Breadcrumb */}
      <nav className="text-sm text-on-surface-variant py-3 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/home" className="hover:text-on-surface transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-on-surface font-medium">Productos</li>
        </ol>
      </nav>

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-on-surface-variant text-sm">
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''}
        </p>

        <div className="flex items-center gap-3">
          {perfil?.rol === 'admin' && (
            <>
              <button
                onClick={() => { setEditProducto(null); setShowForm('producto'); }}
                className="btn-primary py-1.5 text-sm"
              >
                + Agregar producto
              </button>
              <button
                onClick={() => setShowForm('categoria')}
                className="btn-primary py-1.5 text-sm"
              >
                + Agregar categoria
              </button>
              <button
                onClick={() => setShowForm('marca')}
                className="btn-primary py-1.5 text-sm"
              >
                + Agregar marca
              </button>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-4">
            <label className="text-on-surface text-sm font-medium whitespace-nowrap">
              Ordenar por: 
            </label>
            <Listbox value={sortBy} onChange={actualizarSort}>
              <div className="relative w-full sm:w-full">
                <Listbox.Button className="select w-full sm:w-48 text-base sm:text-sm py-2 sm:py-0 flex items-center justify-between gap-2 text-left">
                  {({ open }) => (
                    <>
                      <span>{ORDEN_OPCIONES.find((op) => op.value === sortBy)?.label}</span>
                      <ChevronDownIcon className={`w-4 h-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </Listbox.Button>
                <Listbox.Options className="absolute z-30 mt-1 w-full sm:w-48 rounded-md bg-surface-container-lowest border border-outline-variant shadow-lg">
                  {ORDEN_OPCIONES.map((op) => (
                    <Listbox.Option
                      key={op.value}
                      value={op.value}
                      className={({ active }) =>
                        `px-3 py-2.5 sm:py-1.5 text-base sm:text-sm cursor-pointer ${
                          active ? 'bg-primary-container text-on-primary-container' : 'text-on-surface'
                        }`
                      }
                    >
                      {op.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="btn-secondary text-sm py-1.5 md:hidden"
          >
            Filtros
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="hidden md:block w-full md:w-64 flex-shrink-0">
          <Filtrado
            marcas={marcas}
            categorias={categorias}
            selectedMarcas={selectedMarcas}
            setSelectedMarcas={actualizarMarcas}
            selectedCategorias={selectedCategorias}
            setSelectedCategorias={actualizarCategorias}
            precioMin={precioMin}
            setPrecioMin={actualizarPrecioMin}
            precioMax={precioMax}
            setPrecioMax={actualizarPrecioMax}
          />
        </div>

        {/* Grid de productos */}
        <div className="flex-1 scroll-mt-24" ref={gridRef}>
          {productosFiltrados.length === 0 ? (
            <div className="py-20">
              <p className="text-on-surface-variant text-lg mb-2">No se encontraron productos</p>
              <p className="text-on-surface-variant text-sm">Probá ajustando los filtros</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-gutter justify-items-center">
              {productosPaginados.map((producto) => (
                <Card
                  key={producto.id}
                  producto={producto}
                  onDelete={(id) => setProductos((prev) => prev.filter((p) => p.id !== id))}
                  onEdit={(p) => { setEditProducto(p); setShowForm('producto'); }}
                />
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <Paginador
              pagina={paginaActual}
              totalPaginas={totalPaginas}
              onChange={cambiarPagina}
            />
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {showFilters && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setShowFilters(false)}
          aria-hidden={!showFilters}
        >
          <div
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-in md:hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-outline-variant bg-surface-container-lowest">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-2 -ml-2 text-on-surface hover:text-primary"
                aria-label="Cerrar filtros"
              >
                ✕
              </button>
              <h2 className="text-headline-sm font-headline text-on-surface">Filtros</h2>
              <div className="w-8" />
            </div>
            <div className="p-4">
              <Filtrado
                marcas={marcas}
                categorias={categorias}
                selectedMarcas={selectedMarcas}
                setSelectedMarcas={actualizarMarcas}
                selectedCategorias={selectedCategorias}
                setSelectedCategorias={actualizarCategorias}
                precioMin={precioMin}
                setPrecioMin={actualizarPrecioMin}
                precioMax={precioMax}
                setPrecioMax={actualizarPrecioMax}
              />
            </div>
          </div>
        </div>
      )}

      {showForm === 'producto' && (
        <div className="modal-overlay" onClick={() => setShowForm(null)}>
          <div className="modal-panel w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <ProductForm
              producto={editProducto}
              onSaved={() => { setShowForm(null); setEditProducto(null); cargarProductos(); }}
            />
          </div>
        </div>
      )}

      {showForm === 'categoria' && (
        <ModalCategorias
          categorias={categorias}
          onClose={() => setShowForm(null)}
          onRefresh={async () => {
            try { const d = await getCategorias(); setCategorias(d); } catch { /* skip */ }
          }}
          confirm={confirm}
          toast={toast}
        />
      )}

      {showForm === 'marca' && (
        <ModalMarcas
          marcas={marcas}
          onClose={() => setShowForm(null)}
          onRefresh={async () => {
            try { const d = await getMarcas(); setMarcas(d); } catch { /* skip */ }
          }}
          confirm={confirm}
          toast={toast}
        />
      )}

    </main>
      <WhatsAppButton />
    </>
  );
}

function ModalCategorias({ categorias, onClose, onRefresh, confirm, toast }) {
  const [modo, setModo] = useState('lista');
  const [editando, setEditando] = useState(null);

  const handleDelete = async (cat) => {
    const ok = await confirm({ title: 'Eliminar categoria', message: `Eliminar "${cat.nombre}"?`, confirmText: 'Si', cancelText: 'No' });
    if (!ok) return;
    try {
      await deleteCategoria(cat.id);
      toast.success(`"${cat.nombre}" eliminada`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  if (modo === 'crear') return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CategForm onSaved={() => { setModo('lista'); onRefresh(); }} />
      </div>
    </div>
  );

  if (modo === 'editar' && editando) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CategForm key={editando.id} categoria={editando} onSaved={() => { setModo('lista'); setEditando(null); onRefresh(); }} />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-headline text-on-surface">Categorias ({categorias.length})</h2>
          <button onClick={() => setModo('crear')} className="btn-primary py-1 text-sm">+ Nueva</button>
        </div>
        {categorias.length === 0 ? (
          <p className="text-on-surface-variant text-center py-4">No hay categorias.</p>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {categorias.map((cat) => (
              <li key={cat.id} className="flex items-center justify-between px-3 py-2 bg-surface-container rounded hover:bg-surface-container-high">
                <div><span className="text-on-surface text-sm">{cat.nombre}</span><span className="text-on-surface-variant text-xs ml-2">{cat.slug}</span></div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditando(cat); setModo('editar'); }} className="text-on-surface-variant hover:text-primary px-2 cursor-pointer text-sm" title="Editar">✏️</button>
                  <button onClick={() => handleDelete(cat)} className="text-on-surface-variant hover:text-error px-2 cursor-pointer text-sm" title="Eliminar">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ModalMarcas({ marcas, onClose, onRefresh, confirm, toast }) {
  const [modo, setModo] = useState('lista');
  const [editando, setEditando] = useState(null);

  const handleDelete = async (mar) => {
    const ok = await confirm({ title: 'Eliminar marca', message: `Eliminar "${mar.nombre}"?`, confirmText: 'Si', cancelText: 'No' });
    if (!ok) return;
    try {
      await deleteMarca(mar.id);
      toast.success(`"${mar.nombre}" eliminada`);
      onRefresh();
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    }
  };

  if (modo === 'crear') return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <MarcaForm onSaved={() => { setModo('lista'); onRefresh(); }} />
      </div>
    </div>
  );

  if (modo === 'editar' && editando) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <MarcaForm key={editando.id} marca={editando} onSaved={() => { setModo('lista'); setEditando(null); onRefresh(); }} />
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-headline text-on-surface">Marcas ({marcas.length})</h2>
          <button onClick={() => setModo('crear')} className="btn-primary py-1 text-sm">+ Nueva</button>
        </div>
        {marcas.length === 0 ? (
          <p className="text-on-surface-variant text-center py-4">No hay marcas.</p>
        ) : (
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {marcas.map((mar) => (
              <li key={mar.id} className="flex items-center justify-between px-3 py-2 bg-surface-container rounded hover:bg-surface-container-high">
                <span className="text-on-surface text-sm">{mar.nombre}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditando(mar); setModo('editar'); }} className="text-on-surface-variant hover:text-primary px-2 cursor-pointer text-sm" title="Editar">✏️</button>
                  <button onClick={() => handleDelete(mar)} className="text-on-surface-variant hover:text-error px-2 cursor-pointer text-sm" title="Eliminar">🗑️</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
