/**
 * Shared design system for the entire admin panel (POS).
 * All admin pages MUST import from here — no local D/P objects.
 */

export const T = {
  // Backgrounds
  bg: "#151820",
  card: "#1A1F2E",
  cardElevated: "#1E2536",
  surface: "#161B27",
  input: "#131720",

  // Borders
  border: "#252D3D",
  borderLight: "#2A3348",

  // Brand
  brand: "#D42B2B",

  // Text
  text: "#F1F3F8",
  textSecondary: "#CDD2DE",
  textMuted: "#8892A6",
  textDim: "#5C6478",

  // Sidebar
  sidebar: "#0B0D14",
  sidebarBorder: "#1E2330",
  topbar: "#111520",
  topbarBorder: "#1E2330",
} as const;

/** Status colors for orders — used everywhere: orders, dashboard, cash register */
export const STATUS = {
  recibido:   { hex: "#3B82F6", bg: "rgba(59,130,246,0.12)",  text: "#60A5FA", label: "Nuevo",     border: "#3B82F6" },
  preparando: { hex: "#F59E0B", bg: "rgba(245,158,11,0.12)",  text: "#FBBF24", label: "En cocina", border: "#F59E0B" },
  listo:      { hex: "#10B981", bg: "rgba(16,185,129,0.12)",  text: "#34D399", label: "Listo",     border: "#10B981" },
  entregado:  { hex: "#6B7280", bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", label: "Entregado", border: "#6B7280" },
} as const;

/** Accent colors for metrics/stats */
export const ACCENT = {
  blue: "#3B82F6",
  amber: "#F59E0B",
  green: "#10B981",
  purple: "#A78BFA",
  cyan: "#0891B2",
  red: "#D42B2B",
  gray: "#6B7280",
} as const;

/** Mesa avatar colors — stable per mesa number */
export const MESA_COLORS = ["#3B82F6", "#7C3AED", "#DB2777", "#F59E0B", "#10B981", "#0891B2", "#DC2626", "#4F46E5"];
