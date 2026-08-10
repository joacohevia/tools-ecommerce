// @vitest-environment jsdom
/**
 * Tests de la página de Registro.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Registro from '../../../src/components/pages/registro';
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
    useAuth: vi.fn(() => ({ signup: vi.fn() })),
  };
});

function renderRegistro() {
  return render(
    <MemoryRouter>
      <Registro />
    </MemoryRouter>,
  );
}

describe('Registro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ signup: vi.fn() });
  });

  it('renderiza el formulario de registro', () => {
    renderRegistro();
    expect(screen.getByPlaceholderText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apellido/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/correo/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/caracteres/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrarme/i })).toBeInTheDocument();
  });

  it('alterna la visibilidad de la contraseña', async () => {
    const user = userEvent.setup();
    renderRegistro();

    const input = screen.getByPlaceholderText(/caracteres/i);
    const toggle = screen.getByRole('button', { name: /mostrar contraseña/i });

    expect(input).toHaveAttribute('type', 'password');

    await user.click(toggle);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /ocultar contraseña/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ocultar contraseña/i }));
    expect(input).toHaveAttribute('type', 'password');
  });
});
