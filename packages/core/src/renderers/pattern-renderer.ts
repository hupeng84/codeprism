import type { InteractionState, PatternObject, PatternMessage } from "../types";
import type { Theme } from "./theme-colors";
import { getColors } from "./theme-colors";

const ACCENT_COLORS = {
  active: "#FF6B6B",
  highlighted: "#FFD93D",
  arrowActive: "#4ECDC4",
  dependency: "#8B5CF6",
  inheritance: "#F59E0B",
  composition: "#EF4444",
  aggregation: "#10B981",
  association: "#6B7280",
};

const ACCENT_COLORS_LIGHT = {
  active: "#ef4444",
  highlighted: "#f59e0b",
  arrowActive: "#22c55e",
  dependency: "#7c3aed",
  inheritance: "#d97706",
  composition: "#dc2626",
  aggregation: "#059669",
  association: "#4b5563",
};

/** Keywords that mark an object as the "primary" / central actor in a pattern. */
const PRIMARY_KEYWORDS = [
  "Subject", "Context", "Creator", "Singleton", "Mediator", "Facade",
  "Adapter", "Invoker", "Receiver", "Originator", "Caretaker", "Flyweight",
  "Proxy", "Decorator", "Component", "Composite", "Iterator", "Visitor",
  "Element", "Implementor", "Abstraction", "Prototype", "Builder",
];

function isPrimaryObject(obj: PatternObject): boolean {
  const t = obj.type;
  if (t === "Client" || t === "Product" || t === "ConcreteProduct") return false;
  if (t.startsWith("Concrete") && t !== "ConcreteSubject") return false;
  return PRIMARY_KEYWORDS.some((kw) => t.includes(kw));
}

function ensurePositions(
  objects: PatternObject[],
  width: number,
  height: number
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  const allHavePositions = objects.every(
    (o) => o.position && o.position.x > 0 && o.position.y > 0
  );

  if (allHavePositions && objects.length > 1) {
    for (const obj of objects) {
      positions.set(obj.id, { x: obj.position.x, y: obj.position.y });
    }
    return positions;
  }

  // Separate primary and non-primary objects
  const primary = objects.find(isPrimaryObject);
  const nonPrimary = primary ? objects.filter((o) => !isPrimaryObject(o)) : objects;

  // Box dimensions
  const boxH = 70;
  const padding = 40;

  if (primary) {
    // Place primary object at top center
    positions.set(primary.id, { x: width / 2, y: padding + boxH / 2 });
  }

  const count = nonPrimary.length;
  if (count === 0) return positions;

  // Calculate grid layout for non-primary objects below the primary
  const startY = primary ? padding + boxH + 80 : padding + boxH / 2;
  const availableHeight = height - startY - padding;
  const cols = Math.min(count, Math.ceil(Math.sqrt(count * (width / availableHeight))));
  const rows = Math.ceil(count / cols);
  const cellWidth = (width - padding * 2) / cols;
  const cellHeight = Math.min(availableHeight / rows, 120);

  nonPrimary.forEach((obj, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = padding + col * cellWidth + cellWidth / 2;
    const y = startY + row * cellHeight + cellHeight / 2;
    positions.set(obj.id, { x, y });
  });

  return positions;
}

export function renderInteractionState(
  ctx: CanvasRenderingContext2D,
  state: InteractionState,
  width: number,
  height: number,
  theme: Theme = "dark"
) {
  const c = getColors(theme);
  const accent = theme === "light" ? ACCENT_COLORS_LIGHT : ACCENT_COLORS;

  ctx.clearRect(0, 0, width, height);
  const { objects, messages } = state;
  if (objects.length === 0) return;

  const positions = ensurePositions(objects, width, height);
  const posMap = new Map<string, { x: number; y: number }>();
  for (const obj of objects) {
    posMap.set(obj.id, positions.get(obj.id) ?? obj.position);
  }

  // Connection lines with relationship labels
  const connectionPairs = new Map<string, string>();
  for (const msg of messages) {
    if (msg.from === msg.to) continue;
    const key = [msg.from, msg.to].sort().join("::");
    if (!connectionPairs.has(key)) {
      connectionPairs.set(key, msg.method);
    }
  }
  if (connectionPairs.size === 0 && objects.length > 1) {
    const primary = objects.find(isPrimaryObject) ?? objects[0];
    for (const obj of objects) {
      if (obj.id !== primary.id) {
        connectionPairs.set([primary.id, obj.id].sort().join("::"), "uses");
      }
    }
  }

  for (const [pairKey, methodLabel] of connectionPairs) {
    const [idA, idB] = pairKey.split("::");
    const posA = posMap.get(idA);
    const posB = posMap.get(idB);
    if (!posA || !posB) continue;

    const isActive = messages.some(
      (m) => (m.from === idA && m.to === idB) || (m.from === idB && m.to === idA)
    );

    // Determine relationship type based on method name
    let relType: keyof typeof accent = "association";
    const methodLower = methodLabel.toLowerCase();
    if (methodLower.includes("create") || methodLower.includes("new") || methodLower.includes("build")) {
      relType = "composition";
    } else if (methodLower.includes("extend") || methodLower.includes("inherit")) {
      relType = "inheritance";
    } else if (methodLower.includes("use") || methodLower.includes("call")) {
      relType = "dependency";
    } else if (methodLower.includes("add") || methodLower.includes("register")) {
      relType = "aggregation";
    }

    const lineColor = isActive ? accent[relType] : c.border;
    const lineWidth = isActive ? 2 : 1;

    // Draw connection line with curve - connect from bottom of source to top of target
    const startX = posA.x;
    const startY = posA.y + 35; // bottom of box
    const endX = posB.x;
    const endY = posB.y - 35; // top of box

    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Calculate control point for curve - offset perpendicular to avoid crossing
    const perpX = -dy / dist;
    const curveOffset = Math.min(Math.abs(dx) * 0.2, 40) * (dx > 0 ? 1 : -1);
    const cpx = midX + perpX * curveOffset;
    const cpy = midY;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpx, cpy, endX, endY);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(isActive ? [] : [4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw relationship label at midpoint of curve
    const labelX = cpx;
    const labelY = cpy - 10;

    // Background for label
    ctx.font = "9px DM Sans, sans-serif";
    const textWidth = ctx.measureText(methodLabel).width;
    ctx.fillStyle = isActive ? `${lineColor}20` : `${c.border}20`;
    ctx.beginPath();
    ctx.roundRect(labelX - textWidth / 2 - 4, labelY - 10, textWidth + 8, 16, 3);
    ctx.fill();

    // Label text
    ctx.fillStyle = isActive ? lineColor : c.textDim;
    ctx.textAlign = "center";
    ctx.fillText(methodLabel, labelX, labelY);

    // Arrow at the end - pointing down to target box
    const arrowAngle = Math.atan2(endY - cpy, endX - cpx);

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - 6 * Math.cos(arrowAngle - 0.5), endY - 6 * Math.sin(arrowAngle - 0.5));
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - 6 * Math.cos(arrowAngle + 0.5), endY - 6 * Math.sin(arrowAngle + 0.5));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  // Draw objects
  for (const obj of objects) {
    drawObjectBox(ctx, obj, posMap.get(obj.id) ?? obj.position, c, accent);
  }

  // Draw messages
  for (const msg of messages) {
    if (msg.status === "active" || msg.status === "complete") {
      drawMessageArrow(ctx, msg, objects, posMap, c, accent);
    }
  }

  // Role labels
  drawRoleLabels(ctx, objects, posMap, c);

  // Legend
  drawLegend(ctx, width, height, c, accent);
}

function drawRoleLabels(
  ctx: CanvasRenderingContext2D,
  objects: PatternObject[],
  posMap: Map<string, { x: number; y: number }>,
  c: ReturnType<typeof getColors>
) {
  ctx.font = "11px DM Sans, sans-serif";
  ctx.textAlign = "center";

  const primary = objects.find(isPrimaryObject);
  const others = objects.filter((o) => !isPrimaryObject(o));

  if (primary) {
    const pos = posMap.get(primary.id);
    if (pos) {
      ctx.fillStyle = c.textDim;
      ctx.fillText(`«${primary.type}»`, pos.x, pos.y - 50);
    }
  }

  const typeGroups = new Map<string, PatternObject[]>();
  for (const obj of others) {
    const existing = typeGroups.get(obj.type) ?? [];
    existing.push(obj);
    typeGroups.set(obj.type, existing);
  }

  for (const [type, group] of typeGroups) {
    const pos = posMap.get(group[0].id);
    if (pos) {
      ctx.fillStyle = c.textDim;
      ctx.fillText(group.length > 1 ? type : `«${type}»`, pos.x, pos.y - 50);
    }
  }
}

function drawLegend(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  c: ReturnType<typeof getColors>,
  accent: { active: string; highlighted: string; arrowActive: string; dependency: string; inheritance: string; composition: string; aggregation: string; association: string }
) {
  ctx.font = "10px DM Sans, sans-serif";
  ctx.textAlign = "left";

  // Row 1: Status indicators (compute spacing dynamically)
  const row1Y = height - 30;
  let lx = 20;

  const statusItems = [
    { color: accent.active, label: "Active" },
    { color: accent.highlighted, label: "Updated" },
  ];
  for (const item of statusItems) {
    ctx.fillStyle = item.color;
    ctx.fillRect(lx, row1Y - 6, 8, 8);
    ctx.fillStyle = c.textDim;
    ctx.fillText(item.label, lx + 12, row1Y + 2);
    lx += 16 + ctx.measureText(item.label).width + 20;
  }

  // Row 2: Relationship types (compute spacing dynamically)
  const row2Y = row1Y + 16;
  lx = 20;

  const relItems = [
    { color: accent.association, label: "Association", lineWidth: 1, dash: [] },
    { color: accent.dependency, label: "Dependency", lineWidth: 1, dash: [3, 3] },
    { color: accent.composition, label: "Composition", lineWidth: 2, dash: [] },
    { color: accent.inheritance, label: "Inheritance", lineWidth: 2, dash: [] },
  ];
  for (const item of relItems) {
    if (item.dash.length > 0) ctx.setLineDash(item.dash);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = item.lineWidth;
    ctx.beginPath();
    ctx.moveTo(lx, row2Y);
    ctx.lineTo(lx + 20, row2Y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = c.textDim;
    ctx.fillText(item.label, lx + 24, row2Y + 3);
    lx += 24 + ctx.measureText(item.label).width + 16;
  }
}

function drawObjectBox(
  ctx: CanvasRenderingContext2D,
  obj: PatternObject,
  pos: { x: number; y: number },
  c: ReturnType<typeof getColors>,
  accent: { active: string; highlighted: string; arrowActive: string }
) {
  const { x, y } = pos;
  const w = 120;
  const h = 70;

  ctx.save();
  ctx.shadowColor = obj.status === "active" ? "rgba(255,107,107,0.3)" : "rgba(0,0,0,0.3)";
  ctx.shadowBlur = obj.status === "active" ? 20 : 10;

  ctx.beginPath();
  ctx.roundRect(x - w / 2, y - h / 2, w, h, 8);
  ctx.fillStyle = obj.status === "highlighted" ? "rgba(255,217,61,0.08)" : c.bg;
  ctx.fill();

  ctx.strokeStyle = obj.status === "active" ? accent.active
    : obj.status === "highlighted" ? accent.highlighted : c.border;
  ctx.lineWidth = obj.status === "active" ? 2 : 1;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = c.textDim;
  ctx.font = "10px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`«${obj.type}»`, x, y - h / 2 + 14);

  ctx.fillStyle = obj.status === "active" ? accent.active : c.text;
  ctx.font = "bold 13px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(obj.name, x, y - h / 2 + 32);

  const stateStr = Object.entries(obj.state).map(([k, v]) => `${k}: ${v}`).join(", ");
  if (stateStr) {
    ctx.fillStyle = c.textDim;
    ctx.font = "10px DM Sans, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stateStr, x, y + h / 2 - 10);
  }

  if (obj.status === "active") {
    ctx.fillStyle = accent.active;
    ctx.beginPath();
    ctx.arc(x + w / 2 - 10, y - h / 2 + 10, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMessageArrow(
  ctx: CanvasRenderingContext2D,
  msg: PatternMessage,
  objects: PatternObject[],
  posMap: Map<string, { x: number; y: number }>,
  c: ReturnType<typeof getColors>,
  accent: { active: string; highlighted: string; arrowActive: string }
) {
  const from = objects.find((o) => o.id === msg.from);
  const to = objects.find((o) => o.id === msg.to);
  if (!from || !to) return;

  const fromPos = posMap.get(from.id) ?? from.position;
  const toPos = posMap.get(to.id) ?? to.position;
  const fromX = fromPos.x + 60;
  const fromY = fromPos.y;
  const toX = toPos.x - 60;
  const toY = toPos.y;

  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Calculate control point for curve
  const perpX = -dy / dist;
  const perpY = dx / dist;
  const curveOffset = Math.min(dist * 0.1, 20);
  const cpx = midX + perpX * curveOffset;
  const cpy = midY + perpY * curveOffset;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.quadraticCurveTo(cpx, cpy, toX, toY);
  ctx.strokeStyle = msg.status === "complete" ? "rgba(78,205,196,0.4)" : accent.arrowActive;
  ctx.lineWidth = msg.status === "complete" ? 1 : 2;
  ctx.setLineDash(msg.status === "complete" ? [3, 3] : []);
  ctx.stroke();
  ctx.setLineDash([]);

  const angle = Math.atan2(toY - cpy, toX - cpx);
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - 8 * Math.cos(angle - 0.4), toY - 8 * Math.sin(angle - 0.4));
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - 8 * Math.cos(angle + 0.4), toY - 8 * Math.sin(angle + 0.4));
  ctx.strokeStyle = msg.status === "complete" ? "rgba(78,205,196,0.4)" : accent.arrowActive;
  ctx.stroke();

  ctx.fillStyle = msg.status === "complete" ? c.textDim : accent.arrowActive;
  ctx.font = "11px JetBrains Mono, monospace";
  ctx.textAlign = "center";
  ctx.fillText(msg.method, cpx, cpy - 12);
}
