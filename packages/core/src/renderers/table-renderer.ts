import type { TableState } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

/** Accent colors for table visualization */
const ACCENT_COLORS = {
  currentBorder: "#FF6B6B",
  currentFill: "rgba(255,107,107,0.2)",
  comparingFill: "rgba(255,217,61,0.15)",
  sortedFill: "rgba(78,205,196,0.15)",
};

/** Minimum cell dimensions */
const MIN_CELL_W = 40;
const MIN_CELL_H = 30;

/**
 * Render a TableState (2D DP grid) onto a Canvas element.
 * Draws a table with row/column headers, numeric cell values, and color-coded highlights.
 */
export function renderTableState(
  ctx: CanvasRenderingContext2D,
  state: TableState,
  width: number,
  height: number,
  theme: Theme = "dark"
) {
  const c = getColors(theme);
  const { grid, rows, cols, currentCell, comparingCells, sortedCells, rowHeaders, colHeaders } = state;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // We need 1 extra column for row headers, 1 extra row for column headers
  const totalRows = rows + 1; // +1 for header row
  const totalCols = cols + 1; // +1 for header column

  // Calculate cell size to fit canvas
  const cellW = Math.max(MIN_CELL_W, Math.floor((width - 4) / totalCols));
  const cellH = Math.max(MIN_CELL_H, Math.floor((height - 4) / totalRows));

  // Calculate font size based on cell width
  const fontSize = cellW >= 50 ? 11 : cellW >= 40 ? 10 : 9;
  const headerFontSize = fontSize;

  // Center offset if table is smaller than canvas
  const tableW = totalCols * cellW;
  const tableH = totalRows * cellH;
  const offsetX = Math.max(0, (width - tableW) / 2);
  const offsetY = Math.max(0, (height - tableH) / 2);

  // Build lookup sets for fast checking
  const currentKey = currentCell ? `${currentCell[0]},${currentCell[1]}` : null;
  const comparingSet = new Set(comparingCells.map(([r, c]) => `${r},${c}`));
  const sortedSet = new Set(sortedCells.map(([r, c]) => `${r},${c}`));

  ctx.font = `${fontSize}px JetBrains Mono, monospace`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";

  // Draw column headers (top row)
  const headerRowY = offsetY;
  for (let col = 0; col < totalCols; col++) {
    const x = offsetX + col * cellW;

    // Header background
    ctx.fillStyle = c.headerBg;
    ctx.fillRect(x, headerRowY, cellW, cellH);

    // Header border
    ctx.strokeStyle = c.cellBorder;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(x, headerRowY, cellW, cellH);

    // Header text
    const headerText = col === 0 ? "" : (colHeaders[col - 1] ?? String(col - 1));
    ctx.fillStyle = c.headerText;
    ctx.font = `bold ${headerFontSize}px JetBrains Mono, monospace`;
    ctx.fillText(headerText, x + cellW / 2, headerRowY + cellH / 2);
  }

  // Draw row headers and grid cells
  for (let r = 0; r < rows; r++) {
    const y = offsetY + (r + 1) * cellH;

    // Row header (leftmost column)
    const headerX = offsetX;
    ctx.fillStyle = c.headerBg;
    ctx.fillRect(headerX, y, cellW, cellH);
    ctx.strokeStyle = c.cellBorder;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(headerX, y, cellW, cellH);

    const rowHeaderText = rowHeaders[r] ?? String(r);
    ctx.fillStyle = c.headerText;
    ctx.font = `bold ${headerFontSize}px JetBrains Mono, monospace`;
    ctx.fillText(rowHeaderText, headerX + cellW / 2, y + cellH / 2);

    // Data cells
    for (let col = 0; col < cols; col++) {
      const x = offsetX + (col + 1) * cellW;
      const cellKey = `${r},${col}`;
      const value = grid[r]?.[col] ?? 0;

      // Determine fill color
      let fillColor = c.defaultFill;
      if (sortedSet.has(cellKey)) {
        fillColor = ACCENT_COLORS.sortedFill;
      }
      if (comparingSet.has(cellKey)) {
        fillColor = ACCENT_COLORS.comparingFill;
      }

      // Fill
      ctx.fillStyle = fillColor;
      ctx.fillRect(x, y, cellW, cellH);

      // Border
      ctx.strokeStyle = c.cellBorder;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellW, cellH);

      // Current cell — red border highlight
      if (cellKey === currentKey) {
        ctx.strokeStyle = ACCENT_COLORS.currentBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, cellW - 2, cellH - 2);
        ctx.fillStyle = ACCENT_COLORS.currentFill;
        ctx.fillRect(x, y, cellW, cellH);
      }

      // Cell value text
      ctx.fillStyle = c.cellText;
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;
      ctx.fillText(String(value), x + cellW / 2, y + cellH / 2);
    }
  }

  // Draw legend at top-right
  const legendY = 8;
  const legendItems = [
    { label: "Current", color: ACCENT_COLORS.currentFill },
    { label: "Reading", color: ACCENT_COLORS.comparingFill },
    { label: "Done", color: ACCENT_COLORS.sortedFill },
  ];

  let lx = width - 8;
  for (let i = legendItems.length - 1; i >= 0; i--) {
    const item = legendItems[i];
    ctx.font = "10px DM Sans, sans-serif";
    const textWidth = ctx.measureText(item.label).width;
    const itemWidth = textWidth + 20;
    lx -= itemWidth;

    ctx.fillStyle = item.color;
    ctx.fillRect(lx, legendY, 10, 10);
    ctx.fillStyle = c.legendText;
    ctx.font = "10px DM Sans, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(item.label, lx + 14, legendY + 8);
    ctx.textAlign = "center";
  }

  // Draw arrows from comparing cells to current cell
  if (currentCell && comparingCells.length > 0) {
    const [cr, cc] = currentCell;
    const cx = offsetX + (cc + 1) * cellW + cellW / 2;
    const cy = offsetY + (cr + 1) * cellH + cellH / 2;

    ctx.strokeStyle = "rgba(255,217,61,0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);

    for (const [ar, ac] of comparingCells) {
      const ax = offsetX + (ac + 1) * cellW + cellW / 2;
      const ay = offsetY + (ar + 1) * cellH + cellH / 2;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(cx, cy);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  }
}
