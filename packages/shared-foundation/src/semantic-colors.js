/**
 * Colores semánticos DES — iguales en todo el ecosistema.
 * El acento de producto (--dakinis-accent) solo aplica a branding/navegación.
 */
export const DAKINIS_SEMANTIC_COLORS = {
  primary: { light: "#2dd4bf", dark: "#14b8a6", css: "var(--dakinis-primary)" },
  secondary: { light: "#64748b", dark: "#475569", css: "var(--dakinis-secondary)" },
  success: { light: "#22c55e", dark: "#16a34a", css: "var(--dakinis-success)" },
  warning: { light: "#f59e0b", dark: "#d97706", css: "var(--dakinis-warning)" },
  danger: { light: "#ef4444", dark: "#dc2626", css: "var(--dakinis-danger)" },
  info: { light: "#3b82f6", dark: "#2563eb", css: "var(--dakinis-info)" },
  neutral: { light: "#94a3b8", dark: "#64748b", css: "var(--dakinis-neutral)" },
};

/** IA — color transversal (no sustituye semantic primary del producto). */
export const DAKINIS_AI_ACCENT = {
  primary: "#7C3AED",
  primarySoft: "#A855F7",
  glow: "rgba(124, 58, 237, 0.22)",
  border: "rgba(168, 85, 247, 0.45)",
};
