/**
 * Atribución de derechos de autor del cliente web AkoeNet.
 */

export const COPYRIGHT_HOLDER = 'Dakinis Systems'

function isSpanishCopyrightLocale(locale) {
  return String(locale ?? 'en').toLowerCase().startsWith('es')
}

function copyrightTradingNameSuffix(locale) {
  return isSpanishCopyrightLocale(locale)
    ? 'Todos los derechos reservados.'
    : 'All rights reserved.'
}

function getCopyrightDisplayYear() {
  return new Date().getFullYear()
}

/**
 * @param {string} [locale]
 */
export function clientCopyrightLineParts(locale) {
  return {
    year: getCopyrightDisplayYear(),
    holder: COPYRIGHT_HOLDER,
    suffix: copyrightTradingNameSuffix(locale),
  }
}

/**
 * @param {string} [locale]
 */
export function dakinisCopyrightNotice(locale = 'en') {
  const { year, holder, suffix } = clientCopyrightLineParts(locale)
  return `© ${year} ${holder} ${suffix}`
}
