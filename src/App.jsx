import { Route, Routes } from 'react-router-dom';
import './App.css';
import Nav from './components/nav';
import Home from './components/pages/home';
import Login from './components/pages/login';
import Registro from './components/pages/registro';
import CardDetail from './components/pages/cardDetail';
import Contacto from './components/pages/contacto';
import Productos from './components/pages/productos';
import { CarritoProvider } from './context/CarritoContext';

function App() {
  return (
    <CarritoProvider>
      <div>
        <Nav />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/producto/:id" element={<CardDetail />} />
        </Routes>
      </div>
    </CarritoProvider>
  );
}

export default App
