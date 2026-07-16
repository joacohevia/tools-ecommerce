import { useEffect, useState } from 'react';
// useEffect: ejecuta codigo cuando el componente se monta o cambian dependencias
// useState: crea variables de estado que React observa para re-renderizar
import { Link, useParams } from 'react-router-dom';
// Link: crea enlaces SPA sin recargar la pagina
// useParams: lee parametros dinamicos de la URL (ej: /producto/:id)
import { useCarrito } from '../../context/CarritoContext';
// hook personalizado para acceder al estado global del carrito (agregar, quitar, vaciar)
import { getProductoById } from '../../http';
import SeccionDescripcion from '../secciones/seccionDescripcion';

const CardDetail = () => {
   const { id } = useParams();
  // extrae el parametro :id de la URL actual (ej: /producto/5 → id = "5")

  const { agregarAlCarrito } = useCarrito();
  // obtiene la funcion para agregar productos al carrito desde el contexto global

  const [producto, setProducto] = useState(null);
  // estado que guarda el objeto completo del producto recibido de la API (null = aun no cargado)

  const [loading, setLoading] = useState(true);
  // estado que indica si se esta esperando la respuesta de la API (true = cargando)

  const [error, setError] = useState(null);
  // estado que guarda el mensaje de error si falla la llamada a la API (null = sin error)

  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  // estado que guarda la URL de la imagen que se muestra en grande en la galeria
  useEffect(() => {
    let ignore = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    getProductoById(id)
      .then((data) => {
        if (ignore) return;
        setProducto(data);
        // guarda el objeto producto completo en el estado para renderizarlo
        setImagenSeleccionada(data.imagenes?.[0] || null);
      })
      .catch((err) => {
        if (ignore) return;
        setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-dark-muted text-lg">Cargando producto...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-red-400 text-lg">Error: {error}</p>
        <Link to="/home" className="text-blue-400 hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </main>
    );
  }

  if (!producto) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-dark-muted text-lg">Producto no encontrado</p>
        <Link to="/home" className="text-blue-400 hover:underline mt-4 inline-block">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const precioRegular = Number(producto.precio) || 0;
  const precioOferta = producto.precio_oferta
    ? Number(producto.precio_oferta)
    : null;
  const precioEfectivo = precioOferta || precioRegular;
  const cuota = Math.round(precioEfectivo / 6);
  const imagenes = producto.imagenes?.length ? producto.imagenes : [];

  const productoParaCarrito = {
    id: producto.id,
    nombre: producto.nombre,
    precio: precioRegular,
    precio_oferta: precioOferta,
    marcaNombre: producto.marcas?.nombre || '',
    imagen: imagenes[0] || '/placeholder.jpg',
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <nav className="text-sm text-dark-muted mb-6" aria-label="Breadcrumb">
        <Link to="/home" className="hover:text-blue-400 transition-colors">
          Inicio
        </Link>
        <span className="mx-2 text-dark-muted/60">/</span>
        <Link to="/" className="hover:text-blue-400 transition-colors">
          Productos
        </Link>
        <span className="mx-2 text-dark-muted/60">/</span>
        <Link
          to={`/?categoria=${producto.categorias?.slug || ''}`}
          className="hover:text-blue-400 transition-colors"
        >
          {producto.categorias?.nombre || 'Categoria'}
        </Link>
        <span className="mx-2 text-dark-muted/60">/</span>
        <span className="text-dark-text">{producto.nombre}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {imagenes.length > 1 &&
            imagenes.map((img, i) => (
              <button
                key={i}
                onClick={() => setImagenSeleccionada(img)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer transition-colors ${
                  imagenSeleccionada === img
                    ? 'border-blue-500'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <img
                  src={img}
                  alt={`${producto.nombre} - vista ${i + 1}`}
                  className="w-full h-full object-contain bg-white/5"
                />
              </button>
            ))}
        </div>

        <div className="flex-1 order-1 md:order-2 bg-white/5 rounded-xl p-6 flex items-center justify-center min-h-[300px]">
          <img
            src={imagenSeleccionada || '/placeholder.jpg'}
            alt={producto.nombre}
            className="w-full max-w-[450px] h-auto object-contain rounded"
          />
        </div>

        <div className="md:w-72 order-3 flex flex-col">
          <h1 className="text-dark-text text-2xl font-bold mb-1">
            {producto.nombre}
          </h1>
          <p className="text-dark-muted text-sm mb-4">
            Marca: {producto.marcas?.nombre}
          </p>

          <div className="space-y-2 mb-6">
            {precioOferta && (
              <p className="text-dark-muted text-lg line-through">
                ${precioRegular.toLocaleString('es-AR')}
              </p>
            )}
            <p className="text-blue-400 text-3xl font-bold">
              ${precioEfectivo.toLocaleString('es-AR')}
              <span className="text-dark-muted text-sm font-normal ml-2">
                efectivo
              </span>
            </p>
            <p className="text-dark-text text-sm">
              6x de ${cuota.toLocaleString('es-AR')}
              <span className="text-dark-muted">/mes</span>
            </p>
            <p className="text-dark-muted text-sm">
              Stock: {producto.stock ?? 0} unidades
            </p>
          </div>

          <button
            onClick={() => agregarAlCarrito(productoParaCarrito)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Agregar al carrito
          </button>
        </div>
      </div>

      <SeccionDescripcion />
    </main>
  );
};

export default CardDetail;




