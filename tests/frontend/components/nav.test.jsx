// @vitest-environment jsdom
/**
 * Tests del componente Nav.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Nav from '../../../src/components/nav';
import { useAuth } from '../../../src/context/AuthContext';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../../src/context/AuthContext', async () => {
  const actual = await vi.importActual('../../../src/context/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(() => defaultAuth),
  };
});

vi.mock('../../../src/context/CarritoContext', async () => {
  const actual = await vi.importActual('../../../src/context/CarritoContext');
  return {
    ...actual,
    useCarrito: vi.fn(() => defaultCarrito),
  };
});

vi.mock('../../../src/http', async () => {
  const actual = await vi.importActual('../../../src/http');
  return {
    ...actual,
    getCategorias: vi.fn(() => Promise.resolve([
      { id: 1, nombre: 'Taladros', slug: 'taladros' },
      { id: 2, nombre: 'Sierras', slug: 'sierras' },
    ])),
    getProductos: vi.fn(() => Promise.resolve([])),
  };
});

const defaultAuth = {
  user: { email: 'test@example.com' },
  perfil: { nombre: 'Test', rol: 'admin' },
  loading: false,
  logout: mockLogout,
  login: vi.fn(),
  signup: vi.fn(),
  session: null,
};

const defaultCarrito = {
  items: [],
  totalItems: 0,
  totalPrecio: 0,
  agregarAlCarrito: vi.fn(),
  removerDelCarrito: vi.fn(),
  modificarCantidad: vi.fn(),
  vaciarCarrito: vi.fn(),
};

/**
 * Renderiza el Nav dentro de los providers y Router necesarios.
 * @param {object} options
 * @param {string} [options.initialRoute]
 * @param {object} [options.authValue]
 * @param {object} [options.carritoValue]
 */
function renderNav({ initialRoute = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="*" element={<Nav />} />
      </Routes>
    </MemoryRouter>,
  );
}

/**
 * Simula un viewport mobile en jsdom para que las media queries de Tailwind
 * apliquen las clases mobile.
 * @param {number} width
 */
function setViewport(width) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

describe('Nav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockLogout.mockClear();
    useAuth.mockReturnValue(defaultAuth);
  });

  it('muestra links de navegación desktop', () => {
    renderNav();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  it('muestra el link Admin cuando el usuario es admin', () => {
    useAuth.mockReturnValue({ ...defaultAuth, perfil: { ...defaultAuth.perfil, rol: 'admin' } });
    renderNav();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('no muestra el link Admin cuando el usuario no es admin', () => {
    useAuth.mockReturnValue({ ...defaultAuth, perfil: { ...defaultAuth.perfil, rol: 'cliente' } });
    renderNav();
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('logout redirige a /home', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByText('👤'));
    await user.click(screen.getByText('Cerrar sesión'));
    expect(mockLogout).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('click en Producto navega a /productos para recargar sin filtros', async () => {
    const user = userEvent.setup();
    delete window.location;
    window.location = { href: 'http://localhost:3000/' };
    renderNav();
    const productoBtn = screen.getAllByText('Producto')[0];
    await user.click(productoBtn);
    expect(window.location.href).toBe('/productos');
  });

  it('muestra ícono de menú hamburguesa', () => {
    renderNav();
    expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
  });

  it('abre el panel del menú mobile al tocar hamburguesa', async () => {
    const user = userEvent.setup();
    renderNav();
    const hamburger = screen.getByLabelText('Abrir menú');
    await user.click(hamburger);
    expect(screen.getByText('Categorías')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getAllByText('Inicio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Contacto').length).toBeGreaterThanOrEqual(1);
  });

  it('despliega las categorías en el menú mobile', async () => {
    const user = userEvent.setup();
    setViewport(375);
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    await user.click(screen.getByText('Categorías'));
    await waitFor(() => {
      expect(screen.getByText('Taladros')).toBeInTheDocument();
      expect(screen.getByText('Sierras')).toBeInTheDocument();
    });
  });

  it('cierra el menú mobile al seleccionar una categoría', async () => {
    const user = userEvent.setup();
    setViewport(375);
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    await user.click(screen.getByText('Categorías'));
    await waitFor(() => expect(screen.getByText('Taladros')).toBeInTheDocument());
    await user.click(screen.getByText('Taladros'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/productos?categoria=taladros');
    });
  });

  it('el panel mobile se monta como hijo directo de document.body', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    const overlay = screen.getByText('Categorías').closest('.fixed.left-0').parentElement;
    expect(document.body.contains(overlay)).toBe(true);
    expect(overlay).toHaveClass('z-50');
  });

  it('el panel mobile tiene z-[60] para quedar por encima de todos los overlays', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    const panel = screen.getByText('Categorías').closest('.fixed.left-0');
    expect(panel).toHaveClass('z-[60]');
    expect(panel).toHaveClass('fixed', 'left-0', 'top-0');
  });

  it('cierra el menú mobile al hacer clic en el overlay de fondo', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    expect(screen.getByText('Categorías')).toBeInTheDocument();

    const panel = screen.getByText('Categorías').closest('.fixed.left-0');
    const overlay = panel.parentElement;
    await user.click(overlay);

    expect(screen.queryByText('Categorías')).not.toBeInTheDocument();
  });

  it('cierra el menú mobile al presionar el botón X', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    await user.click(screen.getByLabelText('Cerrar menú'));
    expect(screen.queryByText('Categorías')).not.toBeInTheDocument();
  });

  it('el botón de hamburguesa sigue estando en el header aunque el panel esté en Portal', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument();
  });

  it('el link Admin aparece en el panel mobile cuando el usuario es admin', async () => {
    const user = userEvent.setup();
    useAuth.mockReturnValue({ ...defaultAuth, perfil: { ...defaultAuth.perfil, rol: 'admin' } });
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(2);
  });

  it('los links mobile usan las etiquetas mobileLabel del array NAV_LINKS', async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByLabelText('Abrir menú'));
    expect(screen.getByText('Categorías')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
  });
});
