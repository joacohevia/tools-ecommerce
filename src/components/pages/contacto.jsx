import { useState } from 'react';
import { Link } from 'react-router-dom';
import WhatsAppButton from '../whatsappButton';

/**
 * Valida los campos del formulario de contacto.
 *
 * Reglas:
 * - Todos los campos son obligatorios.
 * - Email debe coincidir con un formato válido (regex básico).
 * - Teléfono solo permite dígitos (guiones y paréntesis se eliminan antes de validar).
 *
 * @param {{ nombre: string, email: string, telefono: string, mensaje: string }} data
 * @returns {{ [campo: string]: string }} Objeto con mensajes de error por campo. Vacío si todo es válido.
 */
function validar({ nombre, email, telefono, mensaje }) {
  const errores = {};

  if (!nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!email.trim()) {
    errores.email = 'El email es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errores.email = 'Ingresá un email válido';
  }
  if (!telefono.trim()) {
    errores.telefono = 'El teléfono es obligatorio';
  } else if (!/^\d+$/.test(telefono.replace(/[\s\-()]/g, ''))) {
    errores.telefono = 'Ingresá solo números';
  }
  if (!mensaje.trim()) errores.mensaje = 'El mensaje es obligatorio';

  return errores;
}

/** Ícono SVG de sobre/email. */
function IconEmail() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/** Ícono SVG de ubicación/pin. */
function IconDireccion() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Datos de contacto de la empresa. */
const DATOS_CONTACTO = [
  { icono: IconEmail,      label: 'Email',    valor: 'FORT@gmail.com', href: 'mailto:FORT@gmail.com' },
  { icono: IconDireccion,  label: 'Dirección', valor: 'Figueroa y Entre Rios' },
];

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [errors, setErrors] = useState({});
  const [enviado, setEnviado] = useState(false);

  /**
   * Actualiza un campo del formulario y elimina su error asociado.
   * Usa la propiedad `name` del input para identificar el campo.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * Maneja el envío del formulario: valida y muestra confirmación.
   *
   * Flujo:
   * 1. Previene el comportamiento por defecto del navegador.
   * 2. Ejecuta `validar()` sobre los datos actuales.
   * 3. Si hay errores, los guarda en el estado y detiene el envío.
   * 4. Si no hay errores, marca `enviado = true` para mostrar el mensaje de éxito.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const errores = validar(formData);
    if (Object.keys(errores).length > 0) {
      setErrors(errores);
      return;
    }
    setErrors({});
    setEnviado(true);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-1 md:py-1">
      {/* Breadcrumb */}
      <nav className="text-sm text-on-surface-variant py-3 mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/home" className="hover:text-on-surface transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-on-surface font-medium">Contacto</li>
        </ol>
      </nav>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant">
        <div className="flex flex-col md:flex-row">

          {/**
           * [MODIFICACIÓN 2] Columna Izquierda (Información de contacto)
           * Se aumentó el padding derecho (pr-12) y se agregó gap-8 entre columnas
           * para mayor separación visual respecto al formulario.
           */}
          <aside className="md:w-[40%] p-8 md:p-10 md:pr-16 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-outline-variant">
            <h2 className="text-2xl font-bold text-on-surface font-headline">Contacto</h2>
            <ul className="flex flex-col gap-6">
              {DATOS_CONTACTO.map(({ icono: Icono, label, valor, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="text-on-surface-variant mt-0.5"><Icono /></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant/60">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        target={label === 'WhatsApp' ? '_blank' : undefined}
                        rel={label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                        className="text-on-surface text-sm hover:text-primary transition-colors"
                      >
                        {valor}
                      </a>
                    ) : (
                      <span className="text-on-surface text-sm">{valor}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/**
           * [MODIFICACIÓN 3] Columna Derecha (Formulario)
           * Se reemplazó el fondo blanco/gris por bg-dark-blue con bordes white/10
           * para que coincida con la estética azul oscura de la página.
           * Los inputs usan bg-dark-bg, texto claro y placeholders en dark-muted.
           */}
          <section className="md:w-[60%] p-8 md:p-10">
            {enviado ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-on-surface mb-2">Mensaje enviado</h3>
                <p className="text-on-surface-variant text-sm">Gracias por contactarnos. Te responderemos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre" className="text-sm font-medium text-on-surface">
                    Nombre
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="ej: María Perez"
                    value={formData.nombre}
                    onChange={handleChange}
                    aria-invalid={!!errors.nombre}
                    aria-describedby={errors.nombre ? 'error-nombre' : undefined}
                    className={`input ${
                      errors.nombre
                        ? 'border-error focus:border-error focus:ring-error'
                        : ''
                    }`}
                  />
                  {errors.nombre && (
                    <p id="error-nombre" className="text-error text-xs">{errors.nombre}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-on-surface">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ej: tuemail@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'error-email' : undefined}
                    className={`input ${
                      errors.email
                        ? 'border-error focus:border-error focus:ring-error'
                        : ''
                    }`}
                  />
                  {errors.email && (
                    <p id="error-email" className="text-error text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="telefono" className="text-sm font-medium text-on-surface">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="ej: 1123445567"
                    value={formData.telefono}
                    onChange={handleChange}
                    aria-invalid={!!errors.telefono}
                    aria-describedby={errors.telefono ? 'error-telefono' : undefined}
                    className={`input ${
                      errors.telefono
                        ? 'border-error focus:border-error focus:ring-error'
                        : ''
                    }`}
                  />
                  {errors.telefono && (
                    <p id="error-telefono" className="text-error text-xs">{errors.telefono}</p>
                  )}
                </div>

                {/* Mensaje */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mensaje" className="text-sm font-medium text-on-surface">
                    Mensaje
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    placeholder="ej: Tu mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    aria-invalid={!!errors.mensaje}
                    aria-describedby={errors.mensaje ? 'error-mensaje' : undefined}
                    className={`input resize-none ${
                      errors.mensaje
                        ? 'border-error focus:border-error focus:ring-error'
                        : ''
                    }`}
                  />
                  {errors.mensaje && (
                    <p id="error-mensaje" className="text-error text-xs">{errors.mensaje}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 btn-primary py-2 px-2 self-start"
                >
                  Enviar mensaje
                </button>
              </form>
            )}
            <WhatsAppButton />
          </section>
        </div>
      </div>
    </main>
  );
}
