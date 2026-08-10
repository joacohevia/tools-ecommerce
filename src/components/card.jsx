import { useState } from 'react';
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
  const [added, setAdded] = useState(false);
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
    className="card-shell card-hover w-[185px] sm:w-[260px] h-[280px] sm:h-[380px]"
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
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 border border-outline-variant text-on-surface-variant hover:bg-primary hover:text-on-primary transition-colors"
          title="Editar producto"
        >
          <PencilIcon />
        </button>

        <button
          onClick={handleDelete}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-lowest/90 border border-outline-variant text-on-surface-variant hover:bg-error hover:text-on-error transition-colors"
          title="Eliminar producto"
        >
          <TrashIcon />
        </button>
      </div>
    )}

    {/* Imagen */}
    <div className="h-[40%] sm:h-1/2 w-full overflow-hidden flex-shrink-0">
      <img
        src={imagen}
        alt={nombre}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
    {/* Información */}
    <div className="flex flex-1 flex-col p-2 sm:p-3 gap-0.5 sm:gap-1">

      <h3
        className="text-on-surface text-xs sm:text-sm font-semibold leading-snug line-clamp-2"
        title={nombre}
      >
        {nombre}
      </h3>
      <p className="text-on-surface-variant text-[10px] sm:text-xs uppercase">
        <span>{marcaNombre}</span>
      </p>

      <div className="space-y-0.5 sm:space-y-1">

        {precioOferta && (
          <p className="text-[10px] sm:text-xs text-on-surface-variant line-through">
            ${precioRegular.toLocaleString("es-AR")}
          </p>
        )}

        <p className="font-headline text-base sm:text-headline-md font-semibold text-primary">
          ${precioEfectivo.toLocaleString("es-AR")}
        </p>

      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          setAdded(true);
          agregarAlCarrito(productoParaCarrito);
          setTimeout(() => setAdded(false), 1000);
        }}
        className={`btn-primary btn-primary-sm mt-auto w-full py-1 sm:py-2 text-xs sm:text-sm h-8 sm:h-10 transition-all duration-300 ${
          added ? 'bg-primary-container text-on-primary-container' : ''
        }`}
      >
        {added ? 'Agregado ✓' : 'Agregar al carrito'}
      </button>
    </div>
  </Link>
);
};

export default Card;
