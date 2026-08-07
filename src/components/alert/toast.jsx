/**
 * Ícono SVG de check — para toasts de tipo success.
 * @returns {JSX.Element}
 */
function SuccessIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/**
 * Ícono SVG de equis dentro de círculo — para toasts de tipo error.
 * @returns {JSX.Element}
 */
function ErrorIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

/**
 * Ícono SVG de información (i) — para toasts de tipo info.
 * @returns {JSX.Element}
 */
function InfoIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/**
 * Ícono SVG de advertencia (triángulo) — para toasts de tipo warning.
 * @returns {JSX.Element}
 */
function WarningIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Ícono SVG de equis (×) — botón cerrar en toasts.
 * @returns {JSX.Element}
 */
function CloseIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const ICON_MAP = {
  success: SuccessIcon,
  error: ErrorIcon,
  info: InfoIcon,
  warning: WarningIcon,
};

const STYLE_MAP = {
  success: 'bg-primary-container/90 border-primary text-on-primary-container',
  error: 'bg-error-container/90 border-error text-on-error-container',
  info: 'bg-surface-container-high border-outline-variant text-on-surface-variant',
  warning: 'bg-amber-100/90 border-amber-400 text-amber-900',
};

/**
 * Componente visual de un único toast.
 * Renderiza un ícono según el tipo (success/error/info/warning), el mensaje
 * y un botón de cierre manual (×). El contenedor incluye la animación slide-in
 * y colores genéricos configurables desde STYLE_MAP.
 *
 * @param {{ id: number, type: 'success'|'error'|'info'|'warning', message: string, onDismiss: function }} props
 * @returns {JSX.Element|null}
 */
export default function ToastItem({ id, type, message, onDismiss }) {
  const Icon = ICON_MAP[type] || InfoIcon;
  const style = STYLE_MAP[type] || STYLE_MAP.info;

  return (
    <div
      id={`toast-${id}`}
      className={`animate-slide-in flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm min-w-[300px] max-w-[420px] ${style}`}
    >
      <Icon />
      <span className="text-sm flex-1">{message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss?.();
        }}
        className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer flex-shrink-0"
        aria-label="Cerrar notificación"
      >
        <CloseIcon />
      </button>
    </div>
  );
}
