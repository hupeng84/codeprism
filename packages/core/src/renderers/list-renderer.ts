import type { ListState } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

const COLOR_MAP: Record<string, { default: string; active: string; highlighted: string; found: string }> = {
  dark: { default: "#89b4fa", active: "#f9e2af", highlighted: "#fab387", found: "#a6e3a1" },
  light: { default: "#3b82f6", active: "#f59e0b", highlighted: "#f97316", found: "#22c55e" },
};

/**
 * Render a linear list structure (linked list, stack, queue) onto a canvas.
 */
export function renderListState(
  ctx: CanvasRenderingContext2D,
  state: ListState,
  w: number,
  h: number,
  theme: Theme = "dark"
): void {
  const c = getColors(theme);
  const colorMap = COLOR_MAP[theme] ?? COLOR_MAP.dark;
  const { nodes, operation, orientation } = state;
  const padding = 40;
  const nodeRadius = 24;
  const gap = 12;

  ctx.clearRect(0, 0, w, h);

  // ── background ──
  ctx.fillStyle = c.canvasBg;
  ctx.fillRect(0, 0, w, h);

  // ── draw title ──
  ctx.fillStyle = c.text;
  ctx.font = "14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Operation: ${operation}`, padding, 12);

  if (nodes.length === 0) {
    ctx.fillStyle = c.emptyText;
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    ctx.fillText("(empty)", w / 2, h / 2);
    return;
  }

  const isVertical = orientation === "vertical";
  const maxWidth = w - padding * 2;

  const nodeW = nodeRadius * 2;
  const nodeH = nodeRadius * 2;
  const totalW = nodes.length * nodeW + (nodes.length - 1) * gap;
  const startX = isVertical ? w / 2 : padding + Math.max(0, (maxWidth - totalW) / 2);
  const startY = isVertical ? padding * 2 : h / 2;

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const x = isVertical ? startX - nodeRadius : startX + i * (nodeW + gap);
    const y = isVertical ? startY + i * (nodeH + gap) : startY - nodeRadius;

    // Node background
    ctx.beginPath();
    if (isVertical) {
      // Rounded rect for vertical (stack)
      const r = 8;
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + nodeW - r, y);
      ctx.quadraticCurveTo(x + nodeW, y, x + nodeW, y + r);
      ctx.lineTo(x + nodeW, y + nodeH - r);
      ctx.quadraticCurveTo(x + nodeW, y + nodeH, x + nodeW - r, y + nodeH);
      ctx.lineTo(x + r, y + nodeH);
      ctx.quadraticCurveTo(x, y + nodeH, x, y + nodeH - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    } else {
      // Circle for horizontal (linked list / queue)
      ctx.arc(x + nodeRadius, y + nodeRadius, nodeRadius, 0, Math.PI * 2);
    }
    ctx.closePath();

    // Color
    ctx.fillStyle = colorMap[n.status] || colorMap.default;
    ctx.fill();

    ctx.strokeStyle = c.slotBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Value
    ctx.fillStyle = c.nodeValue;
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      String(n.value),
      x + (isVertical ? nodeW / 2 : nodeRadius),
      y + (isVertical ? nodeH / 2 : nodeRadius)
    );

    // Arrow between horizontal nodes
    if (!isVertical && i < nodes.length - 1) {
      const arrowStartX = x + nodeW + 2;
      const arrowStartY = y + nodeRadius;
      const arrowEndX = x + nodeW + gap - 2;
      ctx.strokeStyle = c.arrowColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowStartY);
      ctx.lineTo(arrowEndX, arrowStartY);
      ctx.stroke();
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowStartY);
      ctx.lineTo(arrowEndX - 6, arrowStartY - 4);
      ctx.lineTo(arrowEndX - 6, arrowStartY + 4);
      ctx.closePath();
      ctx.fillStyle = c.arrowColor;
      ctx.fill();
    }
  }

  // ── index labels for linked list ──
  if (!isVertical) {
    ctx.fillStyle = c.emptyText;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let i = 0; i < nodes.length; i++) {
      const x = startX + i * (nodeW + gap) + nodeRadius;
      ctx.fillText(String(i), x, startY + nodeRadius + 6);
    }
  }
}
