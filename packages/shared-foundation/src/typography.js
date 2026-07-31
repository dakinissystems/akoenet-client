export const DAKINIS_BRAND_FONT_STACK =
  '"Inter", system-ui, -apple-system, "Segoe UI", Arial, sans-serif';

export const DAKINIS_CODE_FONT_STACK =
  '"JetBrains Mono", "Fira Code", ui-monospace, "Cascadia Code", monospace';

/** Escala tipográfica oficial — no usar tamaños arbitrarios. */
export const DAKINIS_TYPE_SCALE = {
  display: { fontSize: "2.5rem", lineHeight: 1.1, fontWeight: 700 },
  h1: { fontSize: "2rem", lineHeight: 1.2, fontWeight: 700 },
  h2: { fontSize: "1.5rem", lineHeight: 1.25, fontWeight: 600 },
  h3: { fontSize: "1.25rem", lineHeight: 1.3, fontWeight: 600 },
  title: { fontSize: "1.125rem", lineHeight: 1.35, fontWeight: 600 },
  subtitle: { fontSize: "1rem", lineHeight: 1.4, fontWeight: 500 },
  body: { fontSize: "1rem", lineHeight: 1.5, fontWeight: 400 },
  caption: { fontSize: "0.875rem", lineHeight: 1.45, fontWeight: 400 },
  code: {
    fontSize: "0.875rem",
    lineHeight: 1.5,
    fontWeight: 400,
    fontFamily: DAKINIS_CODE_FONT_STACK,
  },
};

/** @deprecated use DAKINIS_TYPE_SCALE */
export const DAKINIS_BRAND_FONT_SIZES = {
  hero: "clamp(2rem, 5vw, 3.5rem)",
  h2: "clamp(1.5rem, 3vw, 2rem)",
  body: "1rem",
  small: "0.875rem",
};
