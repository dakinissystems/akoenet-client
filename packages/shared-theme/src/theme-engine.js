/**
 * DES theme engine — dark / light / system + high-contrast + persistence.
 */

import { applyDesTheme, DAKINIS_THEMES } from "./themes.js";

export const DES_COLOR_MODES = /** @type {const} */ (["dark", "light", "system"]);

/**
 * @param {string} [namespace="dakinis"]
 * @param {string} [userId="anon"]
 */
export function desThemeStorageKey(namespace = "dakinis", userId = "anon") {
  return `${namespace}_ui_theme_${userId || "anon"}`;
}

export function prefersDarkScheme() {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function prefersHighContrast() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-contrast: more)").matches;
}

/**
 * Resolve effective appearance from mode.
 * @param {"dark"|"light"|"system"} mode
 * @returns {"dark"|"light"}
 */
export function resolveAppearance(mode) {
  if (mode === "system") return prefersDarkScheme() ? "dark" : "light";
  if (mode === "light") return "light";
  return "dark";
}

/**
 * @param {string} [raw]
 * @param {"dark"|"light"|"system"} [fallback="dark"]
 * @returns {"dark"|"light"|"system"}
 */
export function sanitizeColorMode(raw, fallback = "dark") {
  const m = String(raw || "").toLowerCase();
  if (DES_COLOR_MODES.includes(/** @type {"dark"|"light"|"system"} */ (m))) {
    return /** @type {"dark"|"light"|"system"} */ (m);
  }
  const f = String(fallback || "dark").toLowerCase();
  if (DES_COLOR_MODES.includes(/** @type {"dark"|"light"|"system"} */ (f))) {
    return /** @type {"dark"|"light"|"system"} */ (f);
  }
  return "dark";
}

/**
 * Load persisted color mode.
 * @param {{ namespace?: string; userId?: string; defaultMode?: "dark"|"light"|"system" }} [opts]
 */
export function loadDesColorMode(opts = {}) {
  const fallback = opts.defaultMode || "dark";
  if (typeof localStorage === "undefined") return sanitizeColorMode(fallback);
  try {
    const raw = localStorage.getItem(desThemeStorageKey(opts.namespace, opts.userId));
    if (!raw) return sanitizeColorMode(fallback);
    const parsed = JSON.parse(raw);
    return sanitizeColorMode(parsed?.colorMode ?? parsed, fallback);
  } catch {
    return sanitizeColorMode(fallback);
  }
}

/**
 * @param {"dark"|"light"|"system"} mode
 * @param {{ namespace?: string; userId?: string }} [opts]
 */
export function saveDesColorMode(mode, opts = {}) {
  if (typeof localStorage === "undefined") return;
  const colorMode = sanitizeColorMode(mode);
  const prev = (() => {
    try {
      return JSON.parse(localStorage.getItem(desThemeStorageKey(opts.namespace, opts.userId)) || "{}");
    } catch {
      return {};
    }
  })();
  localStorage.setItem(
    desThemeStorageKey(opts.namespace, opts.userId),
    JSON.stringify({ ...prev, colorMode })
  );
  return colorMode;
}

export function loadDesHighContrast(opts = {}) {
  if (typeof localStorage === "undefined") return false;
  try {
    const raw = localStorage.getItem(desThemeStorageKey(opts.namespace, opts.userId));
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.highContrast);
  } catch {
    return false;
  }
}

export function saveDesHighContrast(enabled, opts = {}) {
  if (typeof localStorage === "undefined") return;
  const prev = (() => {
    try {
      return JSON.parse(localStorage.getItem(desThemeStorageKey(opts.namespace, opts.userId)) || "{}");
    } catch {
      return {};
    }
  })();
  localStorage.setItem(
    desThemeStorageKey(opts.namespace, opts.userId),
    JSON.stringify({ ...prev, highContrast: Boolean(enabled) })
  );
}

/**
 * Apply resolved theme to <html data-theme> (+ optional product).
 * @param {{
 *   colorMode?: "dark"|"light"|"system";
 *   highContrast?: boolean;
 *   product?: string;
 *   namespace?: string;
 *   userId?: string;
 *   persist?: boolean;
 *   defaultMode?: "dark"|"light"|"system";
 * }} [opts]
 */
export function applyDesColorMode(opts = {}) {
  const colorMode = sanitizeColorMode(
    opts.colorMode ?? loadDesColorMode({ ...opts, defaultMode: opts.defaultMode }),
    opts.defaultMode || "dark"
  );
  const highContrast =
    typeof opts.highContrast === "boolean"
      ? opts.highContrast
      : loadDesHighContrast(opts);

  if (opts.persist !== false) {
    saveDesColorMode(colorMode, opts);
    saveDesHighContrast(highContrast, opts);
  }

  const appearance = resolveAppearance(colorMode);
  let theme =
    appearance === "light" && DAKINIS_THEMES.includes("light") ? "light" : "dark";
  if (highContrast && DAKINIS_THEMES.includes("high-contrast")) {
    theme = "high-contrast";
  }

  applyDesTheme({ theme, product: opts.product });
  if (typeof document !== "undefined") {
    document.documentElement.dataset.colorMode = colorMode;
    document.documentElement.dataset.highContrast = highContrast ? "true" : "false";
    document.documentElement.style.colorScheme = appearance;
  }
  return { colorMode, appearance: theme, highContrast };
}

/**
 * Bootstrap product theme (Hub default = system).
 * @param {{
 *   product: string;
 *   namespace?: string;
 *   userId?: string;
 *   defaultMode?: "dark"|"light"|"system";
 * }} opts
 */
export function bootstrapDesAppearance(opts) {
  const namespace = opts.namespace || opts.product || "dakinis";
  const defaultMode = opts.defaultMode || "dark";
  const applied = applyDesColorMode({
    product: opts.product,
    namespace,
    userId: opts.userId,
    defaultMode,
    colorMode: loadDesColorMode({ namespace, userId: opts.userId, defaultMode }),
    highContrast: loadDesHighContrast({ namespace, userId: opts.userId }),
  });

  const unsub = watchSystemColorScheme(() => {
    const mode = loadDesColorMode({ namespace, userId: opts.userId, defaultMode });
    if (mode === "system") {
      applyDesColorMode({
        product: opts.product,
        namespace,
        userId: opts.userId,
        colorMode: "system",
        highContrast: loadDesHighContrast({ namespace, userId: opts.userId }),
        defaultMode,
      });
    }
  });

  return { ...applied, unsubscribe: unsub };
}

/**
 * Subscribe to system preference when colorMode === system.
 * @param {(appearance: "dark"|"light") => void} onChange
 * @returns {() => void} unsubscribe
 */
export function watchSystemColorScheme(onChange) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => onChange(mq.matches ? "dark" : "light");
  mq.addEventListener?.("change", handler);
  return () => mq.removeEventListener?.("change", handler);
}

/** QA checklist high-contrast (DES v1.1). */
export const DES_HIGH_CONTRAST_QA = [
  "data-theme=high-contrast aplicado",
  "texto vs surface contraste ≥ 7:1 (objetivo AAA cuerpo)",
  "bordes visibles (line blanca / fuerte)",
  "focus ring no depende solo de color de acento",
  "estados success/warning/danger distinguibles sin color solo",
  "elevación no es el único indicador (HC apaga sombras)",
  "prefers-contrast: more refuerza muted/line en temas normales",
];
