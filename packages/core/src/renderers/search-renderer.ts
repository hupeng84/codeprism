import type { SearchState } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

const ACCENT_COLORS = {
  mid: "#FFD93D",
  found: "#4ECDC4",
  notFound: "#FF6B6B",
};

/**
 * Render Binary Search state onto a Canvas element.
 */
export function renderSearchState(
  ctx: CanvasRenderingContext2D,
  state: SearchState,
  width: number,
  height: number,
  theme: Theme = "dark"
) {
  const c = getColors(theme);
  ctx.clearRect(0, 0, width, height);

  const { array, range, mid, found } = state;
  const [low, high] = range;

  // Bar dimensions
  const barGap = 6;
  const barWidth = Math.min(56, (width - 80 - barGap * (array.length - 1)) / array.length);
  const barMaxHeight = 220;
  const startX = (width - (array.length * (barWidth + barGap) - barGap)) / 2;
  const baseY = height - 100;

  // Find the maximum value for scaling
  const maxVal = array.length > 0 ? Math.max(...array) : 1;

  // Draw bars
  for (let i = 0; i < array.length; i++) {
    const x = startX + i * (barWidth + barGap);
    const barH = (array[i] / maxVal) * barMaxHeight;
    const y = baseY - barH;

    // Determine color
    let fillColor = c.defaultFill;
    let borderColor = c.defaultBorder;

    if (found !== -1 && i === found) {
      fillColor = ACCENT_COLORS.found;
      borderColor = "transparent";
    } else if (found === -1 && i === mid && low <= high) {
      fillColor = ACCENT_COLORS.notFound;
      borderColor = "transparent";
    } else if (i >= low && i <= high) {
      fillColor = "rgba(78,205,196,0.2)";
      borderColor = "rgba(78,205,196,0.6)";
    }

    if (i === mid && low <= high) {
      fillColor = ACCENT_COLORS.mid;
      borderColor = "transparent";
    }

    // Draw bar
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barH, 4);
    ctx.fillStyle = fillColor;
    ctx.fill();
    if (borderColor !== "transparent") {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Value label on top
    ctx.fillStyle = (i === mid || i === found) ? "white" : c.text;
    ctx.font = "bold 13px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(array[i]), x + barWidth / 2, y - 8);

    // Index label below
    ctx.fillStyle = c.textDim;
    ctx.font = "11px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(String(i), x + barWidth / 2, baseY + 20);
  }

  // ── Range annotation ──
  if (low <= high && low >= 0 && high < array.length) {
    const lowX = startX + low * (barWidth + barGap) + barWidth / 2;
    const highX = startX + high * (barWidth + barGap) + barWidth / 2;
    const bracketY = baseY + 45;

    ctx.strokeStyle = "rgba(78,205,196,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lowX, bracketY);
    ctx.lineTo(lowX, bracketY + 10);
    ctx.moveTo(lowX, bracketY + 6);
    ctx.lineTo(highX, bracketY + 6);
    ctx.moveTo(highX, bracketY);
    ctx.lineTo(highX, bracketY + 10);
    ctx.stroke();

    ctx.fillStyle = "rgba(78,205,196,0.6)";
    ctx.font = "11px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`[${low}, ${high}]`, (lowX + highX) / 2, bracketY + 34);
  }

  // ── Legend ──
  const legendY = height - 20;
  ctx.font = "11px DM Sans, sans-serif";
  ctx.textAlign = "left";

  const legendItems = [
    { color: "rgba(78,205,196,0.6)", label: "Search Range" },
    { color: ACCENT_COLORS.mid, label: "Mid" },
    { color: ACCENT_COLORS.found, label: "Found" },
    { color: ACCENT_COLORS.notFound, label: "No Match" },
  ];

  let lx = 20;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.fillRect(lx, legendY - 6, 8, 8);
    ctx.fillStyle = c.legendText;
    ctx.fillText(item.label, lx + 14, legendY + 2);
    lx += 70 + ctx.measureText(item.label).width;
  }
}
