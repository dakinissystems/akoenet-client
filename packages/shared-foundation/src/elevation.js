/**
 * Elevación DES — sombras alineadas con --dakinis-elevation-* (Foundation CSS).
 */
import { DAKINIS_SURFACE_STACK } from "./surfaces.js";

export const DAKINIS_ELEVATION = {
  0: {
    cssVar: "--dakinis-elevation-0",
    shadow: "none",
    zIndex: 0,
    use: "Flat / flush con el fondo",
  },
  1: {
    cssVar: "--dakinis-elevation-1",
    shadow: "var(--dakinis-elevation-1)",
    zIndex: 1,
    use: "Chips, filas elevadas, controles flotantes ligeros",
  },
  2: {
    cssVar: "--dakinis-elevation-2",
    shadow: "var(--dakinis-elevation-2)",
    zIndex: 40,
    use: "Cards, paneles, DashboardCard",
  },
  3: {
    cssVar: "--dakinis-elevation-3",
    shadow: "var(--dakinis-elevation-3)",
    zIndex: 50,
    use: "Modales, popovers, command palette",
  },
};

/** Clases utilitarias (ver components/elevation.css). */
export const DAKINIS_ELEVATION_CLASSES = {
  0: "dakinis-elev-0",
  1: "dakinis-elev-1",
  2: "dakinis-elev-2",
  3: "dakinis-elev-3",
  card: "dakinis-elev-card",
  ai: "dakinis-elev-ai",
};

export const DAKINIS_ELEVATION_USAGE = {
  card: "Contenedores de contenido y KPIs (elev-2 / elev-card)",
  modal: "Dialogs y overlays (elev-3)",
  ai: "Superficies IA (elev-ai + borde ai)",
  surface: "Fondos vía dakinis-surface-0…4; no mezclar hex",
};

/** Mapeo superficie → token CSS de fondo. */
export const DAKINIS_SURFACE_CSS = Object.fromEntries(
  Object.keys(DAKINIS_SURFACE_STACK).map((level) => [
    level,
    `var(--dakinis-surface-${level})`,
  ])
);
