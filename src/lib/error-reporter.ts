"use client";

/**
 * Lightweight error reporting — Sentry-compatible, no SDK required.
 *
 * Captures uncaught errors (`window.error`, `unhandledrejection`) and
 * React component errors (via `ErrorBoundary.componentDidCatch`), then
 * forwards to a pluggable transport. The default transport is a noop;
 * configure `sentryTransport()` at app bootstrap to enable real reporting.
 *
 * Privacy:
 *   - Errors respect the same consent gate as analytics (GDPR).
 *   - DNT (Do Not Track) blocks all reports.
 *   - No PII is sent unless explicitly added to `context.user`.
 *
 * Why custom (instead of `@sentry/nextjs`):
 *   - Zero new deps (~50KB savings gzipped)
 *   - Same lightweight pattern as the rest of the codebase
 *   - Works with self-hosted Sentry, Sentry SaaS, or any
 *     Sentry-compatible HTTP endpoint
 *
 * Migrating to `@sentry/nextjs` later:
 *   - Just replace `configureErrorReporting({ transport: sentryTransport(dsn) })`
 *     with `Sentry.init({ dsn, ... })`. The call sites (`reportError`,
 *     `installGlobalErrorHandlers`) stay the same.
 */

import { getConsent, isDNTEnabled, track } from "./analytics";

// ── Types ────────────────────────────────────────────────────────────────

export type ErrorContext = {
  /** URL or filename where the error originated. */
  url?: string;
  /** Tags to attach (e.g. "react-boundary", "window", "promise"). */
  tags?: Record<string, string>;
  /** Extra debug context (e.g. componentStack, breadcrumb). */
  extra?: Record<string, unknown>;
  /** User identification. Avoid PII — prefer opaque IDs. */
  user?: { id?: string };
};

export type ErrorTransport = (
  error: Error,
  context?: ErrorContext,
) => void | Promise<void>;

// ── Default transports ──────────────────────────────────────────────────

function noopTransport(_error: Error, _context?: ErrorContext): void {
  /* no-op */
}

/** Dev: log to console. Export so users can wire it up explicitly. */
export function consoleTransport(error: Error, context?: ErrorContext): void {
  if (process.env.NODE_ENV === "development") {
    console.error("[error-reporter]", error, context);
  }
}

// ── Sentry transport (lightweight HTTP) ──────────────────────────────────

interface ParsedDsn {
  protocol: "http" | "https";
  key: string;
  host: string;
  projectId: string;
}

function parseDsn(dsn: string): ParsedDsn {
  const match = dsn.match(/^(https?):\/\/([^@]+)@([^/]+)\/(.+)$/);
  if (!match) throw new Error(`Invalid Sentry DSN: ${dsn}`);
  return {
    protocol: match[1] as "http" | "https",
    key: match[2],
    host: match[3],
    projectId: match[4],
  };
}

interface SentryFrame {
  function: string;
  filename: string;
  lineno: number;
  colno: number;
}

/**
 * Parse a V8-style stack trace into Sentry frame format.
 * Input:  "at funcName (file.js:10:5)"
 * Output: { function: "funcName", filename: "file.js", lineno: 10, colno: 5 }
 */
export function parseStackTrace(
  stack: string | undefined,
): { frames: SentryFrame[] } | undefined {
  if (!stack) return undefined;
  const lines = stack.split("\n").slice(1); // skip the "Error: msg" header
  const frames: SentryFrame[] = [];
  for (const line of lines) {
    const m = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);
    if (!m) continue;
    const [, functionName, filename, lineno, colno] = m;
    frames.push({
      function: functionName?.trim() || "?",
      filename: filename.trim(),
      lineno: parseInt(lineno, 10),
      colno: parseInt(colno, 10),
    });
  }
  if (frames.length === 0) return undefined;
  // Sentry expects frames in chronological order (oldest first).
  return { frames: frames.reverse() };
}

function generateEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  // Fallback: 16 random bytes encoded as hex.
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface SentryTransportOptions {
  release?: string;
  environment?: string;
  /** Sent in the `sdk.version` field. Defaults to "1.0.0". */
  appVersion?: string;
  /**
   * Origin used to build `abs_path` on each stack frame (e.g. the result
   * of `window.location.origin`). Sentry needs a full URL to match uploaded
   * source maps. Defaults to the current page's origin at transport
   * construction time, captured once.
   */
  origin?: string;
}

/**
 * Builds a Sentry-compatible transport. Uses the legacy `/store/` endpoint
 * with a JSON body — no envelope format, no SDK. Works with Sentry SaaS,
 * self-hosted Sentry, and most Sentry-compatible backends.
 */
export function sentryTransport(
  dsn: string,
  options: SentryTransportOptions = {},
): ErrorTransport {
  const { protocol, key, host, projectId } = parseDsn(dsn);
  const url = `${protocol}://${host}/api/${projectId}/store/`;
  const authHeader = [
    "Sentry sentry_version=7",
    `sentry_key=${key}`,
    `sentry_client=codeprism/${options.appVersion ?? "1.0.0"}`,
  ].join(", ");

  // Capture the origin at construction time so the URL is stable for the
  // lifetime of the transport (not re-evaluated on every error report).
  const origin =
    options.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");

  return async (error, context) => {
    const stacktrace = parseStackTrace(error.stack);
    // Sentry needs `abs_path` (full URL) on every frame to match uploaded
    // source maps. Prefix each frame's relative filename with the origin.
    const framesWithAbsPath = stacktrace?.frames.map((f) => ({
      ...f,
      abs_path: origin ? `${origin}/${f.filename}` : f.filename,
    }));

    const event = {
      event_id: generateEventId(),
      timestamp: new Date().toISOString(),
      platform: "javascript",
      level: "error",
      sdk: { name: "codeprism", version: options.appVersion ?? "1.0.0" },
      environment: options.environment ?? "production",
      release: options.release,
      exception: {
        values: [
          {
            type: error.name || "Error",
            value: error.message,
            stacktrace: { frames: framesWithAbsPath },
          },
        ],
      },
      tags: context?.tags,
      extra: context?.extra,
      user: context?.user,
      request: context?.url ? { url: context.url } : undefined,
    };

    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sentry-Auth": authHeader,
        },
        body: JSON.stringify(event),
        keepalive: true,
      });
    } catch {
      // Intentional: error reporting must never break the app.
    }
  };
}

// ── Configuration ───────────────────────────────────────────────────────

let activeTransport: ErrorTransport = noopTransport;

/**
 * Install a custom error transport. Call once at app bootstrap:
 *   configureErrorReporting({ transport: sentryTransport(dsn) });
 */
export function configureErrorReporting(opts: {
  transport: ErrorTransport;
}): void {
  activeTransport = opts.transport;
}

// ── Public API ──────────────────────────────────────────────────────────

/**
 * Report an error. Wraps everything in try/catch so a buggy transport
 * never crashes the app. Gated by consent + DNT.
 */
export function reportError(
  error: Error | string,
  context?: ErrorContext,
): void {
  if (typeof window === "undefined") return;

  const err = typeof error === "string" ? new Error(error) : error;

  // Block if the user opted out of analytics or has DNT set.
  const blocked = isDNTEnabled() || getConsent() !== "granted";
  if (blocked) {
    // Dev fallback: log locally so devs can still see the error.
    if (process.env.NODE_ENV === "development") {
      console.error("[error-reporter] (no consent — local only)", err, context);
    }
    return;
  }

  try {
    void activeTransport(err, context);
    // Also surface in product analytics so the team can correlate
    // errors with the user journey.
    track({
      type: "error",
      message: err.message,
      stack: err.stack,
    });
  } catch {
    // ignore
  }
}

/**
 * Install `window.error` + `unhandledrejection` handlers. Returns a
 * teardown function. Call once at the app root.
 */
export function installGlobalErrorHandlers(): () => void {
  if (typeof window === "undefined") return () => {};

  const onError = (event: ErrorEvent) => {
    reportError(event.error ?? new Error(event.message), {
      url: event.filename,
      tags: { source: "window.error" },
      extra: {
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  };

  const onRejection = (event: PromiseRejectionEvent) => {
    const err =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
    reportError(err, {
      tags: { source: "unhandledrejection" },
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
