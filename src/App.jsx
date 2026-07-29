import { Route, Routes } from 'react-router-dom';
import './App.css';
import Nav from './components/nav';
import Home from './components/pages/home';
import Login from './components/pages/login';
import Registro from './components/pages/registro';
import CardDetail from './components/pages/cardDetail';
import Contacto from './components/pages/contacto';
import Productos from './components/pages/productos';
import Admin from './components/pages/admin';
import { CarritoProvider } from './context/CarritoContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';

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
            <div>
              <Nav />
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/producto/:id" element={<CardDetail />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </div>
          </ConfirmProvider>
        </ToastProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App
