/* @vitest-environment node */
import { describe, it, expect } from "vitest";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir as osTmpdir } from "node:os";
import { gzipSync } from "node:zlib";

/**
 * Tests for `scripts/check-bundle-budget.mjs`.
 *
 * Strategy: build a fake `.next/` directory in a temp location, run the
 * script, and verify exit code + combined output. The script measures
 * gzipped chunk sizes (matches what `next build` reports and what users
 * actually pay), so we write content of a specific *gzip* size into fake
 * chunks.
 */

function gzipSize(content: Buffer | string): number {
  return gzipSync(content, { level: 6 }).length;
}

interface FakeNextOpts {
  /** Chunk sizes (in raw bytes — the script will gz them). */
  sizes: Record<string, number>;
  /** Optional manifest pages override. Defaults to the standard two routes. */
  pages?: Record<string, string[]>;
}

function makeFakeNext(opts: FakeNextOpts): string {
  const { sizes, pages } = opts;
  const root = mkdtempSync(join(osTmpdir(), "bundle-check-"));
  const chunksDir = join(root, ".next", "static", "chunks");
  mkdirSync(chunksDir, { recursive: true });

  for (const [name, rawSize] of Object.entries(sizes)) {
    writeFileSync(join(chunksDir, name), "a".repeat(rawSize));
  }

  const defaultPages = {
    "/[locale]/page": ["static/chunks/webpack.js", "static/chunks/home.js"],
    "/[locale]/visualizer/[category]/[slug]/page": [
      "static/chunks/webpack.js",
      "static/chunks/visualizer.js",
    ],
  };
  const manifest = {
    rootMainFiles: ["static/chunks/webpack.js"],
    pages: pages ?? defaultPages,
  };
  writeFileSync(
    join(root, ".next", "app-build-manifest.json"),
    JSON.stringify(manifest),
  );

  return root;
}

function writeBudgets(root: string, content: object): void {
  writeFileSync(join(root, "bundle-budgets.json"), JSON.stringify(content));
}

const SCRIPT = new URL("../scripts/check-bundle-budget.mjs", import.meta.url)
  .pathname.replace(/^\/([A-Za-z]:)/, "$1");

interface RunResult {
  code: number;
  stdout: string;
  stderr: string;
  combined: string;
}

function run(cwd: string): RunResult {
  const result = spawnSync("node", [SCRIPT], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, BUNDLE_BUDGETS_ROOT: cwd },
  });
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  return {
    code: result.status ?? 0,
    stdout,
    stderr,
    combined: stdout + stderr,
  };
}

describe("check-bundle-budget.mjs", () => {
  it("exits 0 when all routes are within budget", () => {
    const root = makeFakeNext({ sizes: { "webpack.js": 50_000, "home.js": 50_000 } });
    writeBudgets(root, { firstLoadJs: { "/": 200_000 } });

    const { code, stdout } = run(root);
    expect(code).toBe(0);
    expect(stdout).toContain("Bundle Budget Report");
    expect(stdout).toContain("ok");
  });

  it("exits 1 when a route exceeds its budget", () => {
    const root = makeFakeNext({
      sizes: { "webpack.js": 10_000, "home.js": 50_000 },
    });
    writeBudgets(root, { firstLoadJs: { "/": 100 } });

    const { code, combined } = run(root);
    expect(code).toBe(1);
    expect(combined).toContain("OVER");
    expect(combined).toContain("exceeded budget");
  });

  it("exits 2 with a helpful message when manifest is missing (no prior build)", () => {
    const root = mkdtempSync(join(osTmpdir(), "no-build-"));
    writeBudgets(root, { firstLoadJs: { "/": 200_000 } });

    const { code, stderr } = run(root);
    expect(code).toBe(2);
    expect(stderr).toContain("not found");
    expect(stderr).toContain("pnpm build");
  });

  it("includes the manifest key when a budgeted route is missing from the build", () => {
    // Manifest has only the home page — visualizer route is missing.
    const root = makeFakeNext({
      sizes: { "webpack.js": 1000 },
      pages: { "/[locale]/page": ["static/chunks/webpack.js"] },
    });
    writeBudgets(root, {
      firstLoadJs: { "/visualizer/[category]/[slug]": 999 },
    });

    const { code, stdout } = run(root);
    expect(code).toBe(1);
    expect(stdout).toContain("missing");
    expect(stdout).toContain("/[locale]/visualizer/[category]/[slug]/page");
  });

  it("reports size in human-readable units (kB / MB)", () => {
    const root = makeFakeNext({ sizes: { "webpack.js": 5_000, "home.js": 5_000 } });
    writeBudgets(root, { firstLoadJs: { "/": 100_000 } });

    const { stdout } = run(root);
    expect(stdout).toMatch(/\d+(\.\d+)?\s*kB/);
  });

  it("measures gzip-compressed bytes (not raw file size)", () => {
    // 2000 bytes of "a" per chunk compresses to ~30 bytes gzipped.
    // Budget of 200 should pass (gzipped ~60 bytes total) but would fail
    // if we measured raw (4000 bytes total).
    const root = makeFakeNext({
      sizes: { "webpack.js": 2_000, "home.js": 2_000 },
    });
    writeBudgets(root, { firstLoadJs: { "/": 200 } });

    const { code, stdout } = run(root);
    // Sanity: gzipped is much smaller than raw.
    expect(gzipSize(Buffer.from("a".repeat(2000)))).toBeLessThan(50);

    expect(code).toBe(0);
    expect(stdout).toContain("ok");
  });
});
