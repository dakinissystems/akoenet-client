/**
 * Bridge: AkoeNet theme preferences → DES theme-engine API.
 * Canonical engine: @dakinis/shared-brand/theme-engine
 * AkoeNet keeps local palettes (Nexora); this syncs data-theme for DES consumers.
 */
import { applyDesColorMode, resolveAppearance, sanitizeColorMode } from "./desThemeEngine.local.js";

/**
 * Map AkoeNet colorMode onto <html data-theme> without replacing Nexora CSS vars.
 * @param {{ colorMode?: string }} theme
 * @param {{ product?: string }} [opts]
 */
export function syncAkoeNetModeToDes(theme, opts = {}) {
  const colorMode = sanitizeColorMode(theme?.colorMode);
  return applyDesColorMode({
    colorMode,
    product: opts.product || "akoenet",
    persist: false,
    namespace: "akoenet-des-bridge",
  });
}

export { resolveAppearance, sanitizeColorMode };
