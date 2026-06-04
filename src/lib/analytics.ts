"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// ── Event taxonomy ────────────────────────────────────────────────────────

export type AnalyticsEvent =
  | { type: "page_view"; path: string; locale: string }
  | { type: "lesson_completed"; lessonId: string; category: string; timeSpentSec: number }
  | { type: "achievement_unlocked"; badgeId: string; source: string }
  | { type: "favorite_toggled"; itemId: string; favorited: boolean }
  | { type: "search_performed"; query: string; resultsCount: number }
  | { type: "playback_speed_changed"; speed: number }
  | { type: "theme_changed"; theme: "light" | "dark" | "auto" }
  | { type: "locale_switched"; from: string; to: string }
  | { type: "pwa_installed" }
  | { type: "pwa_install_dismissed" }
  | { type: "sw_updated" }
  | { type: "error"; message: string; stack?: string };

export type EnrichedEvent = AnalyticsEvent & {
  sessionId: string;
  flagId: string;
  ts: number;
};

// ── Storage keys ──────────────────────────────────────────────────────────

const CONSENT_KEY = "codeprism-analytics-consent";
const SESSION_KEY = "codeprism-session-id";
const FLAG_ID_KEY = "codeprism-flag-id";
const FLAG_OVERRIDE_PREFIX = "codeprism-flag-override-";

// ── Consent ───────────────────────────────────────────────────────────────

export type Consent = "granted" | "denied" | "unknown";

function readStoredConsent(): Consent {
  if (typeof window === "undefined") return "unknown";
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : "unknown";
  } catch {
    return "unknown";
  }
}

function writeStoredConsent(c: Consent): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, c);
  } catch {
    // localStorage blocked — best effort.
  }
}

/** Respects the DNT header. All major browsers expose it on `navigator`. */
export function isDNTEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    navigator.doNotTrack === "1" ||
    (navigator as { msDoNotTrack?: string }).msDoNotTrack === "1" ||
    (window as { doNotTrack?: string }).doNotTrack === "1"
  );
}

// ── Hot-path caches ──────────────────────────────────────────────────────
//
// `track()` may be called many times per second (e.g. a slider scrub firing
// `playback_speed_changed`). Reading localStorage / sessionStorage / navigator
// on every call is expensive on mobile. Cache the values, populate lazily,
// and invalidate on the rare events that change them.

let cachedDnt: boolean | null = null;
let cachedConsentVal: Consent | null = null;
let cachedFlagIdVal: string | null = null;

function getCachedDnt(): boolean {
  if (cachedDnt === null) cachedDnt = isDNTEnabled();
  return cachedDnt;
}

function getCachedConsent(): Consent {
  if (cachedConsentVal === null) cachedConsentVal = readStoredConsent();
  return cachedConsentVal;
}

function getCachedFlagId(): string {
  if (cachedFlagIdVal === null) cachedFlagIdVal = getFlagId();
  return cachedFlagIdVal;
}

// Invalidate caches when another tab flips consent or flag-id. Same-tab
// changes go through `setConsent()` which clears `cachedConsentVal` directly.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === CONSENT_KEY) cachedConsentVal = null;
    if (e.key === FLAG_ID_KEY) cachedFlagIdVal = null;
  });
}

/**
 * Test-only helper. Resets all module-level caches so each test starts
 * with a clean slate. Production code should never call this — caches
 * are kept warm for the lifetime of the page in real usage.
 */
export function __resetAnalyticsCachesForTesting(): void {
  cachedDnt = null;
  cachedConsentVal = null;
  cachedFlagIdVal = null;
  cachedConsent = "unknown";
}

// ── Session + flag IDs ────────────────────────────────────────────────────

/** Per-tab session ID (sessionStorage). For event correlation. */
function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      // 12 random chars + 8 base36 timestamp = 20 chars total.
      // Math.random() is fine here (not crypto-secure) because session
      // ids are only used for event correlation, never for security.
      id = Math.random().toString(36).slice(2, 14) + Date.now().toString(36);
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "ssr";
  }
}

/** Stable per-browser ID (localStorage). For A/B variant assignment. */
function getFlagId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = localStorage.getItem(FLAG_ID_KEY);
    if (!id) {
      id = Math.random().toString(36).slice(2, 14);
      localStorage.setItem(FLAG_ID_KEY, id);
    }
    return id;
  } catch {
    return "ssr";
  }
}

// ── Transport ─────────────────────────────────────────────────────────────

export type Transport = (event: EnrichedEvent) => void;

/** Dev: log to console. Production: noop unless transport configured. */
export function consoleTransport(event: EnrichedEvent): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(`[analytics] ${event.type}`, event);
  }
}

function noopTransport(_event: EnrichedEvent): void {
  /* no-op */
}

/** PostHog — calls /capture/ directly, no SDK required. */
export function posthogTransport(
  apiKey: string,
  host = "https://app.posthog.com",
): Transport {
  return (event) => {
    try {
      void fetch(`${host}/capture/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          event: event.type,
          distinct_id: event.flagId,
          properties: event,
          timestamp: new Date(event.ts).toISOString(),
        }),
        keepalive: true,
      });
    } catch {
      // Analytics must never break the app.
    }
  };
}

/** Umami — calls /api/send directly. */
export function umamiTransport(
  websiteId: string,
  host = "https://analytics.umami.is",
): Transport {
  return (event) => {
    try {
      void fetch(`${host}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          website: websiteId,
          name: event.type,
          data: event,
        }),
        keepalive: true,
      });
    } catch {
      // ignore
    }
  };
}

let activeTransport: Transport = noopTransport;

/** Configure the analytics transport. Call once at app bootstrap. */
export function configureAnalytics(opts: { transport: Transport }): void {
  activeTransport = opts.transport;
}

// ── track() ───────────────────────────────────────────────────────────────

/**
 * Send an event. No-op if DNT is on or consent is not "granted".
 * Enriches with sessionId + flagId + timestamp before delivery.
 */
export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  if (getCachedDnt()) return;
  if (getCachedConsent() !== "granted") return;

  const enriched: EnrichedEvent = {
    ...event,
    sessionId: getSessionId(),
    flagId: getCachedFlagId(),
    ts: Date.now(),
  };

  try {
    activeTransport(enriched);
  } catch {
    // Last-ditch guard: a buggy transport must not crash the app.
  }
}

// ── Consent management ────────────────────────────────────────────────────

const consentListeners = new Set<() => void>();
let cachedConsent: Consent = "unknown";

export function getConsent(): Consent {
  // Hot-path cache wins when set; falls back to disk on first read.
  if (cachedConsentVal !== null) return cachedConsentVal;
  if (cachedConsent === "unknown" && typeof window !== "undefined") {
    cachedConsent = readStoredConsent();
    cachedConsentVal = cachedConsent;
  }
  return cachedConsent;
}

export function setConsent(c: "granted" | "denied"): void {
  writeStoredConsent(c);
  cachedConsent = c;
  cachedConsentVal = c;
  for (const l of consentListeners) l();
}

function subscribeConsent(listener: () => void): () => void {
  consentListeners.add(listener);
  return () => {
    consentListeners.delete(listener);
  };
}

/** React hook: current consent state + grant/deny actions. */
export function useConsent(): {
  consent: Consent;
  grant: () => void;
  deny: () => void;
  loaded: boolean;
} {
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsentState] = useState<Consent>("unknown");

  useEffect(() => {
    setConsentState(readStoredConsent());
    setLoaded(true);
    const unsub = subscribeConsent(() => {
      setConsentState(readStoredConsent());
    });
    return unsub;
  }, []);

  return {
    consent,
    grant: () => setConsent("granted"),
    deny: () => setConsent("denied"),
    loaded,
  };
}

// ── Feature flags / A/B experiments ──────────────────────────────────────

type FlagDef = {
  name: string;
  variants: readonly string[];
  defaultVariant: string;
};

const flagRegistry = new Map<string, FlagDef>();

/** Register a feature flag. Call at module top level, before useFeatureFlag. */
export function defineFlag<K extends string>(flag: {
  name: K;
  variants: readonly string[];
  defaultVariant: string;
}): void {
  flagRegistry.set(flag.name, flag as FlagDef);
}

function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Hash-based variant assignment — stable per flagId, uniform distribution. */
function assignVariant(name: string, def: FlagDef): string {
  const flagId = getCachedFlagId();
  const idx = djb2(`${flagId}:${name}`) % def.variants.length;
  return def.variants[idx] ?? def.defaultVariant;
}

/**
 * Read the variant for a flag. Pure function — safe to call on the server
 * (returns "control" since localStorage is unavailable) and on the client.
 */
function readVariant(name: string): string {
  if (typeof window === "undefined") return "control";
  const def = flagRegistry.get(name);
  if (!def) return "control";
  try {
    const override = localStorage.getItem(FLAG_OVERRIDE_PREFIX + name);
    if (override && def.variants.includes(override)) return override;
  } catch {
    // localStorage blocked — fall through to natural assignment.
  }
  return assignVariant(name, def);
}

/**
 * Returns the assigned variant for a flag. Stable per browser, no flash of
 * "control" on first render (the variant is computed synchronously via
 * `useSyncExternalStore`'s client snapshot).
 *
 * On the server, the server snapshot returns "control" so SSR matches the
 * pre-hydration render. The client snapshot then returns the real variant
 * for hydration, and React 18 reconciles without a flash or a warning.
 */
export function useFeatureFlag(name: string): string {
  return useSyncExternalStore(
    // No-op subscribe: variant is stable for the session. Defining it inline
    // would re-subscribe on every render; module-level keeps it stable.
    NOOP_SUBSCRIBE,
    () => readVariant(name),
    () => "control", // server snapshot
  );
}

const NOOP_SUBSCRIBE = (): (() => void) => () => {};

/** Manually set a flag override. Pass null to clear. */
export function setFlagOverride(name: string, variant: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const key = FLAG_OVERRIDE_PREFIX + name;
    if (variant === null) localStorage.removeItem(key);
    else localStorage.setItem(key, variant);
  } catch {
    // ignore
  }
}

// ── Built-in flags ────────────────────────────────────────────────────────
//
// Register your A/B experiments here. Variants are deterministically
// assigned per browser via `getFlagId()`. Override at runtime with
// `setFlagOverride("flag-name", "variant")` or in DevTools:
//   localStorage.setItem("codeprism-flag-override-foo", "show")

defineFlag({
  name: "show-step-counter",
  variants: ["control", "show"],
  defaultVariant: "control",
});

defineFlag({
  name: "new-comparison-view",
  variants: ["control", "redesign"],
  defaultVariant: "control",
});

defineFlag({
  name: "achievement-celebration",
  variants: ["control", "confetti"],
  defaultVariant: "control",
});
