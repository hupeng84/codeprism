import type { TreeNode, TreeState } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

const V_SPACING = 70;
const H_SPACING = 55;
const PAD_LEFT = 30;
const PAD_TOP = 50;
const RADIUS = 18;

const NODE_COLORS: Record<string, { fill: string; stroke: string }> = {
  default: { fill: "rgba(255,255,255,0.08)", stroke: "rgba(255,255,255,0.2)" },
  visiting: { fill: "rgba(255,217,61,0.18)", stroke: "#FFD93D" },
  inserted: { fill: "rgba(78,205,196,0.18)", stroke: "#4ECDC4" },
  found: { fill: "rgba(78,205,196,0.18)", stroke: "#4ECDC4" },
  deleted: { fill: "rgba(255,107,107,0.18)", stroke: "#FF6B6B" },
};

const NODE_COLORS_LIGHT: Record<string, { fill: string; stroke: string }> = {
  default: { fill: "rgba(0,0,0,0.06)", stroke: "rgba(0,0,0,0.2)" },
  visiting: { fill: "rgba(245,158,11,0.15)", stroke: "#f59e0b" },
  inserted: { fill: "rgba(34,197,94,0.15)", stroke: "#22c55e" },
  found: { fill: "rgba(34,197,94,0.15)", stroke: "#22c55e" },
  deleted: { fill: "rgba(239,68,68,0.15)", stroke: "#ef4444" },
};

/**
 * Render a BST TreeState onto a Canvas element.
 * Computes in-order layout and draws nodes + edges.
 */
export function renderTreeState(
  ctx: CanvasRenderingContext2D,
  state: TreeState,
  width: number,
  height: number,
  theme: Theme = "dark"
) {
  const c = getColors(theme);
  const nodeColors = theme === "light" ? NODE_COLORS_LIGHT : NODE_COLORS;
  const { root, operation } = state;
  ctx.clearRect(0, 0, width, height);

  if (!root) {
    ctx.fillStyle = c.empty;
    ctx.font = "14px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("(Empty Tree)", width / 2, height / 2);
    return;
  }

  // --- 1. Compute positions (in-order traversal) ---
  const pos = new Map<string, { x: number; y: number }>();

  let idx = 0;
  function traverse(node: TreeNode | null, depth: number) {
    if (!node) return;
    traverse(node.left, depth + 1);
    pos.set(node.id, {
      x: PAD_LEFT + idx * H_SPACING,
      y: PAD_TOP + depth * V_SPACING,
    });
    idx++;
    traverse(node.right, depth + 1);
  }
  traverse(root, 0);

  // --- 2. Draw edges ---
  function drawEdges(node: TreeNode | null) {
    if (!node) return;
    const p = pos.get(node.id);
    if (!p) return;

    if (node.left) {
      const lp = pos.get(node.left.id);
      if (lp) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + RADIUS);
        ctx.lineTo(lp.x, lp.y - RADIUS);
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      drawEdges(node.left);
    }
    if (node.right) {
      const rp = pos.get(node.right.id);
      if (rp) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + RADIUS);
        ctx.lineTo(rp.x, rp.y - RADIUS);
        ctx.strokeStyle = c.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      drawEdges(node.right);
    }
  }
  drawEdges(root);

  // --- 3. Draw nodes ---
  function drawNode(node: TreeNode | null) {
    if (!node) return;
    const p = pos.get(node.id);
    if (!p) return;

    const colors = nodeColors[node.status] ?? nodeColors.default;

    ctx.beginPath();
    ctx.arc(p.x, p.y, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = colors.fill;
    ctx.fill();
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value label
    ctx.fillStyle = c.text;
    ctx.font = "bold 13px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(node.value), p.x, p.y);

    drawNode(node.left);
    drawNode(node.right);
  }
  drawNode(root);

  // --- 4. Operation label ---
  ctx.fillStyle = c.textDim;
  ctx.font = "12px DM Sans, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(operation, 14, 22);
}
