// @vitest-environment jsdom
/**
 * Tests de ErrorAlert.
 */
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ErrorAlert from '../../../src/components/alert/alert';
import { renderWithProviders } from '../../helpers';

describe('ErrorAlert', () => {
  it('renderiza el mensaje', () => {
    renderWithProviders(<ErrorAlert type="error" message="Algo salió mal" />);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('renderiza el titulo cuando se pasa', () => {
    renderWithProviders(<ErrorAlert type="error" title="Error" message="Detalle" />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });

  it('no renderiza titulo si no se pasa', () => {
    renderWithProviders(<ErrorAlert type="info" message="Info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.queryAllByRole('heading')).toHaveLength(0);
  });

  it('renderiza boton dismiss con onDismiss', () => {
    const onDismiss = vi.fn();
    renderWithProviders(<ErrorAlert type="warning" message="Warning" onDismiss={onDismiss} />);
    screen.getByLabelText('Cerrar').click();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('no renderiza boton dismiss sin onDismiss', () => {
    renderWithProviders(<ErrorAlert type="success" message="Success" />);
    expect(screen.queryByLabelText('Cerrar')).not.toBeInTheDocument();
  });

  it('acepta className adicional', () => {
    const { container } = renderWithProviders(
      <ErrorAlert type="info" message="Test" className="my-custom-class" />,
    );
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  it('tipo success tiene estilo de exito', () => {
    renderWithProviders(<ErrorAlert type="success" message="Éxito" />);
    expect(screen.getByText('Éxito')).toBeInTheDocument();
  });

  it('tipo por defecto es info', () => {
    renderWithProviders(<ErrorAlert message="Default" />);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });
});
