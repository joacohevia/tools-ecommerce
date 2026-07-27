import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import { deleteProducto } from '../http';

/**
 * Icono SVG de lápiz — botón Editar (admin).
 */
function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

/**
 * Icono SVG de tacho — botón Eliminar (admin).
 */
function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

/**
 * Card de producto — componente reutilizable en grid, carruseles y secciones.
 *
 * Muestra imagen, nombre, marca, precio (con oferta si aplica), cuotas
 * y botón "Agregar al carrito". Si el usuario logueado es admin, renderiza
 * botones de editar (navega al detalle) y eliminar (confirma vía ConfirmDialog,
 * ejecuta deleteProducto, muestra toast de resultado).
 *
 * @param {{ producto, onDelete }} props
 * @param {object}  props.producto  - Objeto del producto (id, nombre, precio, imagenes, marcas, etc.)
 * @param {function} [props.onDelete] - Callback opcional tras eliminar, recibe (id) para refrescar el padre
 * @returns {JSX.Element}
 */
const Card = ({ producto, onDelete, onEdit }) => {
  const { agregarAlCarrito } = useCarrito();
  const { perfil } = useAuth();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const isAdmin = perfil?.rol === 'admin';

  const imagen = producto.imagenes?.[0] || '/placeholder.jpg';
  const nombre = producto.nombre || 'Producto sin nombre';
  const precioRegular = Number(producto.precio) || 0;
  const precioOferta = producto.precio_oferta ? Number(producto.precio_oferta) : null;
  const precioEfectivo = precioOferta || precioRegular;
  const marcaNombre = producto.marcas?.nombre || '';

  const productoParaCarrito = {
    id: producto.id,
    nombre,
    precio: precioRegular,
    precio_oferta: precioOferta,
    marcaNombre,
    imagen,
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = await confirm({
      title: 'Eliminar producto',
      message: `¿Seguro que querés eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;
    try {
      await deleteProducto(producto.id);
      onDelete?.(producto.id);
      toast.success(`"${nombre}" eliminado correctamente`);
    } catch (err) {
      toast.error(err.message || 'Error al eliminar el producto');
    }
  };

  return (
  <Link
    to={`/producto/${producto.id}`}
    className="relative w-[260px] h-[380px] bg-dark-blue border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
  >
    {isAdmin && (
      <div
        className="absolute top-3 right-3 z-20 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit?.(producto);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-blue/90 border border-white/20 text-dark-muted hover:bg-blue-600 hover:text-white transition-colors"
          title="Editar producto"
        >
          <PencilIcon />
        </button>

        <button
          onClick={handleDelete}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-blue/90 border border-white/20 text-dark-muted hover:bg-red-600 hover:text-white transition-colors"
          title="Eliminar producto"
        >
          <TrashIcon />
        </button>
      </div>
    )}

    {/* Imagen */}
    <div className="h-1/2 w-full bg-white/5 flex items-center justify-center p-4">
      <img
        src={imagen}
        alt={nombre}
        className="w-40 h-40 object-contain transition-transform duration-300 hover:scale-105"
        loading="lazy"
      />
    </div>
    {/* Información */}
    <div className="flex flex-1 flex-col px-2 py-2 gap-0.5">

      <h3
        className="text-dark-text text-sm font-semibold leading-snug truncate"
        title={nombre}
      >
        {nombre}
      </h3>
      <p className="text-xs text-dark-muted">
        Marca: <span className="text-white">{marcaNombre}</span>
      </p>

      <div className="space-y-1">

        {precioOferta && (
          <p className="text-xs text-dark-muted line-through">
            ${precioRegular.toLocaleString("es-AR")}
          </p>
        )}

        <p className="text-lg font-bold text-blue-400">
          ${precioEfectivo.toLocaleString("es-AR")}
        </p>
        
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          agregarAlCarrito(productoParaCarrito);
        }}
        className="mt-auto w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
      >
        Agregar al carrito
      </button>
    </div>
  </Link>
);
};

export default Card;
