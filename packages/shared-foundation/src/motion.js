/**
 * Motion DES — duraciones oficiales y cuándo usar cada una.
 */
export const DAKINIS_MOTION = {
  hover: 150,
  dropdown: 200,
  modal: 250,
  navigation: 300,
  sidebar: 250,
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
  hoverScale: 1.02,
};

/** Guía de uso por contexto. */
export const DAKINIS_MOTION_USAGE = {
  hover: "Botones, cards, filas de tabla, iconos interactivos",
  dropdown: "Menús desplegables, selects, autocomplete",
  modal: "Diálogos, sheets, paneles modales",
  navigation: "Cambio de ruta, tabs principales, transiciones de vista",
  sidebar: "Apertura/cierre de sidebar y drawer",
};

/** @deprecated use DAKINIS_MOTION.hover etc. */
export const DAKINIS_MOTION_LEGACY = {
  durationFast: 120,
  duration: 180,
  durationSlow: 220,
  durationModal: 280,
  ease: DAKINIS_MOTION.ease,
  hoverScale: DAKINIS_MOTION.hoverScale,
};
