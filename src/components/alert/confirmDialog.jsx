import { useEffect, useRef } from 'react';

/**
 * Ícono SVG de advertencia (triángulo con signo de exclamación).
 * @returns {JSX.Element}
 */
function WarningIcon() {
  return (
    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Modal de confirmación con overlay.
 *
 * Muestra un título con ícono de advertencia, un mensaje descriptivo,
 * y dos botones (cancelar / confirmar). Se cierra al hacer clic fuera
 * del modal o al presionar Escape (ambos resuelven con false).
 * El botón de confirmar recibe foco automático al montarse.
 *
 * @param {{ title: string, message: string, confirmText: string, cancelText: string, onClose: (result: boolean) => void }} props
 * @returns {JSX.Element|null}
 */
export default function ConfirmDialog({ title, message, confirmText, cancelText, onClose }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        onClose?.(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={() => onClose?.(false)}
    >
      <div
        className="modal-panel max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2 flex items-center gap-3">
          <WarningIcon />
          <h2 className="font-headline text-headline-md text-on-surface">{title}</h2>
        </div>

        <div className="px-6 pb-2">
          <p className="text-body-md text-on-surface-variant">{message}</p>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={() => onClose?.(false)}
            className="btn-secondary py-2 text-sm"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={() => onClose?.(true)}
            className="btn-primary py-2 text-sm bg-error hover:bg-error/80"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
