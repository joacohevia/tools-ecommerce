// @vitest-environment jsdom
/**
 * Tests del ToastContext.
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../../../src/context/ToastContext';

function wrapper({ children }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('ToastContext', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('inicia sin toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toEqual([]);
  });

  it('toast.success — agrega un toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.toast.success('Producto creado'));
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('toast.error — agrega un toast de error', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.toast.error('Error de conexión'));
    expect(result.current.toasts[0].type).toBe('error');
  });

  it('toast.info — agrega un toast informativo', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.toast.info('Cargando...'));
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('toast.warning — agrega un toast de advertencia', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.toast.warning('Stock bajo'));
    expect(result.current.toasts[0].type).toBe('warning');
  });

  it('auto-dismiss — elimina el toast tras el timeout', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.toast.success('Test', 1000));
    expect(result.current.toasts).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.toasts).toHaveLength(0);
  });

  it('dismiss — cierra un toast manualmente', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    let toastId;
    act(() => { toastId = result.current.toast.success('Manual'); });
    expect(result.current.toasts).toHaveLength(1);
    act(() => result.current.dismiss(toastId));
    expect(result.current.toasts).toHaveLength(0);
  });

  it('apila multiples toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.toast.success('Uno');
      result.current.toast.error('Dos');
      result.current.toast.info('Tres');
    });
    expect(result.current.toasts).toHaveLength(3);
  });
});
