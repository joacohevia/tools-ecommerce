import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import fotoLogo from '../../public/Logo.jpg';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { getCategorias } from '../http';
import Busq from './busq';

const Nav = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const categoriaRef = useRef(null);
  const usuarioRef = useRef(null);
  const carritoRef = useRef(null);

  const {
    items,
    modificarCantidad,
    vaciarCarrito,
    totalItems,
    totalPrecio,
  } = useCarrito();

  const { user, perfil, logout } = useAuth();

  useEffect(() => {
    getCategorias().then(setCategorias).catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriaRef.current && !categoriaRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
      if (usuarioRef.current && !usuarioRef.current.contains(e.target)) {
        setMenuUsuarioAbierto(false);
      }
      if (carritoRef.current && !carritoRef.current.contains(e.target)) {
        setCarritoAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-dark-blue w-full border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between py-1 space-x-10">
          <Link to="/home" className="flex-shrink-0">
            <img src={fotoLogo} alt="Logo" className="h-20 w-auto object-contain" />
          </Link>

          <Busq />

          <div className="flex space-x-16 flex-shrink-0">
            <div className="relative" ref={usuarioRef}>
              <button
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                className="text-dark-text hover:text-blue-400 transition-transform hover:scale-120 cursor-pointer text-xl"
                aria-expanded={menuUsuarioAbierto}
                aria-haspopup="true"
              >
                👤
              </button>

              {menuUsuarioAbierto && (
                <ul className="absolute right-0 mt-2 w-44 bg-black border border-white/20 rounded-md shadow-lg z-50">
                  {user ? (
                    <>
                      <li className="px-4 py-2 text-dark-text text-sm border-b border-white/10 truncate">
                        {perfil?.nombre
                          ? `Hola, ${perfil.nombre}`
                          : user.email}
                      </li>
                      {perfil?.rol === 'admin' && (
                        <li>
                          <span className="block w-full text-left px-4 py-2 text-dark-muted text-xs">
                            Administrador
                          </span>
                        </li>
                      )}
                      <li>
                        <button
                          onClick={() => { logout(); setMenuUsuarioAbierto(false); }}
                          className="block w-full text-left px-4 py-2 text-dark-text hover:bg-white/10 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          Cerrar sesión
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <button
                          onClick={() => { navigate('/login'); setMenuUsuarioAbierto(false); }}
                          className="block w-full text-left px-4 py-2 text-dark-text hover:bg-white/10 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          Iniciar sesión
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { navigate('/registro'); setMenuUsuarioAbierto(false); }}
                          className="block w-full text-left px-4 py-2 text-dark-text hover:bg-white/10 hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          Quiero registrarme
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              )}
            </div>

            <div className="relative" ref={carritoRef}>
              <button
                onClick={() => setCarritoAbierto(!carritoAbierto)}
                className="relative text-dark-text hover:text-blue-400 transition-transform hover:scale-120 cursor-pointer text-xl"
                aria-expanded={carritoAbierto}
                aria-haspopup="true"
              >
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {carritoAbierto && (
                <div className="absolute right-0 mt-2 w-80 bg-black border border-white/20 rounded-md shadow-lg z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-dark-text font-semibold text-sm">Tu Carrito</h3>
                    <button
                      onClick={() => setCarritoAbierto(false)}
                      className="text-dark-muted hover:text-dark-text text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-dark-muted text-sm py-6 text-center">
                      No hay productos en el carrito
                    </p>
                  ) : (
                    <>
                      <ul className="space-y-3 max-h-72 overflow-y-auto">
                        {items.map(({ producto, cantidad }) => (
                          <li
                            key={producto.id}
                            className="flex gap-3 border-b border-white/10 pb-3"
                          >
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="w-12 h-12 object-contain rounded bg-white/5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-dark-text text-sm font-medium truncate">
                                {producto.nombre}
                              </p>
                              <p className="text-dark-muted text-xs">
                                {producto.marcaNombre}
                              </p>
                              <div className="flex items-baseline gap-2 mt-1">
                                {producto.precio_oferta ? (
                                  <>
                                    <span className="text-dark-muted text-xs line-through">
                                      ${Number(producto.precio).toLocaleString('es-AR')}
                                    </span>
                                    <span className="text-blue-400 text-sm font-semibold">
                                      ${Number(producto.precio_oferta).toLocaleString('es-AR')}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-blue-400 text-sm font-semibold">
                                    ${Number(producto.precio).toLocaleString('es-AR')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() =>
                                    modificarCantidad(producto.id, cantidad - 1)
                                  }
                                  className="w-5 h-5 flex items-center justify-center rounded text-dark-muted hover:text-dark-text hover:bg-white/10 text-xs cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="text-dark-text text-xs tabular-nums w-4 text-center">
                                  {cantidad}
                                </span>
                                <button
                                  onClick={() =>
                                    modificarCantidad(producto.id, cantidad + 1)
                                  }
                                  className="w-5 h-5 flex items-center justify-center rounded text-dark-muted hover:text-dark-text hover:bg-white/10 text-xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="border-t border-white/10 mt-3 pt-3">
                        <p className="text-dark-text text-sm font-semibold">
                          Total: ${totalPrecio.toLocaleString('es-AR')}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={vaciarCarrito}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-medium py-1.5 rounded-md cursor-pointer transition-colors"
                          >
                            Vaciar
                          </button>
                          <button
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm font-medium py-1.5 rounded-md cursor-pointer transition-colors"
                          >
                            Comprar
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="border-t border-white/10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 mt-4">
          <ul className="flex flex-wrap justify-center space-x-16 py-3 text-sm font-medium">
            <li>
              <Link to="/home" className="text-dark-text hover:text-blue-400 transition-colors font-body">
                Inicio
              </Link>
            </li>

            <li className="relative" ref={categoriaRef}>
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="inline-flex items-center text-dark-text hover:text-blue-400 transition-colors font-body cursor-pointer select-none"
                aria-expanded={menuAbierto}
                aria-haspopup="true"
              >
                Categoria
                <svg
                  className={`ml-1 w-4 h-4 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                </svg>
              </button>

              {menuAbierto && categorias.length > 0 && (
                <ul className="absolute left-0 mt-2 w-40 bg-black border border-white/20 rounded-md shadow-lg z-50">
                  {categorias.map((cat) => (
                    <li key={cat.id}>
                      <button
                        className="block w-full text-left px-4 py-2 text-dark-text hover:bg-white/10 hover:text-blue-400 transition-colors cursor-pointer"
                        onClick={() => {
                          navigate(`/productos?categoria=${cat.slug}`);
                          setMenuAbierto(false);
                        }}
                      >
                        {cat.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li><Link to="/productos" className="text-dark-text hover:text-blue-400 transition-colors font-body">Producto</Link></li>
            <li><Link to="/contacto" className="text-dark-text hover:text-blue-400 transition-colors font-body">Contacto</Link></li>
            {perfil?.rol === 'admin' && (
              <li><Link to="/admin" className="text-dark-text hover:text-blue-400 transition-colors font-body">Admin</Link></li>
            )}
            {/*<li><Link to="/" className="text-dark-text hover:text-blue-400 transition-colors font-body">Quienes Somos</Link></li> */}
          </ul>
        </nav>

      </div>
    </header>
  );
};

export default Nav;
