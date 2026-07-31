/**
 * CJS bridge for Tailwind configs that use require().
 * Source of truth: tailwind-preset.js (ESM).
 */
const desTailwindColors = {
  surface: {
    0: "var(--dakinis-surface-0)",
    1: "var(--dakinis-surface-1)",
    2: "var(--dakinis-surface-2)",
    3: "var(--dakinis-surface-3)",
    4: "var(--dakinis-surface-4)",
    DEFAULT: "var(--dakinis-surface-1)",
  },
  accent: {
    DEFAULT: "var(--dakinis-accent)",
    dark: "var(--dakinis-accent-dark)",
    soft: "var(--dakinis-accent-soft)",
  },
  ink: {
    DEFAULT: "var(--dakinis-text)",
    muted: "var(--dakinis-muted)",
  },
  line: "var(--dakinis-line)",
  ai: {
    DEFAULT: "var(--dakinis-ai)",
    soft: "var(--dakinis-ai-soft)",
  },
  success: "var(--dakinis-success)",
  warning: "var(--dakinis-warning)",
  danger: "var(--dakinis-danger)",
};

const desTailwindThemeExtend = {
  colors: desTailwindColors,
  fontFamily: {
    sans: ["var(--dakinis-font-sans)"],
    mono: ["var(--dakinis-font-mono)"],
  },
  borderRadius: {
    sm: "var(--dakinis-radius-sm)",
    md: "var(--dakinis-radius-md)",
    lg: "var(--dakinis-radius-lg)",
    card: "var(--dakinis-radius-card)",
  },
  spacing: {
    "des-xs": "var(--dakinis-space-xs)",
    "des-sm": "var(--dakinis-space-sm)",
    "des-md": "var(--dakinis-space-md)",
    "des-base": "var(--dakinis-space-base)",
    "des-lg": "var(--dakinis-space-lg)",
    "des-xl": "var(--dakinis-space-xl)",
  },
  boxShadow: {
    card: "var(--dakinis-shadow-card)",
    "elevation-1": "var(--dakinis-elevation-1)",
    "elevation-2": "var(--dakinis-elevation-2)",
    "elevation-3": "var(--dakinis-elevation-3)",
  },
  transitionDuration: {
    des: "var(--dakinis-motion-hover)",
    "des-modal": "var(--dakinis-motion-modal)",
  },
};

module.exports = {
  desTailwindColors,
  desTailwindThemeExtend,
  default: desTailwindThemeExtend,
};
