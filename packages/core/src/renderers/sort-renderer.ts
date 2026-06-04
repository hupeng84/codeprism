import type { SortState } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

/** Color palette for array visualization */
const COLORS = {
  comparing: "#FFD93D",
  swapping: "#FF6B6B",
  sorted: "#4ECDC4",
};

/**
 * Render a SortState onto a Canvas element.
 */
export function renderSortState(
  ctx: CanvasRenderingContext2D,
  state: SortState,
  width: number,
  height: number,
  theme: Theme = "dark"
) {
  const c = getColors(theme);
  const { array, comparing, swapping, sorted } = state;
  const n = array.length;
  const maxVal = Math.max(...array, 1);
  const barWidth = (width - (n + 1) * 4) / n;
  const chartHeight = height - 40;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Draw bars
  for (let i = 0; i < n; i++) {
    const barHeight = (array[i] / maxVal) * chartHeight;
    const x = 4 + i * (barWidth + 4);
    const y = height - 20 - barHeight;

    // Determine color
    let color = c.default;
    if (sorted.includes(i)) {
      color = COLORS.sorted;
    }
    if (comparing.includes(i)) {
      color = COLORS.comparing;
    }
    if (swapping.includes(i)) {
      color = COLORS.swapping;
    }

    // Draw rounded bar
    const radius = Math.min(4, barWidth / 2);
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
    ctx.fillStyle = color;
    ctx.fill();

    // Value label
    ctx.fillStyle = c.text;
    ctx.font = "11px JetBrains Mono, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(array[i]), x + barWidth / 2, y - 6);

    // Index label
    ctx.fillStyle = c.textMuted;
    ctx.font = "10px JetBrains Mono, monospace";
    ctx.fillText(String(i), x + barWidth / 2, height - 4);
  }

  // Draw legend
  const legendY = 14;
  const legendItems = [
    { label: "Unsorted", color: c.default },
    { label: "Comparing", color: COLORS.comparing },
    { label: "Swapping", color: COLORS.swapping },
    { label: "Sorted", color: COLORS.sorted },
  ];

  let lx = width - 10;
  for (let i = legendItems.length - 1; i >= 0; i--) {
    const item = legendItems[i];
    const textWidth = ctx.measureText(item.label).width;
    const itemWidth = textWidth + 20;
    lx -= itemWidth;

    ctx.fillStyle = item.color;
    ctx.fillRect(lx, legendY - 6, 10, 10);
    ctx.fillStyle = c.legendText;
    ctx.font = "11px DM Sans, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.label, lx + 14, legendY + 4);
  }
}
