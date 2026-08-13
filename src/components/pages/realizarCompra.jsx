import { useState } from 'react';
import { Link } from 'react-router-dom';
import pagoConfig from '../../config/pago';
import whatsappConfig from '../../config/whatsapp';
import { useCarrito } from '../../context/CarritoContext';
import { useToast } from '../../context/ToastContext';

/**
 * Calcula el subtotal de un item del carrito.
 * Usa el precio de oferta si existe; si no, el precio regular.
 *
 * @param {{ precio: number|string, precio_oferta: number|string|null }} producto
 * @param {number} cantidad
 * @returns {number} Subtotal en pesos
 */
function subtotalDe(producto, cantidad) {
  const precio = Number(producto.precio_oferta) || Number(producto.precio) || 0;
  return precio * cantidad;
}

/**
 * Valida los campos del formulario de compra según el método de entrega elegido.
 *
 * @param {object} data - { celular, correo, metodoEntrega, direccion, horarioEnvio, horarioRetiro }
 * @returns {{ [campo: string]: string }} Errores por campo. Vacío si todo es válido.
 */
function validar(data) {
  const errores = {};

  if (!data.celular.trim()) {
    errores.celular = 'El celular es obligatorio';
  } else if (!/^\d+$/.test(data.celular.replace(/[\s\-()]/g, ''))) {
    errores.celular = 'Ingresá solo números';
  }

  if (!data.correo.trim()) {
    errores.correo = 'El correo es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo.trim())) {
    errores.correo = 'Ingresá un correo válido';
  }

  if (data.metodoEntrega === 'envio') {
    if (!data.direccion.trim()) errores.direccion = 'La dirección es obligatoria';
    if (!data.horarioEnvio.trim()) errores.horarioEnvio = 'Indicá el horario de recepción';
  } else {
    if (!data.horarioRetiro.trim()) errores.horarioRetiro = 'Indicá el horario de retiro';
  }

  return errores;
}

/**
 * Construye el mensaje de WhatsApp con el detalle del pedido.
 *
 * @param {object} params
 * @param {Array<{ producto: object, cantidad: number }>} params.items - Items del carrito
 * @param {number} params.total - Total del pedido
 * @param {object} params.form - Datos del formulario (celular, correo, entrega, pago)
 * @returns {string} Texto plano del mensaje a enviar
 */
function construirMensaje({ items, total, form }) {
  const lineas = ['¡Hola! Quiero hacer un pedido:', ''];

  items.forEach(({ producto, cantidad }) => {
    lineas.push(
      `· ${producto.nombre} × ${cantidad} = $${subtotalDe(producto, cantidad).toLocaleString('es-AR')}`
    );
  });

  lineas.push('');
  lineas.push(`Total: $${total.toLocaleString('es-AR')}`);

  if (form.metodoEntrega === 'envio') {
    lineas.push(`Entrega: Envío a ${form.direccion.trim()} — recibo ${form.horarioEnvio.trim()}`);
  } else {
    lineas.push(`Entrega: Retiro en sucursal — paso ${form.horarioRetiro.trim()}`);
  }

  lineas.push(`Pago: ${form.metodoPago === 'transferencia' ? 'Transferencia' : 'Efectivo'}`);
  lineas.push('');
  lineas.push(`Celular: ${form.celular.trim()}`);
  lineas.push(`Correo: ${form.correo.trim()}`);

  if (form.metodoPago === 'transferencia' && pagoConfig.alias) {
    lineas.push('');
    lineas.push(`Transferir a: ${pagoConfig.alias}${pagoConfig.titular ? ` (${pagoConfig.titular})` : ''}`);
    lineas.push('Voy a enviar el comprobante.');
  }

  return lineas.join('\n');
}

/**
 * Página de compra anónima (sin login ni persistencia en base de datos).
 *
 * Flujo:
 * 1. Formulario de contacto + método de entrega + método de pago.
 * 2. Pantalla de confirmación con resumen, total y datos de transferencia (si aplica).
 * 3. Al enviar, abre WhatsApp con el detalle y muestra pantalla de éxito.
 *
 * @returns {JSX.Element}
 */
export default function RealizarCompra() {
  const { items, totalPrecio, vaciarCarrito } = useCarrito();
  const { toast } = useToast();

  const [form, setForm] = useState({
    celular: '',
    correo: '',
    metodoEntrega: 'envio',
    direccion: '',
    horarioEnvio: '',
    horarioRetiro: '',
    metodoPago: 'efectivo',
  });
  const [errors, setErrors] = useState({});
  const [paso, setPaso] = useState('form');
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errores = validar(form);
    if (Object.keys(errores).length > 0) {
      setErrors(errores);
      return;
    }
    setErrors({});
    setMensaje(construirMensaje({ items, total: totalPrecio, form }));
    setPaso('confirm');
  };

  const copiarAlias = async () => {
    try {
      await navigator.clipboard.writeText(pagoConfig.alias);
      toast.success('Alias copiado');
    } catch {
      toast.error('No se pudo copiar el alias');
    }
  };

  const enviarWhatsApp = () => {
    const url = `https://wa.me/${whatsappConfig.number}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    vaciarCarrito();
    setPaso('enviado');
  };

  if (items.length === 0 && paso === 'form') {
    return (
      <main className="max-w-5xl mx-auto px-4 py-20 md:py-15 text-center">
        <h1 className="font-headline text-headline-lg text-on-surface mb-3">Tu carrito está vacío</h1>
        <p className="text-on-surface-variant mb-6">Agregá productos para realizar una compra.</p>
        <Link to="/productos" className="btn-primary px-6 py-3">
          Ver productos
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-20 md:py-15">
      <nav className="text-sm text-on-surface-variant mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to="/home" className="hover:text-on-surface transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-on-surface font-medium">Realizar compra</li>
        </ol>
      </nav>

      <h1 className="font-headline text-headline-lg text-on-surface mb-6">Realizar compra</h1>

      {paso === 'form' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="celular" className="text-sm font-medium text-on-surface">
                Celular
              </label>
              <input
                id="celular"
                name="celular"
                type="tel"
                inputMode="numeric"
                placeholder="ej: 2494619971"
                value={form.celular}
                onChange={handleChange}
                aria-invalid={!!errors.celular}
                className={`input ${errors.celular ? 'border-error focus:border-error' : ''}`}
              />
              {errors.celular && <p className="text-error text-xs">{errors.celular}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="correo" className="text-sm font-medium text-on-surface">
                Correo
              </label>
              <input
                id="correo"
                name="correo"
                type="email"
                placeholder="ej: tuemail@email.com"
                value={form.correo}
                onChange={handleChange}
                aria-invalid={!!errors.correo}
                className={`input ${errors.correo ? 'border-error focus:border-error' : ''}`}
              />
              {errors.correo && <p className="text-error text-xs">{errors.correo}</p>}
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-on-surface mb-1">Método de entrega</legend>
              <label className="flex items-center gap-2 text-on-surface text-sm cursor-pointer">
                <input
                  type="radio"
                  name="metodoEntrega"
                  value="envio"
                  checked={form.metodoEntrega === 'envio'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                Envío a domicilio
              </label>
              <label className="flex items-center gap-2 text-on-surface text-sm cursor-pointer">
                <input
                  type="radio"
                  name="metodoEntrega"
                  value="retiro"
                  checked={form.metodoEntrega === 'retiro'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                Retiro en sucursal
              </label>
            </fieldset>

            {form.metodoEntrega === 'envio' ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="direccion" className="text-sm font-medium text-on-surface">
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    type="text"
                    placeholder="ej: Calle 123, Tandil"
                    value={form.direccion}
                    onChange={handleChange}
                    aria-invalid={!!errors.direccion}
                    className={`input ${errors.direccion ? 'border-error focus:border-error' : ''}`}
                  />
                  {errors.direccion && <p className="text-error text-xs">{errors.direccion}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="horarioEnvio" className="text-sm font-medium text-on-surface">
                    Horario de recepción
                  </label>
                  <input
                    id="horarioEnvio"
                    name="horarioEnvio"
                    type="text"
                    placeholder="ej: después de las 14:00"
                    value={form.horarioEnvio}
                    onChange={handleChange}
                    aria-invalid={!!errors.horarioEnvio}
                    className={`input ${errors.horarioEnvio ? 'border-error focus:border-error' : ''}`}
                  />
                  {errors.horarioEnvio && <p className="text-error text-xs">{errors.horarioEnvio}</p>}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="horarioRetiro" className="text-sm font-medium text-on-surface">
                  Horario de retiro
                </label>
                <input
                  id="horarioRetiro"
                  name="horarioRetiro"
                  type="text"
                  placeholder="ej: de 9:00 a 18:00"
                  value={form.horarioRetiro}
                  onChange={handleChange}
                  aria-invalid={!!errors.horarioRetiro}
                  className={`input ${errors.horarioRetiro ? 'border-error focus:border-error' : ''}`}
                />
                {errors.horarioRetiro && <p className="text-error text-xs">{errors.horarioRetiro}</p>}
              </div>
            )}

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium text-on-surface mb-1">Método de pago</legend>
              <label className="flex items-center gap-2 text-on-surface text-sm cursor-pointer">
                <input
                  type="radio"
                  name="metodoPago"
                  value="efectivo"
                  checked={form.metodoPago === 'efectivo'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                Efectivo (presencial)
              </label>
              <label className="flex items-center gap-2 text-on-surface text-sm cursor-pointer">
                <input
                  type="radio"
                  name="metodoPago"
                  value="transferencia"
                  checked={form.metodoPago === 'transferencia'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                Transferencia bancaria
              </label>
            </fieldset>

            <button type="submit" className="btn-primary self-start px-6 py-3">
              Continuar
            </button>
          </form>

          <aside className="lg:w-80 flex-shrink-0">
            <Resumen items={items} total={totalPrecio} />
          </aside>
        </div>
      )}

      {paso === 'confirm' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-5">
            <Resumen items={items} total={totalPrecio} />

            {form.metodoPago === 'transferencia' ? (
              <div className="bg-surface-container-low rounded-xl border border-outline-variant p-5">
                <h2 className="font-headline text-headline-md text-on-surface mb-4">
                  Datos para transferir
                </h2>
                <div className="flex items-center justify-between gap-3 mb-1">
                  <span className="text-on-surface-variant text-sm">Alias</span>
                  <span className="text-on-surface font-semibold">{pagoConfig.alias || '—'}</span>
                </div>
                {pagoConfig.titular && (
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <span className="text-on-surface-variant text-sm">Titular</span>
                    <span className="text-on-surface font-semibold">{pagoConfig.titular}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 border-t border-outline-variant mt-3 pt-3">
                  <span className="text-on-surface-variant text-sm">Total a transferir</span>
                  <span className="text-primary text-lg font-bold">
                    ${totalPrecio.toLocaleString('es-AR')}
                  </span>
                </div>
                {pagoConfig.alias && (
                  <button
                    onClick={copiarAlias}
                    className="btn-secondary w-full mt-4 py-2"
                  >
                    Copiar alias
                  </button>
                )}
                <p className="text-on-surface-variant text-xs mt-3">
                  Recordá enviar el comprobante por WhatsApp.
                </p>
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-xl border border-outline-variant p-5">
                <h2 className="font-headline text-headline-md text-on-surface mb-2">Pago en efectivo</h2>
                <p className="text-on-surface-variant text-sm">
                  Abonás en efectivo al recibir el pedido o al retirarlo en sucursal.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setPaso('form')} className="btn-secondary flex-1 py-3">
                Volver
              </button>
              <button onClick={enviarWhatsApp} className="btn-primary flex-1 py-3">
                Finalizar compra 
              </button>
            </div>
          </div>
        </div>
      )}

      {paso === 'enviado' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-on-surface mb-2">Pedido enviado</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Enviaste tu pedido por WhatsApp. Te van a contactar para coordinar la entrega.
          </p>
          <Link to="/home" className="btn-primary px-6 py-3">
            Volver al inicio
          </Link>
        </div>
      )}
    </main>
  );
}

/**
 * Resumen del carrito: lista de items con subtotal y total.
 *
 * @param {{ items: Array<{ producto: object, cantidad: number }>, total: number }} props
 * @returns {JSX.Element}
 */
function Resumen({ items, total }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
      <h2 className="font-headline text-headline-md text-on-surface mb-4">Tu pedido</h2>
      <ul className="space-y-3 max-h-80 overflow-y-auto mb-4">
        {items.map(({ producto, cantidad }) => (
          <li key={producto.id} className="flex gap-3 border-b border-outline-variant/50 pb-3">
            <img
              src={producto.imagen || '/placeholder.jpg'}
              alt={producto.nombre}
              className="w-12 h-12 object-contain rounded bg-surface-container-low flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-on-surface text-sm font-medium truncate">{producto.nombre}</p>
              <p className="text-on-surface-variant text-xs">
                {cantidad} × ${(Number(producto.precio_oferta) || Number(producto.precio)).toLocaleString('es-AR')}
              </p>
            </div>
            <span className="text-on-surface text-sm font-semibold flex-shrink-0">
              ${subtotalDe(producto, cantidad).toLocaleString('es-AR')}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-outline-variant pt-3">
        <span className="text-on-surface font-semibold">Total</span>
        <span className="text-primary text-lg font-bold">${total.toLocaleString('es-AR')}</span>
      </div>
    </div>
  );
}
