import { useState } from 'react';
import { Link } from 'react-router-dom';

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

/** Ícono SVG de WhatsApp (burbuja con teléfono). */
function IconWhatsApp() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

/** Ícono SVG de teléfono clásico. */
function IconTelefono() {
  return (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
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
  { icono: IconWhatsApp,   label: 'WhatsApp', valor: '542236874360', href: 'https://wa.me/542236874360' },
  { icono: IconTelefono,   label: 'Teléfono', valor: '2236874360',   href: 'tel:2236874360' },
  { icono: IconEmail,      label: 'Email',    valor: 'FORT@gmail.com', href: 'mailto:FORT@gmail.com' },
  { icono: IconDireccion,  label: 'Dirección', valor: 'calle falsa 123' },
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
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-dark-muted mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/home" className="hover:text-dark-text transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-dark-text font-medium">Contacto</li>
        </ol>
      </nav>

      <div className="bg-dark-blue rounded-xl border border-white/10">
        <div className="flex flex-col md:flex-row">

          {/**
           * [MODIFICACIÓN 2] Columna Izquierda (Información de contacto)
           * Se aumentó el padding derecho (pr-12) y se agregó gap-8 entre columnas
           * para mayor separación visual respecto al formulario.
           */}
          <aside className="md:w-[40%] p-8 md:p-10 md:pr-16 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-white/10">
            <h2 className="text-2xl font-bold text-dark-text font-title">Contacto</h2>
            <ul className="flex flex-col gap-6">
              {DATOS_CONTACTO.map(({ icono: Icono, label, valor, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="text-dark-muted mt-0.5"><Icono /></span>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold uppercase tracking-wider text-dark-muted/60">
                      {label}
                    </span>
                    {href ? (
                      <a
                        href={href}
                        target={label === 'WhatsApp' ? '_blank' : undefined}
                        rel={label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                        className="text-dark-text text-sm hover:text-blue-400 transition-colors"
                      >
                        {valor}
                      </a>
                    ) : (
                      <span className="text-dark-text text-sm">{valor}</span>
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
                <h3 className="text-xl font-semibold text-dark-text mb-2">Mensaje enviado</h3>
                <p className="text-dark-muted text-sm">Gracias por contactarnos. Te responderemos a la brevedad.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nombre" className="text-sm font-medium text-dark-text">
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
                    className={`border rounded-lg px-4 py-2.5 text-sm bg-dark-bg text-dark-text placeholder-dark-muted outline-none transition-colors ${
                      errors.nombre
                        ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                        : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  {errors.nombre && (
                    <p id="error-nombre" className="text-red-400 text-xs">{errors.nombre}</p>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-dark-text">
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
                    className={`border rounded-lg px-4 py-2.5 text-sm bg-dark-bg text-dark-text placeholder-dark-muted outline-none transition-colors ${
                      errors.email
                        ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                        : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  {errors.email && (
                    <p id="error-email" className="text-red-400 text-xs">{errors.email}</p>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="telefono" className="text-sm font-medium text-dark-text">
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
                    className={`border rounded-lg px-4 py-2.5 text-sm bg-dark-bg text-dark-text placeholder-dark-muted outline-none transition-colors ${
                      errors.telefono
                        ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                        : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  {errors.telefono && (
                    <p id="error-telefono" className="text-red-400 text-xs">{errors.telefono}</p>
                  )}
                </div>

                {/* Mensaje */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mensaje" className="text-sm font-medium text-dark-text">
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
                    className={`border rounded-lg px-4 py-3 text-sm bg-dark-bg text-dark-text placeholder-dark-muted outline-none transition-colors resize-none ${
                      errors.mensaje
                        ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                        : 'border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                  {errors.mensaje && (
                    <p id="error-mensaje" className="text-red-400 text-xs">{errors.mensaje}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 px-6 rounded-lg transition-colors cursor-pointer self-start"
                >
                  Enviar mensaje
                </button>
              </form>
            )}
          </section>

        </div>
      </div>
    </main>
  );
}
