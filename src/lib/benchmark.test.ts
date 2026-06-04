import { describe, it, expect, beforeEach } from "vitest";
import {
  measure,
  startMeasure,
  endMeasure,
  BenchmarkRecorder,
  getRecorder,
} from "./benchmark";

// ---------------------------------------------------------------------------
// measure()
// ---------------------------------------------------------------------------

describe("measure()", () => {
  it("calls the function and returns its value", () => {
    const result = measure("test-op", () => 42);
    expect(result).toBe(42);
  });

  it("passes through without error when performance is available", () => {
    const result = measure("noop", () => "hello");
    expect(result).toBe("hello");
  });

  it("propagates thrown errors", () => {
    expect(() => {
      measure("throwing", () => {
        throw new Error("boom");
      });
    }).toThrow("boom");
  });
});

// ---------------------------------------------------------------------------
// startMeasure / endMeasure
// ---------------------------------------------------------------------------

describe("startMeasure / endMeasure", () => {
  it("returns a non-negative duration", () => {
    startMeasure("manual-op");
    // Simulate some work
    for (let i = 0; i < 1000; i++) {
      Math.random();
    }
    const duration = endMeasure("manual-op");
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// BenchmarkRecorder
// ---------------------------------------------------------------------------

describe("BenchmarkRecorder", () => {
  let recorder: BenchmarkRecorder;

  beforeEach(() => {
    recorder = new BenchmarkRecorder();
  });

  it("records samples and computes correct stats", () => {
    // Record 10 samples with known durations
    for (let i = 1; i <= 10; i++) {
      recorder.record("my-op", i);
    }

    const stats = recorder.getStats("my-op");
    expect(stats).toBeDefined();
    expect(stats!.count).toBe(10);
    expect(stats!.min).toBe(1);
    expect(stats!.max).toBe(10);
    expect(stats!.avg).toBeCloseTo(5.5, 1);
    expect(stats!.p50).toBeGreaterThanOrEqual(4);
    expect(stats!.p95).toBeGreaterThanOrEqual(9);
  });

  it("getAllStats() returns all tracked names", () => {
    recorder.record("op-a", 1);
    recorder.record("op-a", 2);
    recorder.record("op-b", 10);

    const all = recorder.getAllStats();
    expect(Object.keys(all)).toContain("op-a");
    expect(Object.keys(all)).toContain("op-b");
    expect(all["op-a"].count).toBe(2);
    expect(all["op-b"].count).toBe(1);
  });

  it("clear() empties the buffer", () => {
    recorder.record("to-clear", 5);
    recorder.record("to-clear", 10);
    expect(recorder.getStats("to-clear")).toBeDefined();

    recorder.clear();
    expect(recorder.getStats("to-clear")).toBeUndefined();
    expect(Object.keys(recorder.getAllStats())).toHaveLength(0);
  });

  it("respects ring buffer limit of 200 samples", () => {
    for (let i = 0; i < 250; i++) {
      recorder.record("ring-test", i);
    }
    const stats = recorder.getStats("ring-test");
    expect(stats!.count).toBe(200);
    // Oldest samples (0-49) were dropped, so min should be 50
    expect(stats!.min).toBe(50);
    expect(stats!.max).toBe(249);
  });

  it("returns undefined for unknown benchmark name", () => {
    expect(recorder.getStats("nonexistent")).toBeUndefined();
  });

  it("subscribe receives notifications on record and clear", () => {
    const calls: Record<string, unknown>[] = [];
    const unsub = recorder.subscribe((stats) => calls.push(stats));

    recorder.record("sub-test", 1);
    recorder.record("sub-test", 2);

    expect(calls.length).toBe(2);

    recorder.clear();
    expect(calls.length).toBe(3);
    expect(Object.keys(calls[2])).toHaveLength(0);

    unsub();
  });
});

// ---------------------------------------------------------------------------
// getRecorder() singleton
// ---------------------------------------------------------------------------

describe("getRecorder()", () => {
  it("returns the same instance on repeated calls", () => {
    const a = getRecorder();
    const b = getRecorder();
    expect(a).toBe(b);
  });
});
