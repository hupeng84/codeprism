/**
 * Example / Template Test File
 *
 * This file demonstrates Playwright test patterns used throughout the
 * CodePrism E2E test suite. Copy patterns from here into new tests.
 */
import { test, expect } from "@playwright/test";

// ── Basic Page Load ─────────────────────────────────────────────
test.describe("Example: Basic Page Load", () => {
  test("loads the home page successfully", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });
});

// ── test.describe Grouping ──────────────────────────────────────
test.describe("Example: Feature Group", () => {
  test.beforeEach(async ({ page }) => {
    // Runs before every test in this describe block
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("has a page title", async ({ page }) => {
    await expect(page).toHaveTitle(/CodePrism/);
  });

  test("has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    // Allow a moment for any async errors
    await page.waitForTimeout(1000);
    // Filter out known benign errors (e.g., favicon 404)
    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

// ── Screenshot on Failure ───────────────────────────────────────
test.describe("Example: Visual Verification", () => {
  test("captures screenshot on assertion failure", async ({ page }) => {
    await page.goto("/");
    // On failure, Playwright auto-saves a screenshot (configured in
    // playwright.config.ts with screenshot: 'only-on-failure')
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
  });
});

// ── Navigation with waitForURL ──────────────────────────────────
test.describe("Example: Navigation", () => {
  test("navigates to a sub-page via link", async ({ page }) => {
    await page.goto("/");

    // Click a nav link and wait for URL to change
    const refLink = page.getByRole("link", { name: "参考" });
    await refLink.click();
    await page.waitForURL("**/reference");

    // Verify we landed on the right page
    expect(page.url()).toContain("/reference");
  });
});
