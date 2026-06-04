import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./utils";

test.describe("Navigation — Navbar Links", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await waitForPageReady(page);
  });

  const navRoutes = [
    { text: "设计模式", href: "/patterns" },
    { text: "数据结构", href: "/structures" },
    { text: "算法", href: "/algorithms" },
    { text: "对比", href: "/compare" },
    { text: "参考", href: "/reference" },
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
    await page.waitForURL("**/");
    expect(page.url()).toMatch(/localhost:3000\/$/);
  });
});

test.describe("Navigation — Breadcrumbs", () => {
  test("breadcrumbs are present on algorithm page", async ({ page }) => {
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);

    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb).toBeVisible();

    // Breadcrumb has a home link
    const homeLink = breadcrumb.getByRole("link", { name: "首页" });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute("href", "/");
  });

  test("breadcrumb home link navigates back to home", async ({ page }) => {
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);

    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    const homeLink = breadcrumb.getByRole("link", { name: "首页" });
    await homeLink.click();
    await page.waitForURL("**/");
    expect(page.url()).toMatch(/localhost:3000\/$/);
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

    // Toggle to light mode
    const toggleBtn = page.getByRole("button", {
      name: /Switch to (light|dark) mode/,
    });
    await toggleBtn.click();
    await page.waitForFunction(
      () =>
        document.documentElement.getAttribute("data-theme") !== "dark",
      undefined,
      { timeout: 3_000 }
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
    await page.waitForSelector("span.font-mono", { timeout: 15_000 });

    // The hamburger button should be visible on mobile
    const hamburger = page.getByRole("button", {
      name: "Toggle navigation menu",
    });
    await expect(hamburger).toBeVisible();

    // Click to open sidebar
    await hamburger.click();

    // Wait for the Sheet/dialog to open (it contains "导航" title)
    const sidebarTitle = page.getByText("导航", { exact: true });
    await expect(sidebarTitle).toBeVisible({ timeout: 5_000 });
  });
});
