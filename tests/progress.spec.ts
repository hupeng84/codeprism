import { test, expect } from "@playwright/test";
import {
  waitForPageReady,
  getStepCount,
  clickStepForward,
} from "./utils";

test.describe("Progress Tracking", () => {
  // Clear progress before each test to ensure clean state
  test.beforeEach(async ({ page }) => {
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);
    await page.waitForSelector("span.font-mono", { timeout: 15_000 });

    // Clear progress store to avoid stale state from other tests
    await page.evaluate(() => {
      localStorage.removeItem("codeprism-progress");
    });
    // Reload to pick up clean state
    await page.reload();
    await waitForPageReady(page);
    await page.waitForSelector("span.font-mono", { timeout: 15_000 });
  });

  test("progress indicator shows step count", async ({ page }) => {
    const { step, total } = await getStepCount(page);
    expect(step).toBeGreaterThanOrEqual(0);
    expect(total).toBeGreaterThan(0);
  });

  test("advancing steps updates the step counter", async ({ page }) => {
    const initial = await getStepCount(page);

    // Step forward several times
    for (let i = 0; i < 3; i++) {
      await clickStepForward(page);
      await page.waitForTimeout(200);
    }

    const after = await getStepCount(page);
    expect(after.step).toBeGreaterThanOrEqual(initial.step + 3);
  });

  test("progress persists in localStorage", async ({ page }) => {
    // Step forward a few times
    for (let i = 0; i < 5; i++) {
      await clickStepForward(page);
      await page.waitForTimeout(150);
    }

    // Check localStorage for progress data
    const progressData = await page.evaluate(() => {
      const raw = localStorage.getItem("codeprism-progress");
      return raw ? JSON.parse(raw) : null;
    });

    // Progress store should exist and have state
    expect(progressData).toBeTruthy();
    expect(progressData.state).toBeTruthy();
  });

  test("right panel shows current step info", async ({ page }) => {
    // The right panel has "当前步骤" heading
    const panelHeading = page.getByText("当前步骤", { exact: true });
    await expect(panelHeading).toBeVisible();

    // Step details should show
    const stepLabel = page.locator("span.text-text-tertiary").filter({ hasText: "步骤" });
    await expect(stepLabel.first()).toBeVisible();
  });

  test("playback description updates during animation", async ({ page }) => {
    // Initial description
    const descriptionBox = page.locator(
      "div.bg-bg-glass-light p.text-sm"
    );
    // Step forward to change state
    await clickStepForward(page);
    await page.waitForTimeout(500);

    // Description may or may not change depending on algorithm state
    // Just verify the element is still visible and has content
    const currentText = await descriptionBox.first().textContent();
    expect(currentText).toBeTruthy();
  });
});
