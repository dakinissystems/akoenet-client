/**
 * Niveles de superficie DES — misma profundidad en todas las apps.
 * Surface 0 = fondo · 1 = card · 2 = modal · 3 = popover · 4 = floating.
 */
export const DAKINIS_SURFACE_LEVELS = {
  0: "background",
  1: "card",
  2: "modal",
  3: "popover",
  4: "floating",
};

/** Valores oscuros por defecto (tema dark) por nivel. */
export const DAKINIS_SURFACE_STACK = {
  0: { bg: "#08111D", label: "background" },
  1: { bg: "#122840", label: "card" },
  2: { bg: "#17344E", label: "modal" },
  3: { bg: "#1E4060", label: "popover" },
  4: { bg: "#254B6E", label: "floating" },
};

/** Superficies planas legacy (texto, líneas). */
export const DAKINIS_SURFACES = {
  bg: DAKINIS_SURFACE_STACK[0].bg,
  surface: DAKINIS_SURFACE_STACK[1].bg,
  panel: DAKINIS_SURFACE_STACK[2].bg,
  text: "#f0f4f9",
  muted: "#b8c6d9",
  line: "#23415f",
};
