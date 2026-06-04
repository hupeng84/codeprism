export type Theme = "dark" | "light";

interface ThemeColorSet {
  bg: string;
  default: string;
  defaultFill: string;
  defaultBorder: string;
  text: string;
  textDim: string;
  textMuted: string;
  border: string;
  headerBg: string;
  headerText: string;
  cellText: string;
  cellBorder: string;
  empty: string;
  legendText: string;
  slotEmpty: string;
  slotOccupied: string;
  slotActive: string;
  slotBorder: string;
  slotIndex: string;
  nodeDefault: string;
  nodeActive: string;
  nodeHighlighted: string;
  nodeFound: string;
  nodeValue: string;
  arrowColor: string;
  emptyText: string;
  canvasBg: string;
}

/** Theme-aware color palettes for canvas renderers */
export const themeColors: Record<Theme, ThemeColorSet> = {
  dark: {
    bg: "rgba(255,255,255,0.03)",
    default: "rgba(255,255,255,0.12)",
    defaultFill: "rgba(255,255,255,0.08)",
    defaultBorder: "rgba(255,255,255,0.15)",
    text: "rgba(255,255,255,0.7)",
    textDim: "rgba(255,255,255,0.35)",
    textMuted: "rgba(255,255,255,0.2)",
    border: "rgba(255,255,255,0.1)",
    headerBg: "rgba(255,255,255,0.08)",
    headerText: "rgba(255,255,255,0.5)",
    cellText: "rgba(255,255,255,0.85)",
    cellBorder: "rgba(255,255,255,0.1)",
    empty: "rgba(255,255,255,0.2)",
    legendText: "rgba(255,255,255,0.35)",
    slotEmpty: "#313244",
    slotOccupied: "#45475a",
    slotActive: "#f9e2af",
    slotBorder: "#585b70",
    slotIndex: "#6c7086",
    nodeDefault: "#89b4fa",
    nodeActive: "#f9e2af",
    nodeHighlighted: "#fab387",
    nodeFound: "#a6e3a1",
    nodeValue: "#1e1e2e",
    arrowColor: "#585b70",
    emptyText: "#6c7086",
    canvasBg: "#1e1e2e",
  },
  light: {
    bg: "rgba(0,0,0,0.03)",
    default: "rgba(0,0,0,0.15)",
    defaultFill: "rgba(0,0,0,0.08)",
    defaultBorder: "rgba(0,0,0,0.15)",
    text: "rgba(0,0,0,0.7)",
    textDim: "rgba(0,0,0,0.45)",
    textMuted: "rgba(0,0,0,0.25)",
    border: "rgba(0,0,0,0.12)",
    headerBg: "rgba(0,0,0,0.06)",
    headerText: "rgba(0,0,0,0.55)",
    cellText: "rgba(0,0,0,0.85)",
    cellBorder: "rgba(0,0,0,0.12)",
    empty: "rgba(0,0,0,0.25)",
    legendText: "rgba(0,0,0,0.45)",
    slotEmpty: "#e5e7eb",
    slotOccupied: "#d1d5db",
    slotActive: "#fbbf24",
    slotBorder: "#9ca3af",
    slotIndex: "#6b7280",
    nodeDefault: "#3b82f6",
    nodeActive: "#f59e0b",
    nodeHighlighted: "#f97316",
    nodeFound: "#22c55e",
    nodeValue: "#ffffff",
    arrowColor: "#6b7280",
    emptyText: "#9ca3af",
    canvasBg: "#f9fafb",
  },
} as const;

/** Get colors for the given theme */
export function getColors(theme: Theme) {
  return themeColors[theme];
}
