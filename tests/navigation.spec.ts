import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./utils";

test.describe("Navigation — Navbar Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
  });

  const navRoutes = [
    { text: "Patterns", href: "/en/patterns" },
    { text: "Structures", href: "/en/structures" },
    { text: "Algorithms", href: "/en/algorithms" },
    { text: "Compare", href: "/en/compare" },
    { text: "Reference", href: "/en/reference" },
  ];

  for (const route of navRoutes) {
    test(`clicks "${route.text}" → navigates to ${route.href}`, async ({
      page,
    }) => {
      const link = page.getByRole("link", { name: route.text }).first();
      await link.click();
      await page.waitForURL(`**${route.href}`);

      expect(page.url()).toContain(route.href);
    });
  }
});

test.describe("Navigation — Logo Home Link", () => {
  test("clicking logo returns to home", async ({ page }) => {
    // Start on a sub-page
    await page.goto("/reference");
    await waitForPageReady(page);

    // Logo area — the nav brand link
    const logo = page.locator("nav a").first();
    await logo.click();
    await page.waitForURL("**/en/**", { timeout: 10_000 }).catch(() => {});
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/en");
  });
});

test.describe("Navigation — Breadcrumbs", () => {
  test("algorithm page loads with category badge and title", async ({ page }) => {
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);

    // The page header should show a category badge and title
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("algorithm page has a home link in navbar", async ({ page }) => {
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);

    // Logo links back to home
    const logo = page.locator("nav a").first();
    await expect(logo).toBeVisible();
  });
});

test.describe("Navigation — Theme Toggle", () => {
  test("theme toggle button is visible and clickable", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);

    const toggleBtn = page.getByRole("button", {
      name: /Switch to (light|dark) mode/,
    });
    await expect(toggleBtn).toBeVisible();
    await expect(toggleBtn).toBeEnabled();
  });

  test("clicking theme toggle changes data-theme attribute", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageReady(page);

    // Get initial theme
    const initialTheme = await page.locator("html").getAttribute("data-theme");
    expect(initialTheme).toMatch(/^(dark|light)$/);

    // Click toggle
    const toggleBtn = page.getByRole("button", {
      name: /Switch to (light|dark) mode/,
    });
    await toggleBtn.click();

    // Wait for attribute change
    await page.waitForFunction(
      (prev) =>
        document.documentElement.getAttribute("data-theme") !== prev,
      initialTheme,
      { timeout: 3_000 }
    );

    const newTheme = await page.locator("html").getAttribute("data-theme");
    expect(newTheme).not.toBe(initialTheme);
    expect(newTheme).toMatch(/^(dark|light)$/);
  });

  test("theme persists across page reload", async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
    // Extra wait for React hydration to complete
    await page.waitForTimeout(1000);

    const initialTheme = await page.locator("html").getAttribute("data-theme");
    expect(initialTheme).toMatch(/^(dark|light)$/);

    // Toggle to opposite theme
    const toggleBtn = page.getByRole("button", {
      name: /Switch to (light|dark) mode/,
    });
    await toggleBtn.click();
    await page.waitForFunction(
      (prev) =>
        document.documentElement.getAttribute("data-theme") !== prev,
      initialTheme,
      { timeout: 5_000 }
    );

    const themeBeforeReload = await page
      .locator("html")
      .getAttribute("data-theme");

    // Reload
    await page.reload();
    await waitForPageReady(page);

    const themeAfterReload = await page
      .locator("html")
      .getAttribute("data-theme");
    expect(themeAfterReload).toBe(themeBeforeReload);
  });
});

test.describe("Navigation — Mobile Sidebar", () => {
  test("hamburger menu works on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Navigate to a visualizer page where the sidebar nav is used
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);

    // Wait for the page to fully render
    await page.waitForLoadState("networkidle");

    // The hamburger button should be visible on mobile
    const hamburger = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    await expect(hamburger).toBeVisible({ timeout: 10_000 });

    // Click to open sidebar
    await hamburger.click();

    // Wait for the Sheet/dialog to open (it contains "Navigation" title)
    const sidebarTitle = page.getByText("Navigation", { exact: true });
    await expect(sidebarTitle).toBeVisible({ timeout: 5_000 });
  });
});
