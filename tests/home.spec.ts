import { test, expect } from "@playwright/test";
import { waitForPageReady, expectNoConsoleErrors } from "./utils";

test.describe("Home Page", () => {
  test("loads successfully with 200 status and no console errors", async ({
    page,
  }) => {
    const errors = expectNoConsoleErrors(page);

    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await waitForPageReady(page);
    // Allow time for client-side hydration errors
    await page.waitForTimeout(500);

    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("404") &&
        !e.includes("Download the React DevTools")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("has correct page title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CodePrism/);
  });

  test("navbar links are present and point to correct routes", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageReady(page);

    const expectedLinks = [
      { text: "Patterns", href: "/en/patterns" },
      { text: "Structures", href: "/en/structures" },
      { text: "Algorithms", href: "/en/algorithms" },
      { text: "Compare", href: "/en/compare" },
      { text: "Reference", href: "/en/reference" },
    ];

    for (const link of expectedLinks) {
      const navLink = page.getByRole("link", { name: link.text }).first();
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveAttribute("href", link.href);
    }
  });

  test("hero section exists with title", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // The hero has a prominent h1 with the main headline
    const heroHeading = page.locator("h1").first();
    await expect(heroHeading).toBeVisible();

    // Hero contains key text
    const heroText = await heroHeading.textContent();
    expect(heroText).toBeTruthy();
  });

  test("hero has call-to-action buttons", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // "Start Learning" CTA button
    const ctaButton = page.getByRole("link", { name: /Start Learning/ });
    await expect(ctaButton).toBeVisible();

    // "Browse All" secondary button
    const browseButton = page.getByRole("link", { name: /Browse All/ });
    await expect(browseButton).toBeVisible();
  });

  test("categories section is visible", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // Categories section has an id="categories"
    const categoriesSection = page.locator("#categories");
    await expect(categoriesSection).toBeVisible();

    // Each category card should be present
    const cards = categoriesSection.locator("> div > div > div");
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
