// @vitest-environment jsdom
/**
 * Tests de la página de Login.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../src/components/pages/login';
import { useAuth } from '../../../src/context/AuthContext';

const mockNavigate = vi.fn();

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
    useAuth: vi.fn(() => ({ login: vi.fn() })),
  };
});

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ login: vi.fn() });
  });

  it('renderiza el formulario de login', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('alterna la visibilidad de la contraseña', async () => {
    const user = userEvent.setup();
    renderLogin();

    const input = screen.getByPlaceholderText(/contraseña/i);
    const toggle = screen.getByRole('button', { name: /mostrar contraseña/i });

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ocultar contraseña/i }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
