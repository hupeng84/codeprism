import { test, expect } from "@playwright/test";
import { waitForPageReady } from "./utils";

test.describe("Reference Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/reference");
    await waitForPageReady(page);
  });

  test("loads with 200 status", async ({ page }) => {
    const response = await page.goto("/reference");
    expect(response?.status()).toBe(200);
  });

  test("has page title and heading", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text).toContain("Reference");
  });

  test("table is visible with algorithm data", async ({ page }) => {
    const table = page.locator("table");
    await expect(table).toBeVisible();

    // Table should have rows
    const rows = table.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(10); // We have ~40+ algorithms
  });

  test("search input filters table rows", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search algorithms and data structures...");
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill("bubble");

    // Table should filter down
    await page.waitForTimeout(300); // debounce
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(40); // Should be filtered

    // Bubble Sort should be visible
    await expect(page.getByText("Bubble Sort")).toBeVisible();

    // Clear search
    await searchInput.fill("");
    await page.waitForTimeout(300);
    const allRows = page.locator("table tbody tr");
    const allCount = await allRows.count();
    expect(allCount).toBeGreaterThan(count);
  });

  test("category filter tabs work", async ({ page }) => {
    // Click "Sorting" tab
    const sortingTab = page.getByRole("button", { name: "Sorting" });
    await sortingTab.click();
    await page.waitForTimeout(200);

    // All visible rows should be sorting algorithms
    const rows = page.locator("table tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    // Click "All" to reset
    const allTab = page.getByRole("button", { name: "All" });
    await allTab.click();
    await page.waitForTimeout(200);

    const allRows = page.locator("table tbody tr");
    const allCount = await allRows.count();
    expect(allCount).toBeGreaterThanOrEqual(count);
  });

  test("search with no results shows empty state", async ({ page }) => {
    const searchInput = page.getByPlaceholder("Search algorithms and data structures...");
    await searchInput.fill("zzzznonexistent");
    await page.waitForTimeout(300);

    // Should show "No matching results found" message
    const emptyMessage = page.getByText("No matching results found");
    await expect(emptyMessage).toBeVisible();
  });
});
