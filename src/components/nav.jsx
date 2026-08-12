import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import fotoLogo from '../../public/Logo.jpg';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { getCategorias } from '../http';
import Busq from './busq';

const NAV_LINKS = [
  { label: 'Inicio', to: '/home', type: 'link' },
  { label: 'Categoria', mobileLabel: 'Categorías', type: 'categories' },
  { label: 'Producto', mobileLabel: 'Productos', to: '/productos', type: 'reload' },
  { label: 'Contacto', to: '/contacto', type: 'link' },
];

const Nav = () => {
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [categorias, setCategorias] = useState([]);

  const categoriaRef = useRef(null);
  const usuarioRef = useRef(null);
  const carritoRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-surface/90 backdrop-blur-md w-full border-b border-outline-variant/30 shadow-sm fixed top-0 z-40">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">

        <div className="flex items-center justify-between h-[72px] gap-6">
          <Link to="/home" className="flex-shrink-0">
            <img src={fotoLogo} alt="Logo" className="h-20 w-auto object-contain" />
          </Link>

          <Busq />

          <div className="flex space-x-16 flex-shrink-0">
            <div className="relative" ref={usuarioRef}>
              <button
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                className="text-on-surface hover:text-primary transition-colors cursor-pointer text-xl"
                aria-expanded={menuUsuarioAbierto}
                aria-haspopup="true"
              >
                👤
              </button>

              {menuUsuarioAbierto && (
                <ul className="absolute right-0 mt-2 w-44 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg z-50">
                  {user ? (
                    <>
                      <li className="px-4 py-2 text-on-surface text-sm border-b border-outline-variant/50 truncate">
                        {perfil?.nombre
                          ? `Hola, ${perfil.nombre}`
                          : user.email}
                      </li>
                      {perfil?.rol === 'admin' && (
                        <li>
                            <span className="block w-full text-left px-4 py-2 text-on-surface-variant text-xs">
                              Administrador
                            </span>
                          </li>
                        )}
                        <li>
                          <button
                            onClick={async () => {
                              await logout();
                              setMenuUsuarioAbierto(false);
                              navigate('/home');
                            }}
                            className="block w-full text-left px-4 py-2 text-on-surface hover:bg-surface-container hover:text-error transition-colors cursor-pointer"
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
                          className="block w-full text-left px-4 py-2 text-on-surface hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
                        >
                          Iniciar sesión
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { navigate('/registro'); setMenuUsuarioAbierto(false); }}
                          className="block w-full text-left px-4 py-2 text-on-surface hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
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
                className="relative text-on-surface hover:text-primary transition-colors cursor-pointer text-xl"
                aria-expanded={carritoAbierto}
                aria-haspopup="true"
              >
                🛒
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-error text-on-error text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {carritoAbierto && (
                <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-on-surface font-semibold text-sm">Tu Carrito</h3>
                    <button
                      onClick={() => setCarritoAbierto(false)}
                      className="text-on-surface-variant hover:text-on-surface text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-on-surface-variant text-sm py-6 text-center">
                      No hay productos en el carrito
                    </p>
                  ) : (
                    <>
                      <ul className="space-y-3 max-h-72 overflow-y-auto">
                        {items.map(({ producto, cantidad }) => (
                          <li
                            key={producto.id}
                            className="flex gap-3 border-b border-outline-variant/50 pb-3"
                          >
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                              className="w-12 h-12 object-contain rounded bg-surface-container-low flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-on-surface text-sm font-medium truncate">
                                {producto.nombre}
                              </p>
                              <p className="text-on-surface-variant text-xs">
                                {producto.marcaNombre}
                              </p>
                              <div className="flex items-baseline gap-2 mt-1">
                                {producto.precio_oferta ? (
                                  <>
                                    <span className="text-on-surface-variant text-xs line-through">
                                      ${Number(producto.precio).toLocaleString('es-AR')}
                                    </span>
                                    <span className="text-primary text-sm font-semibold">
                                      ${Number(producto.precio_oferta).toLocaleString('es-AR')}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-primary text-sm font-semibold">
                                    ${Number(producto.precio).toLocaleString('es-AR')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() =>
                                    modificarCantidad(producto.id, cantidad - 1)
                                  }
                                  className="w-5 h-5 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs cursor-pointer"
                                >
                                  −
                                </button>
                                <span className="text-on-surface text-xs tabular-nums w-4 text-center">
                                  {cantidad}
                                </span>
                                <button
                                  onClick={() =>
                                    modificarCantidad(producto.id, cantidad + 1)
                                  }
                                  className="w-5 h-5 flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="border-t border-outline-variant mt-3 pt-3">
                        <p className="text-on-surface text-sm font-semibold">
                          Total: ${totalPrecio.toLocaleString('es-AR')}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={vaciarCarrito}
                            className="btn-secondary flex-1 py-1.5 text-sm"
                          >
                            Vaciar
                          </button>
                          <button
                            onClick={() => {
                              setCarritoAbierto(false);
                              navigate('/realizar-compra');
                            }}
                            className="btn-primary flex-1 py-1.5 text-sm"
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

        <div className="flex items-center justify-between md:justify-center py-5">
          {/* Menu hamburguesa mobile ------------------------------------------------------*/}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-on-surface hover:text-primary p-2 rounded border border-outline-variant"
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <ul className="flex flex-wrap justify-center gap-8 text-sm font-medium">
              {NAV_LINKS.map((link) => {
                if (link.type === 'link') {
                  return (
                    <li key={link.label}>
                      <Link to={link.to} className="text-on-surface-variant hover:text-primary transition-colors font-body">
                        {link.label}
                      </Link>
                    </li>
                  );
                }
                if (link.type === 'categories') {
                  return (
                    <li key={link.label} className="relative" ref={categoriaRef}>
                      <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="inline-flex items-center text-on-surface-variant hover:text-primary transition-colors font-body cursor-pointer select-none"
                        aria-expanded={menuAbierto}
                        aria-haspopup="true"
                      >
                        {link.label}
                        <svg
                          className={`ml-1 w-4 h-4 transition-transform duration-200 ${menuAbierto ? 'rotate-180' : ''}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                        </svg>
                      </button>

                      {menuAbierto && categorias.length > 0 && (
                        <ul className="absolute left-0 mt-2 w-40 bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg z-50">
                          {categorias.map((cat) => (
                            <li key={cat.id}>
                              <button
                                className="block w-full text-left px-4 py-2 text-on-surface hover:bg-surface-container hover:text-primary transition-colors cursor-pointer"
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
                  );
                }
                if (link.type === 'reload') {
                  return (
                    <li key={link.label}>
                      <button
                        onClick={() => { window.location.href = link.to; }}
                        className="text-on-surface-variant hover:text-primary transition-colors font-body cursor-pointer bg-transparent border-none p-0"
                      >
                        {link.label}
                      </button>
                    </li>
                  );
                }
                return null;
              })}
              {perfil?.rol === 'admin' && (
                <li><Link to="/admin" className="text-on-surface-variant hover:text-primary transition-colors font-body">Admin</Link></li>
              )}
            </ul>
          </nav>

          <div className="md:hidden w-10" aria-hidden="true" />
        </div>

        {/* Panel menú mobile — Portal para escapar del stacking context del header */}
        {mobileMenuOpen &&
          createPortal(
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div
                ref={mobileMenuRef}
                className="fixed left-0 top-0 z-[60] w-72 h-full bg-surface-container-lowest shadow-xl animate-slide-left"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-on-surface hover:text-primary p-1"
                  aria-label="Cerrar menú"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <ul className="flex flex-col p-6 pt-14 gap-4">
                  {NAV_LINKS.map((link) => {
                    const display = link.mobileLabel || link.label;

                    if (link.type === 'link') {
                      return (
                        <li key={link.label}>
                          <Link
                            to={link.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-on-surface-variant hover:text-primary transition-colors font-body text-base py-2"
                          >
                            {display}
                          </Link>
                        </li>
                      );
                    }
                    if (link.type === 'categories') {
                      return (
                        <li key={link.label}>
                          <button
                            onClick={() => setMobileCatsOpen(!mobileCatsOpen)}
                            className="flex items-center w-full text-left text-on-surface-variant hover:text-primary transition-colors font-body text-base py-2 bg-transparent border-none cursor-pointer"
                            aria-expanded={mobileCatsOpen}
                          >
                            {display}
                            <svg
                              className={`ml-2 w-4 h-4 transition-transform duration-200 ${mobileCatsOpen ? 'rotate-180' : ''}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.66a.75.75 0 01-1.08 0l-4.25-4.66a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
                            </svg>
                          </button>

                          <div
                            className={`overflow-hidden transition-all duration-200 ${mobileCatsOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'}`}
                          >
                            <ul className="bg-surface-container-lowest border border-outline-variant rounded-md shadow-lg py-2 mt-1 flex flex-col gap-0.5">
                              {categorias.map((cat) => (
                                <li key={cat.id}>
                                  <button
                                    className="block w-full text-left text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors py-1.5 px-3 bg-transparent border-none cursor-pointer"
                                    onClick={() => {
                                      navigate(`/productos?categoria=${cat.slug}`);
                                      setMobileMenuOpen(false);
                                    }}
                                  >
                                    {cat.nombre}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </li>
                      );
                    }
                    if (link.type === 'reload') {
                      return (
                        <li key={link.label}>
                          <button
                            onClick={() => { window.location.href = link.to; }}
                            className="block w-full text-left text-on-surface-variant hover:text-primary transition-colors font-body text-base py-2 bg-transparent border-none cursor-pointer"
                          >
                            {display}
                          </button>
                        </li>
                      );
                    }
                    return null;
                  })}

                  {perfil?.rol === 'admin' && (
                    <li>
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-on-surface-variant hover:text-primary transition-colors font-body text-base py-2"
                      >
                        Admin
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>,
            document.body
          )}

      </div>
    </header>
  );
};

export default Nav;
