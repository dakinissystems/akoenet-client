/** Escala oficial DES (px) — prohibido usar otros valores en UI nueva. */
export const DAKINIS_SPACING_ALLOWED = [4, 8, 12, 16, 24, 32, 48, 64];

/** Tokens nombrados de la escala oficial. */
export const DAKINIS_SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

/** @deprecated use DAKINIS_SPACING — claves numéricas legacy */
export const DAKINIS_SPACING_LEGACY = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};

/** @param {number} value */
export function isAllowedSpacing(value) {
  return DAKINIS_SPACING_ALLOWED.includes(value);
}
