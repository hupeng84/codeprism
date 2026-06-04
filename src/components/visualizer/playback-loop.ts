/**
 * Shared requestAnimationFrame playback loop used by both the main visualizer
 * (usePlaybackStore) and the compare-panel hook (usePanelPlayback).
 *
 * Pure utility — no React, no zustand.
 */

/** Maximum number of ticks dispatched per RAF frame to avoid burst renders
 *  after tab throttling / backgrounding. */
const MAX_TICKS_PER_FRAME = 2;

export interface RaftickLoopOpts {
  /** Returns the current ms-per-step interval (re-read every tick so mid-play
   *  speed changes take effect immediately). */
  getStepInterval: () => number;
  /** Called when it is time to advance one step. Return `true` to continue,
   *  `false` to stop the loop (e.g. playback finished). */
  onTick: () => boolean;
  /** Called at the top of each frame to check whether the loop should stop
   *  (e.g. `playing` flipped to false). */
  shouldStop: () => boolean;
  /** Optional callback invoked once after the loop ends (whether naturally or
   *  via cancel). */
  onDone?: () => void;
}

/**
 * Start a rAF-based playback loop.
 *
 * Returns a **cancel** function that stops the loop and fires `onDone`.
 */
export function runRaftickLoop(opts: RaftickLoopOpts): () => void {
  const { getStepInterval, onTick, shouldStop, onDone } = opts;

  let rafId: number | null = null;
  let last = performance.now();
  let accumulated = 0;
  let cancelled = false;
  let doneFired = false;

  function fireDone(): void {
    if (!doneFired) {
      doneFired = true;
      onDone?.();
    }
  }

  function loop(now: number): void {
    if (cancelled || shouldStop()) {
      stop();
      return;
    }

    accumulated += now - last;
    last = now;

    const stepInterval = getStepInterval();

    // Cap ticks per frame to prevent burst renders after throttling.
    let ticksThisFrame = 0;
    while (accumulated >= stepInterval && ticksThisFrame < MAX_TICKS_PER_FRAME) {
      accumulated -= stepInterval;
      ticksThisFrame++;

      if (!onTick()) {
        stop();
        return;
      }
    }

    // If we still have excess accumulated time but hit the cap, drain it so we
    // don't carry stale time into the next frame (prevents a "catch-up storm"
    // once the tab becomes visible again).
    if (ticksThisFrame >= MAX_TICKS_PER_FRAME) {
      accumulated = 0;
    }

    rafId = requestAnimationFrame(loop);
  }

  function stop(): void {
    cancelled = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    fireDone();
  }

  rafId = requestAnimationFrame(loop);

  return stop;
}
