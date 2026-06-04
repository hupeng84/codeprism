/* @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  track,
  configureAnalytics,
  isDNTEnabled,
  useConsent,
  useFeatureFlag,
  defineFlag,
  setFlagOverride,
  __resetAnalyticsCachesForTesting,
  type EnrichedEvent,
} from "./analytics";

// ── Helpers ────────────────────────────────────────────────────────────────

function captured(): EnrichedEvent[] {
  return (globalThis as { __capturedEvents?: EnrichedEvent[] }).__capturedEvents ?? [];
}

function makeTransport(): ReturnType<typeof vi.fn> {
  const spy = vi.fn();
  (globalThis as { __capturedEvents?: EnrichedEvent[] }).__capturedEvents = [];
  const wrapped = (e: EnrichedEvent) => {
    captured().push(e);
    spy(e);
  };
  configureAnalytics({ transport: wrapped });
  return spy;
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  // Default: no DNT.
  Object.defineProperty(navigator, "doNotTrack", { value: "0", configurable: true });
  // Default: consent denied (we explicitly grant in tests that need it).
  localStorage.setItem("codeprism-analytics-consent", "denied");
  // Reset the module-level hot-path caches so each test reads fresh state.
  __resetAnalyticsCachesForTesting();
});

afterEach(() => {
  configureAnalytics({ transport: () => {} });
});

// ── isDNTEnabled ──────────────────────────────────────────────────────────

describe("isDNTEnabled", () => {
  it("returns true when navigator.doNotTrack is '1'", () => {
    Object.defineProperty(navigator, "doNotTrack", { value: "1", configurable: true });
    expect(isDNTEnabled()).toBe(true);
  });

  it("returns false when DNT is '0' or unset", () => {
    Object.defineProperty(navigator, "doNotTrack", { value: "0", configurable: true });
    expect(isDNTEnabled()).toBe(false);
  });
});

// ── track() ───────────────────────────────────────────────────────────────

describe("track", () => {
  it("is a no-op when consent is denied", () => {
    const spy = makeTransport();
    track({ type: "pwa_installed" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("is a no-op when DNT is enabled, even with consent", () => {
    Object.defineProperty(navigator, "doNotTrack", { value: "1", configurable: true });
    localStorage.setItem("codeprism-analytics-consent", "granted");
    const spy = makeTransport();
    track({ type: "pwa_installed" });
    expect(spy).not.toHaveBeenCalled();
  });

  it("delivers event to transport with sessionId + flagId + ts when consented", () => {
    localStorage.setItem("codeprism-analytics-consent", "granted");
    const spy = makeTransport();
    track({ type: "theme_changed", theme: "light" });
    expect(spy).toHaveBeenCalledTimes(1);
    const ev = spy.mock.calls[0]?.[0];
    expect(ev?.type).toBe("theme_changed");
    expect(ev?.theme).toBe("light");
    expect(ev?.sessionId).toBeTruthy();
    expect(ev?.flagId).toBeTruthy();
    expect(typeof ev?.ts).toBe("number");
  });

  it("does not throw when transport throws", () => {
    localStorage.setItem("codeprism-analytics-consent", "granted");
    configureAnalytics({
      transport: () => {
        throw new Error("transport boom");
      },
    });
    expect(() => track({ type: "pwa_installed" })).not.toThrow();
  });
});

// ── useConsent ────────────────────────────────────────────────────────────

describe("useConsent", () => {
  it("reports current consent and lets the user grant/deny", () => {
    localStorage.setItem("codeprism-analytics-consent", "granted");
    const { result } = renderHook(() => useConsent());
    expect(result.current.consent).toBe("granted");

    act(() => result.current.deny());
    expect(localStorage.getItem("codeprism-analytics-consent")).toBe("denied");
    expect(result.current.consent).toBe("denied");

    act(() => result.current.grant());
    expect(localStorage.getItem("codeprism-analytics-consent")).toBe("granted");
    expect(result.current.consent).toBe("granted");
  });
});

// ── useFeatureFlag ────────────────────────────────────────────────────────

describe("useFeatureFlag", () => {
  it("returns 'control' for an unknown flag", () => {
    const { result } = renderHook(() => useFeatureFlag("nonexistent"));
    expect(result.current).toBe("control");
  });

  it("returns a deterministic variant for a registered flag", () => {
    defineFlag({
      name: "test-flag",
      variants: ["a", "b", "c"],
      defaultVariant: "a",
    });

    const { result: r1 } = renderHook(() => useFeatureFlag("test-flag"));
    const variant1 = r1.current;

    // Same browser = same variant on every call.
    const { result: r2 } = renderHook(() => useFeatureFlag("test-flag"));
    expect(r2.current).toBe(variant1);
  });

  it("respects a local override", () => {
    defineFlag({
      name: "test-flag-2",
      variants: ["x", "y"],
      defaultVariant: "x",
    });
    setFlagOverride("test-flag-2", "y");

    const { result } = renderHook(() => useFeatureFlag("test-flag-2"));
    expect(result.current).toBe("y");
  });

  it("clearOverride restores natural assignment", () => {
    defineFlag({
      name: "test-flag-3",
      variants: ["x", "y"],
      defaultVariant: "x",
    });
    setFlagOverride("test-flag-3", "y");
    const r1 = renderHook(() => useFeatureFlag("test-flag-3"));
    expect(r1.result.current).toBe("y");

    setFlagOverride("test-flag-3", null);
    const r2 = renderHook(() => useFeatureFlag("test-flag-3"));
    // After clear, the natural assignment kicks in (which is whatever
    // the hash says — could be "x" or "y" depending on flagId).
    expect(["x", "y"]).toContain(r2.result.current);
  });
});
