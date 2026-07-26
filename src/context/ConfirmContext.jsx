/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react';
import ConfirmDialog from '../components/alert/confirmDialog';

const ConfirmContext = createContext();

/**
 * Proveedor del sistema de diálogos de confirmación.
 *
 * Expone la función `confirm(options)` que devuelve una Promise<boolean>.
 * Renderiza un modal con overlay (ConfirmDialog) mientras la promesa
 * esté pendiente. Permite también pasar un string simple como atajo.
 *
 * @param {{ children: React.ReactNode }} props
 *
 * @example
 * // Uso con objeto
 * const ok = await confirm({
 *   title: 'Eliminar',
 *   message: '¿Seguro?',
 *   confirmText: 'Sí',
 *   cancelText: 'No',
 * });
 *
 * @example
 * // Uso con string (mensaje directo)
 * const ok = await confirm('¿Confirmás esta acción?');
 */
export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback((options) => {
    const opts = typeof options === 'string'
      ? { message: options }
      : options;

    return new Promise((resolve) => {
      setDialog({
        title: opts.title || 'Confirmar acción',
        message: opts.message || '¿Estás seguro?',
        confirmText: opts.confirmText || 'Confirmar',
        cancelText: opts.cancelText || 'Cancelar',
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((result) => {
    dialog?.resolve(result);
    setDialog(null);
  }, [dialog]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {dialog && <ConfirmDialog {...dialog} onClose={handleClose} />}
    </ConfirmContext.Provider>
  );
}

/**
 * Hook para acceder al sistema de confirmación modal.
 *
 * @returns {{ confirm: function }}
 *   confirm(options) — Promise<boolean>. Ver ConfirmProvider para la API completa.
 * @throws {Error} Si se usa fuera de ConfirmProvider
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return ctx;
}
