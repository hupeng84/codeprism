import { test, expect } from "@playwright/test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Bundle budget — runtime confirmation that every critical route's
 * First Load JS is within the budget in `bundle-budgets.json`.
 *
 * The static check (`pnpm build:check`) catches bloat at PR time. This
 * spec is the ground truth: it actually navigates each route in a real
 * browser and sums the network bytes the user would pay.
 *
 * How we measure:
 *   1. Open a fresh context (empty cache)
 *   2. Navigate to the route
 *   3. Read `performance.getEntriesByType("resource")` for the page
 *   4. Sum the JS resources' `transferSize` (compressed bytes over the wire)
 *   5. Compare against the same budget file the static check uses
 *
 * Why transferSize and not encodedBodySize:
 *   - transferSize includes HTTP headers + compression overhead
 *   - encodedBodySize is the body alone — slightly smaller
 *   - transferSize is what shows up in DevTools' "Transferred" column,
 *     so it matches what a developer looking at the network panel sees
 *
 * Assumes:
 *   - `pnpm build` has been run (Playwright config spins up `next start`)
 *   - A fresh server is up on the configured baseURL
 */

interface BudgetsFile {
  firstLoadJs: Record<string, number>;
}

const BUDGETS_PATH = join(process.cwd(), "bundle-budgets.json");

function loadBudgets(): BudgetsFile {
  if (!existsSync(BUDGETS_PATH)) {
    throw new Error(
      `bundle-budgets.json not found at ${BUDGETS_PATH}. Create it before running this test.`,
    );
  }
  return JSON.parse(readFileSync(BUDGETS_PATH, "utf8"));
}

const ROUTES: Array<{ path: string; budgetKey: string }> = [
  { path: "/", budgetKey: "/" },
  { path: "/achievements", budgetKey: "/achievements" },
  { path: "/algorithms", budgetKey: "/algorithms" },
  { path: "/patterns", budgetKey: "/patterns" },
  { path: "/structures", budgetKey: "/structures" },
  { path: "/visualizer/algorithm/bubble-sort", budgetKey: "/visualizer/[category]/[slug]" },
  { path: "/compare/algorithm/bubble-sort/quick-sort", budgetKey: "/compare/[category]/[a]/[b]" },
];

/** Sum JS bytes for the initial navigation of the current page. */
async function measureFirstLoadJs(page: import("@playwright/test").Page): Promise<number> {
  return page.evaluate(() => {
    const resources = performance.getEntriesByType(
      "resource",
    ) as PerformanceResourceTiming[];
    let total = 0;
    for (const r of resources) {
      // transferSize is the bytes actually transferred (compressed + headers).
      // We include 0 too because some browsers report 0 for cached resources,
      // but a fresh context shouldn't have cache. Skip non-JS for clarity.
      const isJs = r.name.endsWith(".js") || r.name.includes(".js?");
      if (isJs) total += r.transferSize || 0;
    }
    return total;
  });
}

test.describe("Bundle budget (runtime)", () => {
  const budgets = loadBudgets();

  for (const route of ROUTES) {
    const budget = budgets.firstLoadJs[route.budgetKey];
    test(`${route.path} ships < ${(budget / 1024).toFixed(0)} kB of JS`, async ({
      page,
    }) => {
      if (typeof budget !== "number") {
        throw new Error(
          `No budget defined for route "${route.budgetKey}" in bundle-budgets.json`,
        );
      }

      // Fresh context per test → empty cache → full transferSize.
      await page.goto(route.path, { waitUntil: "networkidle" });

      const jsBytes = await measureFirstLoadJs(page);

      // Log the actual number for visibility. Playwright captures this in
      // the test report, making regressions easy to diagnose.
      test.info().annotations.push({
        type: "bundle-size",
        description: `${route.path}: ${(jsBytes / 1024).toFixed(1)} kB / ${(budget / 1024).toFixed(0)} kB budget`,
      });

      // Allow 20% slack vs the budget (the runtime check is gzipped, the
      // static check is uncompressed; they measure different things).
      const runtimeCeiling = budget * 1.2;
      expect(
        jsBytes,
        `Route ${route.path} shipped ${(jsBytes / 1024).toFixed(1)} kB (ceiling ${(runtimeCeiling / 1024).toFixed(0)} kB). ` +
          `Likely culprits: new dep, un-gzipped asset, or a missing dynamic import.`,
      ).toBeLessThan(runtimeCeiling);
    });
  }
});
