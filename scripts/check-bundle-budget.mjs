#!/usr/bin/env node
/**
 * check-bundle-budget.mjs
 *
 * Static bundle-size budget check. Reads `.next/app-build-manifest.json` (and
 * the actual chunk file sizes on disk) and asserts that each critical route's
 * First Load JS is within the budget defined in `bundle-budgets.json`.
 *
 * Why static instead of runtime:
 *   - Runs in <1 s (no browser, no server)
 *   - Deterministic — no flakiness from network or browser cache
 *   - Catches regressions at PR time, not after deploy
 *
 * For runtime confirmation, see `tests/e2e/bundle-budget.spec.ts`.
 *
 * Usage:
 *   pnpm build && pnpm build:check
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, dirname, basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Allow the project root to be overridden for testing. In production,
// this is the parent of the `scripts/` dir.
const ROOT = process.env.BUNDLE_BUDGETS_ROOT
  ? resolve(process.env.BUNDLE_BUDGETS_ROOT)
  : resolve(__dirname, "..");

const MANIFEST = join(ROOT, ".next", "app-build-manifest.json");
const CHUNKS_DIR = join(ROOT, ".next", "static", "chunks");
const BUDGETS_FILE = join(ROOT, "bundle-budgets.json");

// ── 1. Sanity checks ─────────────────────────────────────────────────────

if (!existsSync(MANIFEST)) {
  console.error(
    "\x1b[31m✗ .next/app-build-manifest.json not found. Run `pnpm build` first.\x1b[0m",
  );
  process.exit(2);
}
if (!existsSync(BUDGETS_FILE)) {
  console.error(
    `\x1b[31m✗ Budgets file not found: ${BUDGETS_FILE}\x1b[0m`,
  );
  process.exit(2);
}

// ── 2. Read inputs ───────────────────────────────────────────────────────

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const budgetsDoc = JSON.parse(readFileSync(BUDGETS_FILE, "utf8"));
const budgets = budgetsDoc.firstLoadJs;

// Build a filename → *gzipped* byte size map. We measure gzipped (not raw
// file size) so the numbers match the `First Load JS` column from
// `next build`, the "Transferred" column in DevTools, and what users
// actually pay on the wire.
//
// Note: `pages[route]` in the manifest already includes the root main files
// (framework chunks), so we don't need a separate pass over rootMainFiles.
const chunkSize = new Map();
for (const file of readdirSync(CHUNKS_DIR)) {
  if (file.endsWith(".js") || file.endsWith(".css")) {
    const content = readFileSync(join(CHUNKS_DIR, file));
    const gzipped = gzipSync(content, { level: 6 }).length;
    chunkSize.set(file, gzipped);
  }
}

// ── 3. Compute per-route totals ──────────────────────────────────────────

const pages = manifest.pages ?? {};

/**
 * Map our budget keys (like "/visualizer/[category]/[slug]") to the manifest
 * page key (like "/[locale]/visualizer/[category]/[slug]/page"). The locale
 * segment is shared across all routes, so we prepend it.
 */
function manifestKeyFor(route) {
  return `/[locale]${route === "/" ? "" : route}/page`;
}

/** Sums the gzipped bytes of every chunk a route loads. */
function computeRouteBytes(manifestKey) {
  const chunks = pages[manifestKey] ?? [];
  let total = 0;
  for (const chunk of chunks) {
    const file = basename(chunk);
    total += chunkSize.get(file) ?? 0;
  }
  return total;
}

// ── 4. Compare against budgets and report ───────────────────────────────

const rows = [];
let allPassed = true;

for (const [route, budget] of Object.entries(budgets)) {
  const manifestKey = manifestKeyFor(route);
  if (!pages[manifestKey]) {
    rows.push({
      route,
      size: 0,
      budget,
      pct: 0,
      status: "missing",
      note: `manifest key not found: ${manifestKey}`,
    });
    allPassed = false;
    continue;
  }
  const size = computeRouteBytes(manifestKey);
  const pct = (size / budget) * 100;
  const passed = size <= budget;
  rows.push({ route, size, budget, pct, status: passed ? "ok" : "over" });
  if (!passed) allPassed = false;
}

const padRoute = (s) => s.padEnd(48);
const padNum = (s) => s.padStart(10);
const color = (code) => (process.stdout.isTTY ? `\x1b[${code}m` : "");
const reset = color(0);

console.log();
console.log(
  `${color("1;36")}📦 Bundle Budget Report${reset}`,
);
console.log("─".repeat(78));
console.log(
  padRoute("Route"),
  padNum("Size"),
  padNum("Budget"),
  padNum("Used"),
  "Status",
);
console.log("─".repeat(78));

for (const r of rows) {
  const sizeStr = formatBytes(r.size);
  const budgetStr = formatBytes(r.budget);
  const pctStr = `${r.pct.toFixed(0)}%`;
  let statusStr;
  if (r.status === "ok") {
    statusStr = `${color("32")}✓ ok${reset}`;
  } else if (r.status === "over") {
    statusStr = `${color("31")}✗ OVER${reset} (+${formatBytes(r.size - r.budget)})`;
  } else {
    statusStr = `${color("33")}⚠ missing${reset}`;
  }
  console.log(
    padRoute(r.route),
    padNum(sizeStr),
    padNum(budgetStr),
    padNum(pctStr),
    statusStr,
  );
  if (r.note) console.log(`  ${color("33")}${r.note}${reset}`);
}

console.log("─".repeat(78));
if (allPassed) {
  console.log(`${color("32")}✓ All bundle budgets passed.${reset}`);
  process.exit(0);
} else {
  console.log(
    `${color("31")}✗ One or more routes exceeded budget. Either trim deps or update bundle-budgets.json via PR.${reset}`,
  );
  process.exit(1);
}

function formatBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} kB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
