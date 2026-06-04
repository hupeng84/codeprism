/**
 * Passive performance benchmarking infrastructure for CodePrism.
 *
 * Provides `measure()`, `startMeasure/endMeasure`, and a `BenchmarkRecorder`
 * ring-buffer that computes aggregate statistics per named operation.
 *
 * This module has NO side-effects on render. It wraps the Web `performance`
 * API and degrades gracefully on SSR or environments without it.
 */

// ---------------------------------------------------------------------------
// Global flag so consumers can detect whether benchmarking is active.
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    __CODEPRISM_BENCH__?: boolean;
  }
}

if (typeof window !== "undefined") {
  window.__CODEPRISM_BENCH__ = true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const hasPerformance = typeof performance !== "undefined";

/**
 * Wraps a synchronous function call with `performance.mark` / `performance.measure`.
 * Returns the function's return value. Cleans up marks after measuring.
 */
export function measure<T>(name: string, fn: () => T): T {
  if (!hasPerformance) return fn();

  const startMark = `${name}:start`;
  const endMark = `${name}:end`;

  try {
    performance.mark(startMark);
    const result = fn();
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
    return result;
  } finally {
    try {
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Start a named measurement. Pair with `endMeasure` for non-function scopes.
 */
export function startMeasure(name: string): void {
  if (!hasPerformance) return;
  performance.mark(`${name}:start`);
}

/**
 * End a named measurement started with `startMeasure`. Returns the duration in ms.
 *
 * Defensive: if the start mark doesn't exist (e.g. because React 18
 * StrictMode double-invoked the effect and the second invocation's
 * `endMeasure` already cleaned up the shared mark, or because the effect
 * was torn down before `await` resolved), the call is a no-op rather
 * than throwing a `PerformanceMark` SyntaxError. The previous behaviour
 * crashed the entire Mermaid render on the second invocation in dev.
 */
export function endMeasure(name: string): number {
  if (!hasPerformance) return 0;

  const startMark = `${name}:start`;
  const endMark = `${name}:end`;

  // Bail if there's no live start mark (already ended, or never started).
  // `getEntriesByName` returns the *currently registered* marks; we want
  // to skip work if the start mark isn't there, not just silently ignore.
  let startEntries: PerformanceEntry[] = [];
  try {
    startEntries = performance.getEntriesByName(startMark, "mark");
  } catch {
    return 0;
  }
  if (startEntries.length === 0) return 0;

  try {
    performance.mark(endMark);
    performance.measure(name, startMark, endMark);
  } finally {
    try {
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    } catch {
      // Ignore cleanup errors
    }
  }

  // Read the measured duration from the last entry
  const entries = performance.getEntriesByName(name, "measure");
  if (entries.length === 0) return 0;
  const last = entries[entries.length - 1];
  // Clean up the measure entry so it doesn't accumulate
  performance.clearMeasures(name);
  return last.duration;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BenchmarkSample {
  name: string;
  durationMs: number;
  timestamp: number;
}

export interface BenchmarkStats {
  count: number;
  avg: number;
  p50: number;
  p95: number;
  max: number;
  min: number;
}

// ---------------------------------------------------------------------------
// BenchmarkRecorder
// ---------------------------------------------------------------------------

const MAX_SAMPLES_PER_NAME = 200;

export type BenchmarkSubscriber = (stats: Record<string, BenchmarkStats>) => void;

/**
 * Ring-buffer recorder for benchmark samples. Stores up to 200 samples per
 * named operation and computes aggregate statistics on demand.
 */
export class BenchmarkRecorder {
  private buffers = new Map<string, BenchmarkSample[]>();
  private subscribers: Set<BenchmarkSubscriber> = new Set();

  /** Record a sample for a named operation. */
  record(name: string, durationMs: number): void {
    const sample: BenchmarkSample = {
      name,
      durationMs,
      timestamp: typeof performance !== "undefined" ? performance.now() : Date.now(),
    };

    let buffer = this.buffers.get(name);
    if (!buffer) {
      buffer = [];
      this.buffers.set(name, buffer);
    }

    buffer.push(sample);

    // Ring buffer: drop oldest when full
    if (buffer.length > MAX_SAMPLES_PER_NAME) {
      buffer.shift();
    }

    this.notify();
  }

  /** Get stats for a single named benchmark. */
  getStats(name: string): BenchmarkStats | undefined {
    const buffer = this.buffers.get(name);
    if (!buffer || buffer.length === 0) return undefined;

    const durations = buffer.map((s) => s.durationMs).sort((a, b) => a - b);
    const count = durations.length;
    const sum = durations.reduce((acc, d) => acc + d, 0);

    return {
      count,
      avg: sum / count,
      p50: percentile(durations, 0.5),
      p95: percentile(durations, 0.95),
      max: durations[count - 1],
      min: durations[0],
    };
  }

  /** Get stats for all tracked benchmarks. */
  getAllStats(): Record<string, BenchmarkStats> {
    const result: Record<string, BenchmarkStats> = {};
    for (const name of this.buffers.keys()) {
      const stats = this.getStats(name);
      if (stats) result[name] = stats;
    }
    return result;
  }

  /** Subscribe to stat changes. Returns unsubscribe function. */
  subscribe(cb: BenchmarkSubscriber): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  /** Clear all recorded samples and notify subscribers. */
  clear(): void {
    this.buffers.clear();
    this.notify();
  }

  private notify(): void {
    if (this.subscribers.size === 0) return;
    const stats = this.getAllStats();
    for (const cb of this.subscribers) {
      cb(stats);
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let recorderInstance: BenchmarkRecorder | null = null;

/** Get the module-level `BenchmarkRecorder` singleton. */
export function getRecorder(): BenchmarkRecorder {
  if (!recorderInstance) {
    recorderInstance = new BenchmarkRecorder();
  }
  return recorderInstance;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, idx)];
}
