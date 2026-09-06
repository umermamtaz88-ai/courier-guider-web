/** Centralized design tokens for Courier Guider */

export const colors = {
  background: "#0d0c0b",
  foreground: "#f5f0e8",
  surface: "#131110",
  surfaceElevated: "#1a1816",
  border: "rgba(181, 155, 109, 0.12)",
  brass: "#b59b6d",
  brassLight: "#c9b896",
  ink: "#0d0c0b",
  muted: "#8a8278",
  success: "#6b9e78",
  warning: "#c4a35a",
  error: "#c47070",
  info: "#7a9eb5",
  purple: "#9b8ab5",
} as const;

export const typography = {
  serif: "var(--font-cormorant), Georgia, serif",
  sans: "var(--font-dm-sans), system-ui, sans-serif",
  mono: "var(--font-geist-mono), monospace",
} as const;

export const spacing = {
  sidebar: "280px",
  evidencePanel: "360px",
  composerMaxHeight: "160px",
} as const;

export const radius = {
  sm: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
} as const;

export const animation = {
  fast: "150ms",
  normal: "200ms",
  slow: "400ms",
  easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
} as const;

export const zIndex = {
  drawer: 40,
  drawerPanel: 50,
  newMessageButton: 10,
  texture: 9999,
} as const;

export const scroll = {
  bottomThreshold: 120,
} as const;
