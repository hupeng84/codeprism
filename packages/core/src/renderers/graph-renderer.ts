import type { GraphState } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

const NODE_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  default: { fill: "rgba(255,255,255,0.06)", stroke: "rgba(255,255,255,0.2)", text: "rgba(255,255,255,0.6)" },
  visiting: { fill: "rgba(255,217,61,0.2)", stroke: "#FFD93D", text: "#FFD93D" },
  visited: { fill: "rgba(78,205,196,0.15)", stroke: "#4ECDC4", text: "#4ECDC4" },
  found: { fill: "rgba(78,205,196,0.25)", stroke: "#4ECDC4", text: "#fff" },
  current: { fill: "rgba(255,107,107,0.2)", stroke: "#FF6B6B", text: "#FF6B6B" },
};

const NODE_COLORS_LIGHT: Record<string, { fill: string; stroke: string; text: string }> = {
  default: { fill: "rgba(0,0,0,0.06)", stroke: "rgba(0,0,0,0.2)", text: "rgba(0,0,0,0.6)" },
  visiting: { fill: "rgba(245,158,11,0.15)", stroke: "#f59e0b", text: "#f59e0b" },
  visited: { fill: "rgba(34,197,94,0.12)", stroke: "#22c55e", text: "#22c55e" },
  found: { fill: "rgba(34,197,94,0.2)", stroke: "#22c55e", text: "#fff" },
  current: { fill: "rgba(239,68,68,0.15)", stroke: "#ef4444", text: "#ef4444" },
};

const EDGE_COLORS: Record<string, string> = {
  default: "rgba(255,255,255,0.1)",
  traversing: "#FFD93D",
  traversed: "#4ECDC4",
  highlighted: "#FF6B6B",
};

const EDGE_COLORS_LIGHT: Record<string, string> = {
  default: "rgba(0,0,0,0.12)",
  traversing: "#f59e0b",
  traversed: "#22c55e",
  highlighted: "#ef4444",
};

const NODE_RADIUS = 22;

/**
 * Render a GraphState onto a Canvas element.
 */
export function renderGraphState(
  ctx: CanvasRenderingContext2D,
  state: GraphState,
  width: number,
  height: number,
  theme: Theme = "dark"
) {
  const c = getColors(theme);
  const nodeColors = theme === "light" ? NODE_COLORS_LIGHT : NODE_COLORS;
  const edgeColors = theme === "light" ? EDGE_COLORS_LIGHT : EDGE_COLORS;
  const { nodes, edges, operation } = state;
  ctx.clearRect(0, 0, width, height);

  if (nodes.length === 0) {
    ctx.fillStyle = c.empty;
    ctx.font = "14px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("(Empty Graph)", width / 2, height / 2);
    return;
  }

  // --- 1. Draw edges ---
  for (const edge of edges) {
    const from = nodes.find((n) => n.id === edge.from);
    const to = nodes.find((n) => n.id === edge.to);
    if (!from || !to) continue;

    const color = edgeColors[edge.status];
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = edge.status === "default" ? 1.5 : 3;
    ctx.stroke();

    // Arrow head
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 10;
    const ax = to.x - (NODE_RADIUS + 2) * Math.cos(angle);
    const ay = to.y - (NODE_RADIUS + 2) * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(
      ax - headLen * Math.cos(angle - Math.PI / 6),
      ay - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(ax, ay);
    ctx.lineTo(
      ax - headLen * Math.cos(angle + Math.PI / 6),
      ay - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // --- 2. Draw nodes ---
  for (const node of nodes) {
    const colors = nodeColors[node.status];

    // Glow for active nodes
    if (node.status !== "default") {
      ctx.save();
      ctx.shadowColor = colors.stroke;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = colors.stroke;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = node.status !== "default" ? 2.5 : 1.5;
    ctx.stroke();

    // Label
    ctx.fillStyle = colors.text;
    ctx.font = "bold 14px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label, node.x, node.y);
  }

  // --- 3. Operation label ---
  ctx.fillStyle = c.textDim;
  ctx.font = "12px DM Sans, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(operation, 14, 22);

  // --- 4. Legend ---
  const legend = [
    { label: "Default", color: nodeColors.default.stroke },
    { label: "Visiting", color: nodeColors.visiting.stroke },
    { label: "Visited", color: nodeColors.visited.stroke },
    { label: "Current", color: nodeColors.current.stroke },
  ];
  let lx = width - 10;
  for (let i = legend.length - 1; i >= 0; i--) {
    const item = legend[i];
    const tw = ctx.measureText(item.label).width;
    const iw = tw + 20;
    lx -= iw;
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.arc(lx + 5, 16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.legendText;
    ctx.font = "11px DM Sans, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(item.label, lx + 14, 21);
  }
}
