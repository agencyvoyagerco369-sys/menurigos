/**
 * Shared design system for the entire admin panel (POS).
 * All admin pages MUST import from here — no local D/P objects.
 */

export const T = {
  // Backgrounds
  bg: "#F9FAFB", // Gris muy claro casi blanco
  card: "#FFFFFF",
  cardElevated: "#F3F4F6",
  surface: "#FFFFFF",
  input: "#F9FAFB",

  // Borders
  border: "#E5E7EB",
  borderLight: "#F3F4F6",

  // Brand (Mantendremos un rojo/naranja pero más limpio para el Admin)
  brand: "#EA580C", // Naranja rojizo oscuro

  // Text
  text: "#111827",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  textDim: "#9CA3AF",

  // Sidebar
  sidebar: "#FFFFFF",
  sidebarBorder: "#E5E7EB",
  topbar: "#FFFFFF",
  topbarBorder: "#E5E7EB",
} as const;

/** Status colors for orders — used everywhere: orders, dashboard, cash register */
export const STATUS = {
  recibido: { hex: "#3B82F6", bg: "rgba(59,130,246,0.12)", text: "#60A5FA", label: "Nuevo", border: "#3B82F6" },
  preparando: { hex: "#F59E0B", bg: "rgba(245,158,11,0.12)", text: "#FBBF24", label: "En cocina", border: "#F59E0B" },
  listo: { hex: "#10B981", bg: "rgba(16,185,129,0.12)", text: "#34D399", label: "Listo", border: "#10B981" },
  entregado: { hex: "#6B7280", bg: "rgba(107,114,128,0.12)", text: "#9CA3AF", label: "Entregado", border: "#6B7280" },
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
