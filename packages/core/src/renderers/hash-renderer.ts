import type { HashState } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

const ENTRY_COLORS: Record<string, { default: string; active: string; collision: string; found: string }> = {
  dark: { default: "#89b4fa", active: "#f9e2af", collision: "#fab387", found: "#a6e3a1" },
  light: { default: "#3b82f6", active: "#f59e0b", collision: "#f97316", found: "#22c55e" },
};

/**
 * Render a hash table state onto a canvas.
 */
export function renderHashState(
  ctx: CanvasRenderingContext2D,
  state: HashState,
  w: number,
  h: number,
  theme: Theme = "dark"
): void {
  const c = getColors(theme);
  const entryColors = ENTRY_COLORS[theme] ?? ENTRY_COLORS.dark;
  const { slots, operation, size } = state;
  const padding = 40;

  ctx.clearRect(0, 0, w, h);

  // ── background ──
  ctx.fillStyle = c.canvasBg;
  ctx.fillRect(0, 0, w, h);

  // ── title ──
  ctx.fillStyle = c.text;
  ctx.font = "14px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Operation: ${operation}`, padding, 12);

  const slotH = 36;
  const slotGap = 4;
  const totalSlotsH = size * (slotH + slotGap);
  const startY = Math.max(padding, (h - totalSlotsH) / 2);
  const slotW = 60;
  const chainStartX = padding + slotW + 10;
  const maxChainW = w - chainStartX - padding;

  for (let i = 0; i < size; i++) {
    const slot = slots[i] || { index: i, entries: [], status: "empty" };
    const y = startY + i * (slotH + slotGap);

    // Draw slot bucket
    const bucketColor: Record<string, string> = {
      empty: c.slotEmpty,
      occupied: c.slotOccupied,
      active: c.slotActive,
    };
    ctx.fillStyle = bucketColor[slot.status] || c.slotEmpty;
    ctx.strokeStyle = c.slotBorder;
    ctx.lineWidth = 1;
    ctx.fillRect(padding, y, slotW, slotH);
    ctx.strokeRect(padding, y, slotW, slotH);

    // Slot index
    ctx.fillStyle = c.slotIndex;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`[${i}]`, padding + slotW / 2, y + slotH / 2);

    // Draw chained entries
    if (slot.entries.length > 0) {
      let cx = chainStartX;
      for (const entry of slot.entries) {
        const entryW = Math.min(80, maxChainW);
        const entryH = slotH - 4;
        const ey = y + 2;

        ctx.fillStyle = entryColors[entry.status] || entryColors.default;
        ctx.strokeStyle = c.slotBorder;
        ctx.lineWidth = 1;
        ctx.fillRect(cx, ey, entryW, entryH);
        ctx.strokeRect(cx, ey, entryW, entryH);

        // Key:Value
        const label = `${entry.key}:${entry.value}`;
        ctx.fillStyle = c.nodeValue;
        ctx.font = "11px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, cx + entryW / 2, ey + entryH / 2);

        cx += entryW + 4;

        // Arrow between entries
        if (cx < chainStartX + maxChainW) {
          ctx.strokeStyle = c.arrowColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(cx - 4, ey + entryH / 2);
          ctx.lineTo(cx, ey + entryH / 2);
          ctx.stroke();
          // arrowhead
          ctx.beginPath();
          ctx.moveTo(cx, ey + entryH / 2);
          ctx.lineTo(cx - 3, ey + entryH / 2 - 3);
          ctx.lineTo(cx - 3, ey + entryH / 2 + 3);
          ctx.closePath();
          ctx.fillStyle = c.arrowColor;
          ctx.fill();
        }
      }
    } else if (slot.status !== "empty") {
      // Empty slot marker
      ctx.fillStyle = c.emptyText;
      ctx.font = "11px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("∅", chainStartX, y + slotH / 2);
    }
  }
}
