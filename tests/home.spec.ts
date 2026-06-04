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
      { text: "设计模式", href: "/patterns" },
      { text: "数据结构", href: "/structures" },
      { text: "算法", href: "/algorithms" },
      { text: "对比", href: "/compare" },
      { text: "参考", href: "/reference" },
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

    // "开始学习" CTA button
    const ctaButton = page.getByRole("link", { name: /开始学习/ });
    await expect(ctaButton).toBeVisible();

    // "浏览全部" secondary button
    const browseButton = page.getByRole("link", { name: /浏览全部/ });
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
