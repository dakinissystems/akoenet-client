import { DAKINIS_PRODUCT_THEMES } from "./product-accents.js";

/** Temas globales soportados por todas las apps. */
export const DAKINIS_THEMES = ["dark", "light", "high-contrast"];

/**
 * Aplica tema y producto en el documento (data attributes).
 * @param {{ product?: string; theme?: string }} opts
 */
export function applyDesTheme(opts = {}) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (opts.theme) root.setAttribute("data-theme", opts.theme);
  if (opts.product) root.setAttribute("data-product", opts.product);
}

/** Devuelve acento de branding para un producto. */
export function getProductAccent(productId) {
  return DAKINIS_PRODUCT_THEMES[productId] || DAKINIS_PRODUCT_THEMES.core;
}
