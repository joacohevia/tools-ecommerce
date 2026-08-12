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

/**
 * Calcula las páginas a mostrar en un paginador, con elipsis en los saltos.
 *
 * Con 7 páginas o menos devuelve todas sin elipsis. Con más, muestra siempre
 * la primera y la última, la página actual con un delta de 1 alrededor, y
 * rellena los saltos con '…'.
 *
 * @param {number} pagina - Página actual (1-indexada)
 * @param {number} totalPaginas - Total de páginas
 * @returns {(number|'…')[]} Secuencia de números y marcadores de elipsis
 */
export function calcularPaginas(pagina, totalPaginas) {
  if (totalPaginas <= 7) {
    return Array.from({ length: totalPaginas }, (_, i) => i + 1);
  }

  const delta = 1;
  const rango = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= pagina - delta && i <= pagina + delta)) {
      rango.push(i);
    }
  }

  const resultado = [];
  let ultimo;
  rango.forEach((i) => {
    if (ultimo && i - ultimo === 2) {
      resultado.push(ultimo + 1);
    } else if (ultimo && i - ultimo !== 1) {
      resultado.push('…');
    }
    resultado.push(i);
    ultimo = i;
  });

  return resultado;
}
