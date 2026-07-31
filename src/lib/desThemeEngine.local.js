/**
 * Local copy of DES theme-engine (minimal) so AkoeNet Client can deploy without monorepo package.
 * Keep in sync with packages/shared-brand/src/theme-engine.js
 */

const DES_COLOR_MODES = ["dark", "light", "system"];

export function sanitizeColorMode(raw) {
  const m = String(raw || "dark").toLowerCase();
  return DES_COLOR_MODES.includes(m) ? m : "dark";
}

export function prefersDarkScheme() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveAppearance(mode) {
  if (mode === "system") return prefersDarkScheme() ? "dark" : "light";
  if (mode === "light") return "light";
  return "dark";
}

export function applyDesColorMode(opts = {}) {
  const colorMode = sanitizeColorMode(opts.colorMode);
  const appearance = resolveAppearance(colorMode);
  const theme = appearance === "light" ? "light" : "dark";
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (opts.product) root.setAttribute("data-product", opts.product);
    root.dataset.colorMode = colorMode;
    root.style.colorScheme = appearance;
  }
  return { colorMode, appearance: theme };
}
