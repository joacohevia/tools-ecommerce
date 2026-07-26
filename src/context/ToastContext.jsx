/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react';
import ToastItem from '../components/alert/toast';

const ToastContext = createContext();

/**
 * Contador global incremental para asignar IDs únicos a cada toast.
 * @type {number}
 */
let toastId = 0;

/**
 * Proveedor del sistema de notificaciones toast.
 *
 * Expone un objeto `toast` con los métodos { success, error, info, warning }
 * y la función `dismiss(id)` para cerrar manualmente. Los toasts se renderizan
 * en un contenedor fijo en la esquina inferior derecha (z-50) con auto-dismiss
 * configurable (default 4 segundos).
 *
 * @param {{ children: React.ReactNode }} props
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (type, message, duration = 4000) => {
      const id = ++toastId;
      setToasts((prev) => [...prev, { id, type, message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = {
    toasts,
    toast: {
      success: (msg, dur) => toast('success', msg, dur),
      error: (msg, dur) => toast('error', msg, dur),
      info: (msg, dur) => toast('info', msg, dur),
      warning: (msg, dur) => toast('warning', msg, dur),
    },
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2">
          {toasts.map((t) => (
            <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

/**
 * Hook para acceder al sistema de notificaciones toast.
 *
 * @returns {{ toast: { success, error, info, warning }, dismiss: function }}
 *   toast.success(message, duration?) — notificación verde
 *   toast.error(message, duration?)   — notificación roja
 *   toast.info(message, duration?)    — notificación azul
 *   toast.warning(message, duration?) — notificación ámbar
 *   dismiss(id)                       — cierra una notificación por ID
 * @throws {Error} Si se usa fuera de ToastProvider
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}
