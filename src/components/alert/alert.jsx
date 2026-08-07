function ErrorIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  success: 'bg-primary-container/30 border-primary text-on-primary-container',
  error: 'bg-error-container/30 border-error text-on-error-container',
  info: 'bg-surface-container-high border-outline-variant text-on-surface-variant',
  warning: 'bg-amber-100 border-amber-400 text-amber-900',
};

const ICON_COLOR_MAP = {
  success: 'text-primary',
  error: 'text-error',
  info: 'text-on-surface-variant',
  warning: 'text-amber-600',
};

/**
 * Componente de alerta inline (no flotante).
 *
 * Muestra un ícono (según el tipo), título opcional, mensaje y botón
 * de cierre (si se pasa onDismiss). Ideal para errores de conexión,
 * validación o estados vacíos dentro del flujo de la página.
 *
 * Tipos disponibles: success, error, info (default), warning.
 *
 * @param {{ type?: 'success'|'error'|'info'|'warning', title?: string, message?: string, onDismiss?: function, className?: string }} props
 * @returns {JSX.Element|null}
 */
export default function ErrorAlert({ type = 'info', title, message, onDismiss, className = '' }) {
  const Icon = ICON_MAP[type] || InfoIcon;
  const style = STYLE_MAP[type] || STYLE_MAP.info;
  const iconColor = ICON_COLOR_MAP[type] || ICON_COLOR_MAP.info;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border ${style} ${className}`}>
      <span className={`mt-0.5 ${iconColor}`}><Icon /></span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {message && <p className="text-sm opacity-90">{message}</p>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer flex-shrink-0 opacity-70 hover:opacity-100"
          aria-label="Cerrar"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
