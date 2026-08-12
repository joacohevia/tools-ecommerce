/**
 * Datos de la cuenta bancaria para transferencias.
 *
 * Pegar acá el alias y el titular de la cuenta que recibe los pagos.
 * Estos valores se muestran en la pantalla de confirmación de compra
 * y se incluyen al final del mensaje de WhatsApp.
 */
const pagoConfig = {
  alias: 'default', // <-- pegar alias acá (ej: 'ferreteria.tandil')
  titular: 'default', // <-- pegar nombre del titular acá (ej: 'Ferreteria Tandil S.A.')
};

export default pagoConfig;
