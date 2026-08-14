import { Link } from 'react-router-dom';
import fotoLogo from '../../public/Logo.jpg';

/** Ícono SVG de WhatsApp (burbuja con teléfono). */
function IconWhatsApp() {
  return (
      <svg className="w-4 h-4 flex-shrink-0 text-on-secondary-fixed-variant/60 group-hover:text-primary-fixed transition-colors" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

/** Ícono SVG de email. */
function IconEmail() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-on-secondary-fixed-variant/60 group-hover:text-primary-fixed transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

/** Ícono SVG de ubicación. */
function IconDireccion() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-on-secondary-fixed-variant/60 group-hover:text-primary-fixed transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Ícono SVG de reloj. */
function IconReloj() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-on-secondary-fixed-variant/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/** Ícono SVG de tarjeta de crédito. */
function IconTarjeta() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-on-secondary-fixed-variant/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

/** Ícono SVG de camión (envíos). */
function IconEnvio() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-on-secondary-fixed-variant/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

/** Datos de contacto con íconos. */
const CONTACTOS = [
  { icono: IconWhatsApp, label: 'WhatsApp', valor: '2494619971', href: 'https://wa.me/2494619971' },
  { icono: IconEmail,    label: 'Email',    valor: 'FORT@gmail.com',            href: 'mailto:FORT@gmail.com' },
  { icono: IconDireccion, label: 'Dirección', valor: 'Figueroa y Entre Rios, Tandil', href: undefined },
];

/** Enlaces de navegación — mismos que el nav principal. */
const NAV_LINKS = [
  { label: 'Inicio',     href: '/home' },
  { label: 'Productos',  href: '/productos' },
  { label: 'Categorías', href: '/home' },
  { label: 'Contacto',   href: '/contacto' },
];

/** Horarios de atención. */
const HORARIOS = [
  { dias: 'Lunes a Viernes', horario: '9:00 – 18:00 hs' },
  { dias: 'Sábados',         horario: '9:00 – 17:00 hs' },
  { dias: 'Domingos',        horario: 'Cerrado' },
];

/** Medios de pago y envío con íconos. */
const MEDIOS_PAGO = [
  { icono: IconTarjeta, texto: 'Tarjetas de crédito y débito' },
  { icono: IconTarjeta, texto: 'Efectivo en local' },
  { icono: IconTarjeta, texto: 'Transferencia bancaria' },
  { icono: IconEnvio,   texto: 'Envíos a todo el país' },
];

/**
 * Fat footer con cuatro columnas: contacto, navegación, horarios y medios de pago.
 * Alineado visualmente con el tema oscuro de la app.
 *
 * Estructura:
 * 1. Top — logo + slogan
 * 2. Grid 4 cols (responsive: 1 → 2 → 4)
 * 3. Bottom bar — copyright
 */
export default function Footer() {
  return (
    <footer className="bg-[#1b1b1c] text-on-secondary-fixed-variant mt-auto">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12">

        {/* ── Top: Logo + Slogan ── */}
        <div className="flex flex-col items-center text-center mb-10">
          <Link to="/home" className="mb-2">
            <img
              src={fotoLogo}
              alt="Herramientas Tandil"
              className="h-16 w-auto object-contain"
            />
          </Link>
          <p className="text-on-secondary-fixed-variant/80 text-sm max-w-md">
            Herramientas de calidad para profesionales y hogar. Más de 10 años en Tandil.
          </p>
        </div>

        {/* ── Columnas ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Col 1 — Contacto */}
          <div>
            <h3 className="font-label-bold uppercase text-on-secondary mb-4">
              Contacto
            </h3>
            <ul className="flex flex-col gap-3">
              {CONTACTOS.map(({ icono: Icono, label, valor, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target={label === 'WhatsApp' ? '_blank' : undefined}
                      rel={label === 'WhatsApp' ? 'noopener noreferrer' : undefined}
                      className="group flex items-start gap-2.5 text-on-secondary-fixed-variant hover:text-primary-fixed transition-colors"
                    >
                      <span className="mt-0.5"><Icono /></span>
                      <span className="text-sm">{valor}</span>
                    </a>
                  ) : (
                    <span className="group flex items-start gap-2.5 text-on-secondary-fixed-variant">
                      <span className="mt-0.5"><Icono /></span>
                      <span className="text-sm">{valor}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 2 — Navegación */}
          <div>
            <h3 className="font-label-bold uppercase text-on-secondary mb-4">
              Navegación
            </h3>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-on-secondary-fixed-variant hover:text-primary-fixed transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Horarios */}
          <div>
            <h3 className="font-label-bold uppercase text-on-secondary mb-4">
              Horarios
            </h3>
            <ul className="flex flex-col gap-3">
              {HORARIOS.map(({ dias, horario }) => (
                <li key={dias} className="flex items-start gap-2.5">
                  <span className="mt-0.5"><IconReloj /></span>
                  <div className="flex flex-col">
                    <span className="text-on-secondary text-sm font-medium">{dias}</span>
                    <span className="text-on-secondary-fixed-variant text-sm">{horario}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Medios de pago */}
          <div>
            <h3 className="font-label-bold uppercase text-on-secondary mb-4">
              Medios de pago
            </h3>
            <ul className="flex flex-col gap-3">
              {MEDIOS_PAGO.map(({ icono: Icono, texto }) => (
                <li key={texto} className="flex items-center gap-2.5">
                  <span><Icono /></span>
                  <span className="text-on-secondary-fixed-variant text-sm">{texto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-on-secondary-fixed-variant/60 text-xs">
            &copy; {new Date().getFullYear()} Herramientas Tandil. Todos los derechos reservados.
          </p>
          <p className="text-on-secondary-fixed-variant/60 text-xs">
            Desarrollado en Tandil por{' '}
            <a href="https://www.linkedin.com/in/joaquin-hevia3704/" target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-on-secondary-fixed-variant transition-colors"
            >Joaquin Hevia</a>
          </p>
        </div>

      </div>
    </footer>
  );
}
