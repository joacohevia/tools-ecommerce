/**
 * Combina clases CSS condicionalmente, filtrando falsy values.
 * Patrón shadcn/ui — reemplaza template literals manuales.
 *
 * @param  {...(string|boolean|undefined|null)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}
