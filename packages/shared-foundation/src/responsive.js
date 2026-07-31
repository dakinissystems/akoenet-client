/** Breakpoints oficiales DES. */
export const DAKINIS_BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

/**
 * Layouts responsivos — qué chrome aparece en cada viewport.
 * foldable usa las mismas reglas que mobile hasta breakpoint tablet.
 */
export const DAKINIS_RESPONSIVE_LAYOUT = {
  mobile: {
    sidebar: "drawer",
    navigation: "bottom",
    header: "compact",
    floatingActions: true,
  },
  tablet: {
    sidebar: "collapsible",
    navigation: "sidebar",
    header: "standard",
    floatingActions: false,
  },
  desktop: {
    sidebar: "fixed",
    navigation: "sidebar",
    header: "standard",
    floatingActions: false,
  },
};

/** @param {number} width */
export function getResponsiveLayout(width) {
  if (width >= DAKINIS_BREAKPOINTS.desktop) return DAKINIS_RESPONSIVE_LAYOUT.desktop;
  if (width >= DAKINIS_BREAKPOINTS.tablet) return DAKINIS_RESPONSIVE_LAYOUT.tablet;
  return DAKINIS_RESPONSIVE_LAYOUT.mobile;
}
