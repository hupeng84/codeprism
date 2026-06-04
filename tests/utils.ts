import { type Page, expect } from "@playwright/test";

/**
 * Wait for Next.js hydration to complete.
 * Waits for the page to be fully interactive — the body has content and
 * no pending navigation indicators remain.
 */
export async function waitForPageReady(page: Page): Promise<void> {
  // Wait for the document to be in a complete state
  await page.waitForLoadState("domcontentloaded");
  // Give Next.js a moment to hydrate
  await page.waitForFunction(() => document.readyState === "complete", {
    timeout: 15_000,
  });
  // Additional wait for React hydration
  await page.waitForLoadState("networkidle");
}

/**
 * Wait for page to be ready with retry mechanism.
 * Useful for pages that may take longer to hydrate.
 */
export async function waitForPageReadyWithRetry(
  page: Page,
  maxRetries = 3,
  retryDelay = 2000
): Promise<void> {
  let lastError: Error | undefined;
  for (let i = 0; i < maxRetries; i++) {
    try {
      await waitForPageReady(page);
      return;
    } catch (e) {
      lastError = e as Error;
      if (i < maxRetries - 1) {
        await page.waitForTimeout(retryDelay);
      }
    }
  }
  throw lastError ?? new Error("Failed to wait for page ready");
}

/**
 * Find and click the play button in the playback controls.
 * The play button contains a triangle (▶) SVG path when paused.
 */
export async function clickPlayButton(page: Page): Promise<void> {
  const playBtn = page.locator(
    'button:has(svg path[d="M4 2.5v11l9-5.5-9-5.5z"])'
  );
  await expect(playBtn).toBeVisible({ timeout: 10_000 });
  await playBtn.click();
}

/**
 * Find and click the pause button in the playback controls.
 * The pause button contains two rectangle SVG paths when playing.
 */
export async function clickPauseButton(page: Page): Promise<void> {
  const pauseBtn = page.locator(
    'button:has(svg rect[x="3"][y="2"]):has(svg rect[x="9.5"][y="2"])'
  );
  await expect(pauseBtn).toBeVisible({ timeout: 10_000 });
  await pauseBtn.click();
}

/**
 * Extract the current step count from the step indicator.
 * The indicator shows "step / totalSteps" format in a mono font.
 */
export async function getStepCount(page: Page): Promise<{ step: number; total: number }> {
  // Two `span.font-mono` elements render the same `step / total` format
  // (playback-controls header + right-sidebar stats footer). Use `.first()`
  // to avoid strict-mode violations — either would read the same store value.
  const stepText = page
    .locator("span.font-mono")
    .filter({ hasText: /\d+\s*\/\s*\d+/ })
    .first();
  await expect(stepText).toBeVisible({ timeout: 10_000 });
  const text = await stepText.textContent();
  const match = text?.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    throw new Error(`Could not parse step text: "${text}"`);
  }
  return { step: parseInt(match[1], 10), total: parseInt(match[2], 10) };
}

/**
 * Wait for the step count to change from its current value.
 */
export async function waitForStepChange(
  page: Page,
  currentStep: number,
  timeout = 10_000
): Promise<number> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const { step } = await getStepCount(page);
    if (step !== currentStep) return step;
    await page.waitForTimeout(100);
  }
  throw new Error(`Step did not change from ${currentStep} within ${timeout}ms`);
}

/**
 * Click the step-forward button.
 */
export async function clickStepForward(page: Page): Promise<void> {
  const fwdBtn = page.locator(
    'button:has(svg path[d="M6 3l5 5-5 5"])'
  );
  await expect(fwdBtn).toBeVisible({ timeout: 10_000 });
  await fwdBtn.click();
}

/**
 * Click the step-back button.
 */
export async function clickStepBack(page: Page): Promise<void> {
  const backBtn = page.locator(
    'button:has(svg path[d="M10 3L5 8l5 5"])'
  );
  await expect(backBtn).toBeVisible({ timeout: 10_000 });
  await backBtn.click();
}

/**
 * Click the reset button.
 */
export async function clickReset(page: Page): Promise<void> {
  const resetBtn = page.locator(
    'button:has(svg path[d="M2 8a6 6 0 0 1 10.47-4M14 8a6 6 0 0 1-10.47 4"])'
  );
  await expect(resetBtn).toBeVisible({ timeout: 10_000 });
  await resetBtn.click();
}

/**
 * Assert no console errors occurred during page load.
 * Must be called BEFORE navigating to the page.
 */
export function expectNoConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  return errors;
}
