import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/footer';
import Nav from './components/nav';
import Admin from './components/pages/admin';
import CardDetail from './components/pages/cardDetail';
import Contacto from './components/pages/contacto';
import Home from './components/pages/home';
import Login from './components/pages/login';
import Productos from './components/pages/productos';
import RealizarCompra from './components/pages/realizarCompra';
import ScrollToTopButton from './components/scrollToTopButton';
import ScrollToTop from './components/ui/scrollToTop';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ToastProvider } from './context/ToastContext';

/**
 * Componente raíz de la aplicación.
 *
 * Árbol de proveedores (de afuera hacia adentro):
 * 1. AuthProvider  — autenticación (user, perfil, rol)
 * 2. CarritoProvider — estado global del carrito (Context + localStorage)
 * 3. ToastProvider  — notificaciones emergentes (éxito, error, info, warning)
 * 4. ConfirmProvider — diálogo de confirmación modal (promise-based)
 *
 * Luego renderiza Nav + React Router Routes con las 6 páginas públicas.
 *
 * @returns {JSX.Element} Árbol completo de la aplicación
 */
function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <ToastProvider>
          <ConfirmProvider>
            <div className="flex flex-col min-h-screen bg-surface pt-[88px] md:pt-[112px]">
              <ScrollToTop />
              <ScrollToTopButton />
              <Nav />
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/realizar-compra" element={<RealizarCompra />} />
                <Route path="/producto/:id" element={<CardDetail />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
              <Footer />
            </div>
          </ConfirmProvider>
        </ToastProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App
