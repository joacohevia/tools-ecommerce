// @vitest-environment jsdom
/**
 * Tests del Footer.
 */
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../helpers';
import Footer from '../../../src/components/footer';

describe('Footer', () => {
  it('renderiza el logo', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByAltText('Herramientas Tandil')).toBeInTheDocument();
  });

  it('renderiza la seccion Contacto', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole('heading', { name: 'Contacto' })).toBeInTheDocument();
    expect(screen.getByText('FORT@gmail.com')).toBeInTheDocument();
  });

  it('renderiza la seccion Navegacion', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole('heading', { name: 'Navegación' })).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Productos')).toBeInTheDocument();
  });

  it('renderiza la seccion Horarios', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole('heading', { name: 'Horarios' })).toBeInTheDocument();
    expect(screen.getByText('Lunes a Viernes')).toBeInTheDocument();
    expect(screen.getByText('Sábados')).toBeInTheDocument();
  });

  it('renderiza la seccion Medios de pago', () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole('heading', { name: 'Medios de pago' })).toBeInTheDocument();
    expect(screen.getByText('Envíos a todo el país')).toBeInTheDocument();
  });

  it('muestra el año actual en el copyright', () => {
    renderWithProviders(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
