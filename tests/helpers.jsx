/**
 * Helpers reutilizables para tests de componentes React.
 */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { CarritoProvider } from '../src/context/CarritoContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ConfirmProvider } from '../src/context/ConfirmContext';

/**
 * Renderiza un componente dentro del árbol completo de providers.
 * @param {React.ReactElement} ui
 * @param {{ initialRoute?: string }} [options]
 * @returns {ReturnType<typeof render>}
 */
export function renderWithProviders(ui, { initialRoute = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <CarritoProvider>
          <ToastProvider>
            <ConfirmProvider>
              {ui}
            </ConfirmProvider>
          </ToastProvider>
        </CarritoProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}
