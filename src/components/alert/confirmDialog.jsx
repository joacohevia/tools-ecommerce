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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => onClose?.(false)}
    >
      <div
        className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-2 flex items-center gap-3">
          <WarningIcon />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        <div className="px-6 pb-2">
          <p className="text-sm text-gray-400">{message}</p>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={() => onClose?.(false)}
            className="px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            ref={confirmRef}
            onClick={() => onClose?.(true)}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
