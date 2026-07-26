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
const Card = ({ producto, onDelete }) => {
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
  const cuotas = { cuotas: 6, monto: Math.round(precioEfectivo / 6) };
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
      className="relative w-[245px] h-[333px] bg-dark-blue border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
      {isAdmin && (
        <div
          className="absolute top-2 right-2 z-10 flex gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span
            className="flex items-center justify-center w-7 h-7 rounded-full bg-dark-blue/90 border border-white/20 text-dark-muted hover:text-white hover:bg-blue-600 hover:border-blue-500 transition-colors cursor-pointer"
            title="Editar producto"
          >
            <PencilIcon />
          </span>
          <span
            onClick={handleDelete}
            className="flex items-center justify-center w-7 h-7 rounded-full bg-dark-blue/90 border border-white/20 text-dark-muted hover:text-red-400 hover:bg-red-500/20 hover:border-red-500 transition-colors cursor-pointer"
            title="Eliminar producto"
          >
            <TrashIcon />
          </span>
        </div>
      )}

      <div className="h-[60%] w-full bg-white/5 flex items-center justify-center p-3">
        <img
          src={imagen}
          alt={nombre}
          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      <div className="h-[40%] w-full p-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <h3 className="text-dark-text font-body text-sm font-medium leading-tight line-clamp-2 flex-1">
            {nombre}
          </h3>
        </div>

        <p className="text-dark-muted text-xs">{marcaNombre}</p>

        <div className="flex flex-col gap-1">
          {precioOferta ? (
            <p className="text-dark-muted text-xs line-through">
              ${precioRegular.toLocaleString('es-AR')}
            </p>
          ) : (
            <p className="text-dark-muted text-xs">&nbsp;</p>
          )}
          <p className="text-blue-400 font-semibold text-sm">
            ${precioEfectivo.toLocaleString('es-AR')}
            <span className="text-dark-muted text-xs font-normal ml-1">efectivo</span>
          </p>
          <p className="text-dark-text text-xs">
            {cuotas.cuotas}x de ${cuotas.monto.toLocaleString('es-AR')}
            <span className="text-dark-muted">/mes</span>
          </p>
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            agregarAlCarrito(productoParaCarrito);
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-1.5 rounded-lg transition-colors duration-200 cursor-pointer mt-auto"
          aria-label={`Agregar ${nombre} al carrito`}
        >
          Agregar
        </button>
      </div>
    </Link>
  );
};

export default Card;
