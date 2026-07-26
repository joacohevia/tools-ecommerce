// @vitest-environment jsdom
/**
 * Tests del ConfirmContext.
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfirmProvider, useConfirm } from '../../../src/context/ConfirmContext';

function wrapper({ children }) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}

describe('ConfirmContext', () => {
  it('confirm con string — devuelve una Promise', async () => {
    const { result } = renderHook(() => useConfirm(), { wrapper });
    const promise = result.current.confirm('¿Estás seguro?');
    expect(promise).toBeInstanceOf(Promise);
    // Cierra el diálogo para limpiar el estado
    promise.catch(() => {});
  });

  it('confirm con objeto — acepta opciones completas', async () => {
    const { result } = renderHook(() => useConfirm(), { wrapper });
    const promise = result.current.confirm({
      title: 'Eliminar',
      message: '¿Seguro?',
      confirmText: 'Sí',
      cancelText: 'No',
    });
    expect(promise).toBeInstanceOf(Promise);
    promise.catch(() => {});
  });
});
