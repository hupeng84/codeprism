import { test, expect } from "@playwright/test";
import {
  waitForPageReady,
  clickPlayButton,
  getStepCount,
  waitForStepChange,
  clickStepForward,
} from "./utils";

test.describe("Visualizer Flow — Sorting Algorithm", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);
    // Wait for the playback controls to be visible (hydration complete)
    await page.waitForSelector("span.font-mono", { timeout: 15_000 });
  });

  test("loads bubble-sort page successfully", async ({ page }) => {
    // Breadcrumb should be present
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb).toBeVisible();

    // Algorithm title should be visible in the header
    const title = page.locator("span.text-sm.font-semibold").first();
    await expect(title).toBeVisible();
  });

  test("code editor or code panel is visible", async ({ page }) => {
    // The sidebar has a code tab — click it to show code
    const codeTab = page.getByRole("button", { name: "代码" });
    if (await codeTab.isVisible()) {
      await codeTab.click();
      // CodeEditor uses Monaco or a pre element — look for either
      const codeArea = page.locator(
        ".monaco-editor, pre, code, [class*='code']"
      );
      await expect(codeArea.first()).toBeVisible({ timeout: 10_000 });
    }
  });

  test("play button exists and is clickable", async ({ page }) => {
    const playBtn = page.locator(
      'button:has(svg path[d="M4 2.5v11l9-5.5-9-5.5z"])'
    );
    await expect(playBtn).toBeVisible();
    await expect(playBtn).toBeEnabled();
  });

  test("click play starts animation — step counter increases", async ({
    page,
  }) => {
    const initial = await getStepCount(page);

    await clickPlayButton(page);

    // Wait for step to change (animation running)
    const newStep = await waitForStepChange(page, initial.step, 5_000);
    expect(newStep).toBeGreaterThan(initial.step);
  });

  // Regression test for the rAF-loop-killed-on-pause bug:
  // `usePlaybackLoop` used to return `shouldStop: () => !playing`, which
  // cancelled the loop on the first frame when starting paused, and never
  // resumed on play. The fix moved pause handling into onTick.
  test("click play after a moment still advances — pause/resume loop stays alive", async ({
    page,
  }) => {
    const before = await getStepCount(page);

    // Don't click play for ~1s — gives the (formerly broken) rAF loop
    // time to die on its own if the bug regresses.
    await page.waitForTimeout(1_000);
    expect((await getStepCount(page)).step).toBe(before.step);

    await clickPlayButton(page);
    const newStep = await waitForStepChange(page, before.step, 5_000);
    expect(newStep).toBeGreaterThan(before.step);
  });

  test("pause stops the loop, resume continues from the same step", async ({
    page,
  }) => {
    await clickPlayButton(page);
    const duringPlay = await waitForStepChange(page, 0, 5_000);

    // Pause — step should freeze
    await page.locator(
      'button:has(svg rect[x="3"][y="2"]):has(svg rect[x="9.5"][y="2"])'
    ).click();
    await page.waitForTimeout(800);
    const afterPause = await getStepCount(page);
    expect(afterPause.step).toBe(duringPlay);

    // Resume — step should advance past the paused value
    await clickPlayButton(page);
    const afterResume = await waitForStepChange(page, afterPause.step, 5_000);
    expect(afterResume).toBeGreaterThan(afterPause.step);
  });

  test("sidebar shows algorithm info and metadata", async ({ page }) => {
    // Default tab is "信息" (Info)
    const descriptionHeading = page.getByText("描述", { exact: true });
    await expect(descriptionHeading.first()).toBeVisible();

    // Complexity info should be present
    const complexityHeading = page.getByText("复杂度", { exact: true });
    await expect(complexityHeading.first()).toBeVisible();
  });

  test("step indicator shows correct format", async ({ page }) => {
    const stepInfo = await getStepCount(page);
    expect(stepInfo.total).toBeGreaterThan(0);
    expect(stepInfo.step).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Visualizer Flow — Graph Algorithm", () => {
  test("loads dijkstra graph page without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/visualizer/graph/dijkstra");
    await waitForPageReady(page);

    // Wait for playback controls to appear
    await page.waitForSelector("span.font-mono", { timeout: 15_000 });

    // Page should have the breadcrumb
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(breadcrumb).toBeVisible();

    // Check for critical errors (exclude benign ones)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("Download the React DevTools") &&
        !e.includes("404")
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test("graph page has playback controls", async ({ page }) => {
    await page.goto("/visualizer/graph/dijkstra");
    await waitForPageReady(page);
    await page.waitForSelector("span.font-mono", { timeout: 15_000 });

    const playBtn = page.locator(
      'button:has(svg path[d="M4 2.5v11l9-5.5-9-5.5z"])'
    );
    await expect(playBtn).toBeVisible();
  });
});

test.describe("Visualizer Flow — Step Controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/visualizer/algorithm/bubble-sort");
    await waitForPageReady(page);
    await page.waitForSelector("span.font-mono", { timeout: 15_000 });
  });

  test("step forward advances one step", async ({ page }) => {
    const initial = await getStepCount(page);
    await clickStepForward(page);
    // Small delay for UI update
    await page.waitForTimeout(200);
    const after = await getStepCount(page);
    expect(after.step).toBe(initial.step + 1);
  });
});
