// @vitest-environment jsdom
/**
 * Tests del componente WhatsAppButton.
 */
import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhatsAppButton from '../../../src/components/whatsappButton';
import whatsappConfig from '../../../src/config/whatsapp';

describe('WhatsAppButton', () => {
  beforeEach(() => {
    whatsappConfig.number = '';
  });

  it('no renderiza si el número está vacío', () => {
    const { container } = render(<WhatsAppButton />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza el link de WhatsApp con el número configurado', () => {
    whatsappConfig.number = '5492494123456';
    render(<WhatsAppButton />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://wa.me/5492494123456?text=Hola%2C%20te%20escribo%20desde%20la%20tienda');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('tiene la clase whatsapp-float', () => {
    whatsappConfig.number = '5492494123456';
    render(<WhatsAppButton />);
    const link = screen.getByRole('link');
    expect(link.className).toContain('whatsapp-float');
  });
});
