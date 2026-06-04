import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { runRaftickLoop } from "./playback-loop";

// ---------------------------------------------------------------------------
// Fake requestAnimationFrame + performance.now — in Node there's no native
// rAF and performance.now() gives wall-clock time which clashes with our
// fake rAF timestamps.
// ---------------------------------------------------------------------------
let rafId = 0;
const rafCallbacks = new Map<number, FrameRequestCallback>();
let fakeNow = 0;

function fakeRaf(cb: FrameRequestCallback): number {
  rafCallbacks.set(++rafId, cb);
  return rafId;
}

function fakeCaf(id: number): void {
  rafCallbacks.delete(id);
}

/** Advance the fake rAF queue by calling all pending callbacks with `now`. */
function flushRaf(now: number): void {
  fakeNow = now;
  const cbs = [...rafCallbacks.values()];
  rafCallbacks.clear();
  for (const cb of cbs) cb(now);
}

beforeEach(() => {
  rafId = 0;
  rafCallbacks.clear();
  fakeNow = 0;
  vi.stubGlobal("requestAnimationFrame", fakeRaf);
  vi.stubGlobal("cancelAnimationFrame", fakeCaf);
  vi.stubGlobal("performance", { now: () => fakeNow });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runRaftickLoop", () => {
  it("calls onTick at the expected rate", () => {
    const onTick = vi.fn(() => true);
    const getStepInterval = () => 100;

    runRaftickLoop({
      getStepInterval,
      onTick,
      shouldStop: () => false,
    });

    // First frame — accumulated starts at 0, no tick yet
    flushRaf(0);

    // Advance by 100ms — should trigger one tick
    flushRaf(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    // Advance by another 200ms — should trigger two more ticks
    flushRaf(300);
    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it("stops the loop and calls onDone when onTick returns false", () => {
    let callCount = 0;
    const onTick = vi.fn(() => {
      callCount++;
      return callCount < 3; // stop after 2 ticks
    });
    const onDone = vi.fn();
    const getStepInterval = () => 50;

    runRaftickLoop({
      getStepInterval,
      onTick,
      shouldStop: () => false,
      onDone,
    });

    flushRaf(0);
    flushRaf(50);  // tick 1
    flushRaf(100); // tick 2
    flushRaf(150); // tick 3 would be called, but onTick returns false on 3rd call

    expect(onTick).toHaveBeenCalledTimes(3);
    expect(onDone).toHaveBeenCalledTimes(1);

    // After onDone, further frames should not call onTick
    const countBefore = onTick.mock.calls.length;
    flushRaf(200);
    expect(onTick).toHaveBeenCalledTimes(countBefore);
  });

  it("caps ticks per frame to MAX_TICKS_PER_FRAME (2)", () => {
    const onTick = vi.fn(() => true);
    const getStepInterval = () => 10; // 10ms per step

    runRaftickLoop({
      getStepInterval,
      onTick,
      shouldStop: () => false,
    });

    flushRaf(0);

    // Simulate a throttled tab: 500ms elapsed in one frame.
    // At 10ms per step, that's 50 steps. Should be capped at 2.
    flushRaf(500);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  it("re-reads getStepInterval each tick so mid-play speed changes take effect", () => {
    const intervals = [100, 100, 10]; // speed up after 2 ticks
    let callIdx = 0;
    const getStepInterval = () => intervals[Math.min(callIdx, intervals.length - 1)];
    const onTick = vi.fn(() => {
      callIdx++;
      return true;
    });

    runRaftickLoop({
      getStepInterval,
      onTick,
      shouldStop: () => false,
    });

    flushRaf(0);

    // Tick 1 at 100ms
    flushRaf(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    // Tick 2 at 200ms
    flushRaf(200);
    expect(onTick).toHaveBeenCalledTimes(2);

    // After tick 2, interval drops to 10ms. At 210ms, 10ms has accumulated.
    flushRaf(210);
    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it("the returned cancel function stops the loop", () => {
    const onTick = vi.fn(() => true);
    const onDone = vi.fn();
    const getStepInterval = () => 100;

    const cancel = runRaftickLoop({
      getStepInterval,
      onTick,
      shouldStop: () => false,
      onDone,
    });

    flushRaf(0);
    flushRaf(100); // tick 1
    expect(onTick).toHaveBeenCalledTimes(1);

    cancel();

    // onDone should be called by cancel
    expect(onDone).toHaveBeenCalledTimes(1);

    // Further frames should not trigger ticks
    const countBefore = onTick.mock.calls.length;
    flushRaf(200);
    expect(onTick).toHaveBeenCalledTimes(countBefore);
  });

  it("stops when shouldStop returns true", () => {
    let stopped = false;
    const onTick = vi.fn(() => true);
    const onDone = vi.fn();

    runRaftickLoop({
      getStepInterval: () => 100,
      onTick,
      shouldStop: () => stopped,
      onDone,
    });

    flushRaf(0);
    flushRaf(100); // tick 1
    expect(onTick).toHaveBeenCalledTimes(1);

    stopped = true;
    flushRaf(200); // shouldStop returns true → loop ends
    expect(onDone).toHaveBeenCalledTimes(1);

    // No more ticks after stop
    const countBefore = onTick.mock.calls.length;
    flushRaf(300);
    expect(onTick).toHaveBeenCalledTimes(countBefore);
  });

  it("drains excess accumulated time when tick cap is hit", () => {
    const onTick = vi.fn(() => true);
    const getStepInterval = () => 5; // 5ms per step

    runRaftickLoop({
      getStepInterval,
      onTick,
      shouldStop: () => false,
    });

    flushRaf(0);

    // 100ms elapsed = 20 steps, but capped at 2
    flushRaf(100);
    expect(onTick).toHaveBeenCalledTimes(2);

    // Next frame with only 3ms — should NOT tick (excess was drained)
    flushRaf(103);
    expect(onTick).toHaveBeenCalledTimes(2);
  });

  // Regression test: pause/resume must keep the rAF loop alive.
  //
  // The original `usePlaybackLoop` passed `shouldStop: () => !playing`,
  // which caused the loop to self-cancel on the very first frame when
  // starting in a paused state. The click handler then set `playing=true`
  // but the rAF was already dead, so playback never started.
  //
  // The fix moved pause handling into onTick: onTick returns `true` while
  // paused (no tick), and shouldStop stays `false`. The loop survives
  // pause/resume cycles.
  it("survives pause/resume when onTick returns true while not playing", () => {
    let playing = false;
    let playTicks = 0;
    const onTick = vi.fn(() => {
      if (playing) playTicks++;
      return true; // never stop the loop from onTick
    });
    const getStepInterval = () => 50;
    // Mirrors the fixed usePlaybackLoop: shouldStop is reserved for
    // external aborts, not for the normal paused state.
    const shouldStop = () => false;

    runRaftickLoop({ getStepInterval, onTick, shouldStop });

    // Paused for ~150ms — onTick is called but playTicks stays at 0
    flushRaf(0);
    flushRaf(50);
    flushRaf(100);
    expect(onTick).toHaveBeenCalledTimes(2);
    expect(playTicks).toBe(0);

    // Resume — onTick keeps firing and now playTicks advances
    playing = true;
    flushRaf(150);
    expect(onTick).toHaveBeenCalledTimes(3);
    expect(playTicks).toBe(1);
  });
});
