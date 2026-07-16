import { Link } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';

const Card = ({ producto }) => {
  const { agregarAlCarrito } = useCarrito();

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

  return (
    <Link
      to={`/producto/${producto.id}`}
      className="w-[245px] h-[333px] bg-dark-blue border border-white/10 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col"
    >
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
