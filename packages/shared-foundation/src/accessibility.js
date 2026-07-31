/**
 * Fundamentos de accesibilidad DES — no solo WCAG como pendiente.
 */
export const DAKINIS_A11Y = {
  focusRingWidth: 3,
  focusRingCssVar: "--dakinis-focus-ring",
  focusRingAiCssVar: "--dakinis-focus-ring-ai",
  minContrastRatio: {
    body: 4.5,
    largeText: 3,
    ui: 3,
  },
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
  contrastQuery: "(prefers-contrast: more)",
  highContrastTheme: "high-contrast",
  keyboard: {
    skipLinkId: "dakinis-skip-to-content",
    mainContentId: "dakinis-main",
    trapSelector: '[data-dakinis-focus-trap="true"]',
  },
  aria: {
    livePolite: "polite",
    liveAssertive: "assertive",
  },
};

/** Checklist para revisión de pantallas. */
export const DAKINIS_A11Y_CHECKLIST = [
  "keyboard",
  "focus-visible rings on interactive controls",
  "contrast",
  "high-contrast theme QA (DES_HIGH_CONTRAST_QA)",
  "reduced-motion",
  "aria",
  "skip link → #dakinis-main",
  "screen-readers",
];
